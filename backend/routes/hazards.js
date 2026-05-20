const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('hazards', [
  { name: 'hazard_id' },
  { name: 'site' },
  { name: 'description' },
  { name: 'severity' },
  { name: 'control_measure' },
  { name: 'reported_by' },
  { name: 'status' },
]);
