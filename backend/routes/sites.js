const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('sites', [
  { name: 'site_id' },
  { name: 'name' },
  { name: 'address' },
  { name: 'project_type' },
  { name: 'status' },
  { name: 'supervisor' },
  { name: 'worker_count' },
]);
