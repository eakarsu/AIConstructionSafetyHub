const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('vendors', [
  { name: 'vendor_id' },
  { name: 'name' },
  { name: 'category' },
  { name: 'w9_on_file' },
  { name: 'insurance_expiry' },
  { name: 'status' },
]);
