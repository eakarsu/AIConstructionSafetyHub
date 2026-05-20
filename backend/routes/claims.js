const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('claims', [
  { name: 'claim_id' },
  { name: 'type' },
  { name: 'claimant' },
  { name: 'status' },
  { name: 'opened_at' },
  { name: 'amount_usd' },
]);
