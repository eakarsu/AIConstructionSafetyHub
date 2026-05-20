const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('permits', [
  { name: 'permit_id' },
  { name: 'site' },
  { name: 'type' },
  { name: 'issued_to' },
  { name: 'valid_from' },
  { name: 'valid_to' },
  { name: 'status' },
]);
