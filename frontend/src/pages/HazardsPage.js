import React from 'react';
import CrudTable from '../components/CrudTable';
import { hazardsApi } from '../services/api';

export default function HazardsPage() {
  return (
    <CrudTable
      title="Hazards"
      subtitle="Reported site hazards, severity, and current control measure."
      api={hazardsApi}
      defaults={{ status: 'open', severity: 'medium' }}
      columns={[
        { key: 'hazard_id', label: 'Hazard ID' },
        { key: 'site', label: 'Site' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'severity', label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'control_measure', label: 'Control Measure', type: 'textarea' },
        { key: 'reported_by', label: 'Reported By' },
        { key: 'status', label: 'Status', type: 'select', options: ['open','mitigated','closed'] },
      ]}
    />
  );
}
