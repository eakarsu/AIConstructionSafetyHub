const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('contractors', [
  { name: 'contractor_id' },
  { name: 'name' },
  { name: 'license_no' },
  { name: 'insurance_expiry' },
  { name: 'safety_score' },
  { name: 'status' },
]);
