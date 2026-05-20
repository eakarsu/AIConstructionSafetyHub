const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('incidents', [
  { name: 'incident_id' },
  { name: 'site' },
  { name: 'type' },
  { name: 'severity' },
  { name: 'injury_reported' },
  { name: 'occurred_at' },
  { name: 'status' },
  { name: 'description' },
]);
