const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('subcontractors', [
  { name: 'sub_id' },
  { name: 'parent_contractor' },
  { name: 'name' },
  { name: 'scope' },
  { name: 'license_no' },
  { name: 'status' },
]);
