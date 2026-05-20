const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('near_misses', [
  { name: 'near_miss_id' },
  { name: 'site' },
  { name: 'description' },
  { name: 'severity_if_realized' },
  { name: 'reported_by' },
  { name: 'reported_at' },
  { name: 'action_taken' },
]);
