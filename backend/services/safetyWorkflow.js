'use strict';
const crypto = require('node:crypto');

function fail(message) { const error = new Error(message); error.statusCode = 422; throw error; }
function required(value, field, max = 255) {
  if (typeof value !== 'string' || !value.trim()) fail(`${field} is required`);
  if (value.trim().length > max) fail(`${field} exceeds ${max} characters`);
  return value.trim();
}
function digest(value, field) {
  const normalized = required(value, field, 64).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) fail(`${field} must be a SHA-256 hex digest`);
  return normalized;
}
function scale(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 5) fail(`${field} must be an integer from 1 to 5`);
  return number;
}
function riskBand(score) {
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}
function normalizeObservation(input = {}, now = new Date()) {
  const capturedAt = new Date(input.capturedAt);
  if (Number.isNaN(capturedAt.getTime()) || capturedAt > new Date(now.getTime() + 5 * 60 * 1000)) {
    fail('capturedAt must be a valid timestamp no more than five minutes in the future');
  }
  const likelihood = scale(input.likelihood, 'likelihood');
  const consequence = scale(input.consequence, 'consequence');
  const latitude = input.latitude == null ? null : Number(input.latitude);
  const longitude = input.longitude == null ? null : Number(input.longitude);
  const accuracyM = input.accuracyM == null ? null : Number(input.accuracyM);
  if (latitude != null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) fail('latitude is invalid');
  if (longitude != null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) fail('longitude is invalid');
  if (accuracyM != null && (!Number.isFinite(accuracyM) || accuracyM < 0 || accuracyM > 10000)) fail('accuracyM is invalid');
  const degradedMode = input.degradedMode === true;
  if (degradedMode && !String(input.degradedReason || '').trim()) fail('degradedReason is required in degraded mode');
  const score = likelihood * consequence;
  return {
    siteKey: required(input.siteKey, 'siteKey', 80),
    sourceRecordId: required(input.sourceRecordId, 'sourceRecordId', 160),
    sourceSha256: digest(input.sourceSha256, 'sourceSha256'),
    deviceId: required(input.deviceId, 'deviceId', 120),
    ruleSetVersion: required(input.ruleSetVersion, 'ruleSetVersion', 80),
    hazardCode: required(input.hazardCode, 'hazardCode', 80),
    description: required(input.description, 'description', 2000),
    workerPseudonym: input.workerPseudonym ? required(input.workerPseudonym, 'workerPseudonym', 120) : null,
    locale: required(input.locale || 'en-US', 'locale', 20),
    likelihood, consequence, riskScore: score, riskBand: riskBand(score), capturedAt,
    latitude, longitude, accuracyM, degradedMode,
    degradedReason: degradedMode ? String(input.degradedReason).trim() : null,
  };
}
function evaluateAlerts(cases) {
  if (!Array.isArray(cases) || cases.length === 0) fail('cases must be a non-empty array');
  let tp = 0; let fp = 0; let tn = 0; let fn = 0;
  for (const row of cases) {
    if (typeof row.predictedAlert !== 'boolean' || typeof row.actualCritical !== 'boolean') fail('each case requires boolean predictedAlert and actualCritical');
    if (row.predictedAlert && row.actualCritical) tp += 1;
    else if (row.predictedAlert) fp += 1;
    else if (row.actualCritical) fn += 1;
    else tn += 1;
  }
  return { cases: cases.length, truePositive: tp, falsePositive: fp, trueNegative: tn, falseNegative: fn,
    precision: tp + fp ? tp / (tp + fp) : null, recall: tp + fn ? tp / (tp + fn) : null };
}
function assertRole(user, roles) {
  if (!user || !roles.includes(user.role)) { const error = new Error(`requires role: ${roles.join(', ')}`); error.statusCode = 403; throw error; }
}
function eventHash(previousHash, event) {
  return crypto.createHash('sha256').update(`${previousHash || ''}|${JSON.stringify(event)}`).digest('hex');
}
module.exports = { normalizeObservation, evaluateAlerts, riskBand, digest, assertRole, eventHash };
