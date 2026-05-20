const { makeCrudRouter } = require('../services/crud');
module.exports = makeCrudRouter('safety_meetings', [
  { name: 'meeting_id' },
  { name: 'site' },
  { name: 'topic' },
  { name: 'attendees' },
  { name: 'duration_min' },
  { name: 'scheduled_for' },
  { name: 'completed' },
]);
