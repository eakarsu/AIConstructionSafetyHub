const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('ppe_inventory', [
  { name: 'item_id' },
  { name: 'site' },
  { name: 'ppe_type' },
  { name: 'sku' },
  { name: 'qty' },
  { name: 'threshold_min' },
  { name: 'last_audit' },
  { name: 'status' },
]);
