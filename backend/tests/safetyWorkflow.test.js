'use strict';
const test = require('node:test'); const assert = require('node:assert/strict'); const workflow = require('../services/safetyWorkflow');
const valid = { siteKey: 'SITE-1', sourceRecordId: 'offline-1', sourceSha256: 'b'.repeat(64), deviceId: 'device-1',
  ruleSetVersion: 'rules-2026.1', hazardCode: 'FALL', description: 'Unprotected edge on level four', locale: 'en-US',
  likelihood: 4, consequence: 5, capturedAt: '2026-01-01T00:00:00Z' };
test('scores and preserves offline provenance', () => {
  const result = workflow.normalizeObservation({ ...valid, degradedMode: true, degradedReason: 'no network' }, new Date('2026-01-02'));
  assert.equal(result.riskScore, 20); assert.equal(result.riskBand, 'critical'); assert.equal(result.degradedReason, 'no network');
});
test('rejects bad spatial accuracy and unexplained degraded mode', () => {
  assert.throws(() => workflow.normalizeObservation({ ...valid, accuracyM: 20000 }, new Date('2026-01-02')), /accuracyM/);
  assert.throws(() => workflow.normalizeObservation({ ...valid, degradedMode: true }, new Date('2026-01-02')), /degradedReason/);
});
test('calculates alert precision and recall from labeled cases', () => {
  const result = workflow.evaluateAlerts([{ predictedAlert: true, actualCritical: true }, { predictedAlert: true, actualCritical: false }, { predictedAlert: false, actualCritical: true }]);
  assert.equal(result.precision, 0.5); assert.equal(result.recall, 0.5);
});
test('role and hash-chain controls are deterministic', () => {
  assert.throws(() => workflow.assertRole({ role: 'worker' }, ['safety_officer']), /requires role/);
  const first = workflow.eventHash(null, { type: 'observed' }); assert.match(first, /^[a-f0-9]{64}$/);
  assert.notEqual(first, workflow.eventHash(first, { type: 'closed' }));
});
