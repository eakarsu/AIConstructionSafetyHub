import React from 'react';
import CrudTable from '../components/CrudTable';
import { trainingsApi } from '../services/api';

export default function TrainingsPage() {
  return (
    <CrudTable
      title="Trainings"
      subtitle="Mandatory and elective safety training: OSHA 10/30, NCCCO, NFPA 70E, and more."
      api={trainingsApi}
      defaults={{ mandatory: false, attendee_count: 0, completion_rate: 0 }}
      columns={[
        { key: 'training_id', label: 'Training ID' },
        { key: 'course', label: 'Course' },
        { key: 'instructor', label: 'Instructor' },
        { key: 'scheduled_for', label: 'Scheduled', type: 'datetime' },
        { key: 'attendee_count', label: 'Attendees', type: 'number' },
        { key: 'mandatory', label: 'Mandatory?', type: 'boolean' },
        { key: 'completion_rate', label: 'Completion %', type: 'number' },
      ]}
    />
  );
}
