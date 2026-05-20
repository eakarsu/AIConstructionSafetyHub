import React from 'react';
import CrudTable from '../components/CrudTable';
import { inspectionsApi } from '../services/api';

export default function InspectionsPage() {
  return (
    <CrudTable
      title="Inspections"
      subtitle="Weekly, monthly, and OSHA regulatory inspections."
      api={inspectionsApi}
      defaults={{ passed: true, score: 90, type: 'weekly' }}
      columns={[
        { key: 'inspection_id', label: 'Inspection ID' },
        { key: 'site', label: 'Site' },
        { key: 'inspector', label: 'Inspector' },
        { key: 'type', label: 'Type', type: 'select', options: ['weekly','monthly','regulatory','pre-task','focused'] },
        { key: 'score', label: 'Score', type: 'number' },
        { key: 'passed', label: 'Passed?', type: 'boolean' },
        { key: 'performed_at', label: 'Performed', type: 'datetime' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
