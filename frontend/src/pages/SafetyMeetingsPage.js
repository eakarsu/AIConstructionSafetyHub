import React from 'react';
import CrudTable from '../components/CrudTable';
import { safetyMeetingsApi } from '../services/api';

export default function SafetyMeetingsPage() {
  return (
    <CrudTable
      title="Safety Meetings"
      subtitle="Toolbox talks, weekly safety reviews, and crew meetings."
      api={safetyMeetingsApi}
      defaults={{ completed: false }}
      columns={[
        { key: 'meeting_id', label: 'Meeting ID' },
        { key: 'site', label: 'Site' },
        { key: 'topic', label: 'Topic' },
        { key: 'attendees', label: 'Attendees', type: 'textarea' },
        { key: 'duration_min', label: 'Duration (min)', type: 'number' },
        { key: 'scheduled_for', label: 'Scheduled For', type: 'datetime' },
        { key: 'completed', label: 'Completed', type: 'boolean' },
      ]}
    />
  );
}
