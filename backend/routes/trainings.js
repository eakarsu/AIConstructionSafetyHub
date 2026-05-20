const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('trainings', [
  { name: 'training_id' },
  { name: 'course' },
  { name: 'instructor' },
  { name: 'scheduled_for' },
  { name: 'attendee_count' },
  { name: 'mandatory' },
  { name: 'completion_rate' },
]);
