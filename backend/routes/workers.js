const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('workers', [
  { name: 'worker_id' },
  { name: 'name' },
  { name: 'role' },
  { name: 'certifications' },
  { name: 'site' },
  { name: 'status' },
  { name: 'hire_date' },
]);
