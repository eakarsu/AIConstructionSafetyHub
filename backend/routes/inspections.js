const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('inspections', [
  { name: 'inspection_id' },
  { name: 'site' },
  { name: 'inspector' },
  { name: 'type' },
  { name: 'score' },
  { name: 'passed' },
  { name: 'performed_at' },
  { name: 'notes' },
]);
