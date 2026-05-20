const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('drug_tests', [
  { name: 'test_id' },
  { name: 'worker' },
  { name: 'type' },
  { name: 'result' },
  { name: 'tested_at' },
]);
