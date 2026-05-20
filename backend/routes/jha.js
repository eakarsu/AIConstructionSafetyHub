const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('jha', [
  { name: 'jha_id' },
  { name: 'site' },
  { name: 'task' },
  { name: 'hazards' },
  { name: 'controls' },
  { name: 'performed_by' },
  { name: 'performed_at' },
  { name: 'signed_off' },
]);
