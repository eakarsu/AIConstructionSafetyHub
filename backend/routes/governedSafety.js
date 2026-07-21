'use strict';
const express = require('express');
const pool = require('../config/database');
const workflow = require('../services/safetyWorkflow');
const router = express.Router();

function actor(req) { return { id: Number(req.user.id), tenantId: req.user.tenant_id, role: req.user.role }; }
async function inTransaction(handler) {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await handler(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
async function event(client, user, hazardId, type, payload) {
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [user.tenantId]);
  const previousHash = (await client.query('SELECT event_hash FROM safety_events WHERE tenant_id=$1 ORDER BY id DESC LIMIT 1', [user.tenantId])).rows[0]?.event_hash || null;
  const value = { hazardId, type, actorId: user.id, payload, occurredAt: new Date().toISOString() };
  await client.query(
    `INSERT INTO safety_events(tenant_id, hazard_id, event_type, actor_user_id, payload, previous_hash, event_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [user.tenantId, hazardId, type, user.id, value, previousHash, workflow.eventHash(previousHash, value)]
  );
}

router.post('/observations', async (req, res, next) => {
  try {
    const user = actor(req);
    workflow.assertRole(user, ['worker', 'safety_officer', 'admin']);
    const value = workflow.normalizeObservation(req.body);
    const row = await inTransaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO governed_safety_hazards
          (tenant_id, site_key, source_record_id, source_sha256, device_id, rule_set_version, hazard_code,
           description, worker_pseudonym, locale, likelihood, consequence, risk_score, risk_band,
           captured_at, received_at, latitude, longitude, accuracy_m, degraded_mode, degraded_reason, reported_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),$16,$17,$18,$19,$20,$21)
         ON CONFLICT (tenant_id, source_record_id) DO NOTHING RETURNING *`,
        [user.tenantId, value.siteKey, value.sourceRecordId, value.sourceSha256, value.deviceId,
          value.ruleSetVersion, value.hazardCode, value.description, value.workerPseudonym, value.locale,
          value.likelihood, value.consequence, value.riskScore, value.riskBand, value.capturedAt,
          value.latitude, value.longitude, value.accuracyM, value.degradedMode, value.degradedReason, user.id]
      );
      if (!inserted.rows[0]) { const error = new Error('sourceRecordId already synchronized'); error.statusCode = 409; throw error; }
      await event(client, user, inserted.rows[0].id, 'hazard.observed', value);
      return inserted.rows[0];
    });
    res.status(201).json(row);
  } catch (error) { next(error); }
});

