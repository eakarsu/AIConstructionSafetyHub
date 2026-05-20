const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('dot_records', [
  { name: 'record_id' },
  { name: 'driver' },
  { name: 'cdl_class' },
  { name: 'medical_expires' },
  { name: 'last_hours_log' },
  { name: 'violations_count' },
]);
