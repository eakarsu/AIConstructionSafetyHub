const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('equipment', [
  { name: 'equipment_id' },
  { name: 'type' },
  { name: 'manufacturer' },
  { name: 'serial' },
  { name: 'site' },
  { name: 'status' },
  { name: 'last_inspected' },
]);