router.post('/hazards/:id/actions', async (req, res, next) => {
  try {
    const user = actor(req); workflow.assertRole(user, ['safety_officer', 'admin']);
    const description = String(req.body.description || '').trim();
    const ownerPseudonym = String(req.body.ownerPseudonym || '').trim();
    const dueAt = new Date(req.body.dueAt);
    if (description.length < 10 || !ownerPseudonym || Number.isNaN(dueAt.getTime())) return res.status(422).json({ error: 'description (10+ chars), ownerPseudonym and valid dueAt are required' });
    const row = await inTransaction(async (client) => {
      const hazard = (await client.query('SELECT * FROM governed_safety_hazards WHERE id=$1 AND tenant_id=$2 FOR UPDATE', [req.params.id, user.tenantId])).rows[0];
      if (!hazard) return null;
      if (hazard.status === 'closed') { const e = new Error('closed hazard cannot receive actions'); e.statusCode = 409; throw e; }
      const inserted = (await client.query(
        `INSERT INTO safety_corrective_actions(tenant_id, hazard_id, description, owner_pseudonym, due_at, created_by)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [user.tenantId, hazard.id, description, ownerPseudonym, dueAt, user.id]
      )).rows[0];
      await client.query("UPDATE governed_safety_hazards SET status='control_pending', updated_at=NOW() WHERE id=$1", [hazard.id]);
      await event(client, user, hazard.id, 'corrective_action.assigned', { actionId: inserted.id, description, ownerPseudonym, dueAt });
      return inserted;
    });
    if (!row) return res.status(404).json({ error: 'hazard_not_found' });
    res.status(201).json(row);
  } catch (error) { next(error); }
});

router.post('/actions/:id/complete', async (req, res, next) => {
  try {
    const user = actor(req); workflow.assertRole(user, ['safety_officer', 'admin']);
    const evidenceSha256 = workflow.digest(req.body.evidenceSha256, 'evidenceSha256');
    const note = String(req.body.note || '').trim();
    if (note.length < 10) return res.status(422).json({ error: 'completion note must contain at least 10 characters' });
    const row = await inTransaction(async (client) => {
      const action = (await client.query('SELECT * FROM safety_corrective_actions WHERE id=$1 AND tenant_id=$2 FOR UPDATE', [req.params.id, user.tenantId])).rows[0];
      if (!action) return null;
      if (action.status !== 'open') { const e = new Error('action already completed'); e.statusCode = 409; throw e; }
      const updated = (await client.query(
        `UPDATE safety_corrective_actions SET status='completed', completion_evidence_sha256=$1,
         completion_note=$2, completed_by=$3, completed_at=NOW() WHERE id=$4 RETURNING *`,
        [evidenceSha256, note, user.id, action.id]
      )).rows[0];
      const open = Number((await client.query("SELECT COUNT(*) count FROM safety_corrective_actions WHERE hazard_id=$1 AND tenant_id=$2 AND status<>'completed'", [action.hazard_id, user.tenantId])).rows[0].count);
      if (open === 0) await client.query("UPDATE governed_safety_hazards SET status='closure_pending', updated_at=NOW() WHERE id=$1", [action.hazard_id]);
      await event(client, user, action.hazard_id, 'corrective_action.completed', { actionId: action.id, evidenceSha256, note });
      return updated;
    });
    if (!row) return res.status(404).json({ error: 'action_not_found' });
    res.json(row);
  } catch (error) { next(error); }
});

router.post('/hazards/:id/closure-decisions', async (req, res, next) => {
  try {
    const user = actor(req); workflow.assertRole(user, ['safety_officer', 'admin']);
    const decision = String(req.body.decision || '').toLowerCase();
    const rationale = String(req.body.rationale || '').trim();
    if (!['verified', 'rejected'].includes(decision) || rationale.length < 10) return res.status(422).json({ error: 'decision must be verified/rejected and rationale must be 10+ characters' });
    const row = await inTransaction(async (client) => {
      const hazard = (await client.query('SELECT * FROM governed_safety_hazards WHERE id=$1 AND tenant_id=$2 FOR UPDATE', [req.params.id, user.tenantId])).rows[0];
      if (!hazard) return null;
      if (hazard.status !== 'closure_pending') { const e = new Error('hazard is not ready for closure review'); e.statusCode = 409; throw e; }
      if (Number(hazard.reported_by) === user.id) { const e = new Error('closure reviewer must be independent from reporter'); e.statusCode = 403; throw e; }
      const incomplete = Number((await client.query("SELECT COUNT(*) count FROM safety_corrective_actions WHERE hazard_id=$1 AND tenant_id=$2 AND status<>'completed'", [hazard.id, user.tenantId])).rows[0].count);
      if (incomplete) { const e = new Error('all corrective actions require evidence before closure'); e.statusCode = 409; throw e; }
      const review = (await client.query(
        `INSERT INTO safety_closure_reviews(tenant_id, hazard_id, decision, rationale, reviewer_user_id)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`, [user.tenantId, hazard.id, decision, rationale, user.id]
      )).rows[0];
      await client.query('UPDATE governed_safety_hazards SET status=$1, updated_at=NOW() WHERE id=$2', [decision === 'verified' ? 'closed' : 'control_pending', hazard.id]);
      await event(client, user, hazard.id, `closure.${decision}`, { reviewId: review.id, rationale });
      return review;
    });
    if (!row) return res.status(404).json({ error: 'hazard_not_found' });
    res.status(201).json(row);
  } catch (error) { next(error); }
});

router.post('/evaluations/alerts', (req, res, next) => {
  try { const user = actor(req); workflow.assertRole(user, ['safety_officer', 'admin']); res.json(workflow.evaluateAlerts(req.body.cases)); }
  catch (error) { next(error); }
});
router.get('/hazards/:id', async (req, res, next) => {
  try {
    const user = actor(req);
    const hazard = (await pool.query('SELECT * FROM governed_safety_hazards WHERE id=$1 AND tenant_id=$2', [req.params.id, user.tenantId])).rows[0];
    if (!hazard) return res.status(404).json({ error: 'hazard_not_found' });
    const [actions, reviews, events] = await Promise.all([
      pool.query('SELECT * FROM safety_corrective_actions WHERE hazard_id=$1 AND tenant_id=$2 ORDER BY id', [hazard.id, user.tenantId]),
      pool.query('SELECT * FROM safety_closure_reviews WHERE hazard_id=$1 AND tenant_id=$2 ORDER BY id', [hazard.id, user.tenantId]),
      pool.query('SELECT * FROM safety_events WHERE hazard_id=$1 AND tenant_id=$2 ORDER BY id', [hazard.id, user.tenantId]),
    ]);
    res.json({ hazard, correctiveActions: actions.rows, closureReviews: reviews.rows, events: events.rows });
  } catch (error) { next(error); }
});

router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.code === '23505') return res.status(409).json({ error: 'duplicate_record' });
  console.error('[governed-safety]', error.message);
  res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'safety_workflow_failed' });
});
module.exports = router;
