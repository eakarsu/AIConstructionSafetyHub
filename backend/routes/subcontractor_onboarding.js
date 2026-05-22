// Subcontractor onboarding workflow: CRUD + a /advance endpoint that moves a
// record to the next stage in the canonical workflow lifecycle.
const express = require('express');
const { makeCrudRouter } = require('../services/crud');
const pool = require('../config/database');

const STAGES = ['invited', 'prequal_in_progress', 'docs_pending', 'coi_review', 'approved', 'rejected'];

const baseRouter = makeCrudRouter('subcontractor_onboarding', [
  { name: 'onboarding_id' },
  { name: 'sub_name' },
  { name: 'scope' },
  { name: 'coi_received' },
  { name: 'coi_expiry' },
  { name: 'prequal_score' },
  { name: 'msa_signed' },
  { name: 'w9_received' },
  { name: 'safety_manual_received' },
  { name: 'stage' },
  { name: 'notes' },
]);

const router = express.Router();

router.get('/stages', (req, res) => res.json({ stages: STAGES }));

router.post('/:id/advance', async (req, res) => {
  try {
    const cur = await pool.query('SELECT * FROM subcontractor_onboarding WHERE id = $1', [req.params.id]);
    if (cur.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const stage = String(cur.rows[0].stage || 'invited');
    const idx = STAGES.indexOf(stage);
    if (idx === -1) return res.status(400).json({ error: `Unknown stage: ${stage}` });
    if (stage === 'approved' || stage === 'rejected') {
      return res.status(400).json({ error: `Cannot advance from terminal stage: ${stage}` });
    }
    const next = STAGES[idx + 1];
    const r = await pool.query(
      'UPDATE subcontractor_onboarding SET stage = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [next, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use('/', baseRouter);

module.exports = router;
