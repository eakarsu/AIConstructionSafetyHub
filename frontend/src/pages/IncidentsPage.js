import React from 'react';
import CrudTable from '../components/CrudTable';
import { incidentsApi } from '../services/api';

export default function IncidentsPage() {
  return (
    <CrudTable
      title="Incidents"
      subtitle="Site incidents categorized by OSHA Focus Four + others."
      api={incidentsApi}
      defaults={{ status: 'open', severity: 'medium', injury_reported: false }}
      columns={[
        { key: 'incident_id', label: 'Incident ID' },
        { key: 'site', label: 'Site' },
        { key: 'type', label: 'Type', type: 'select', options: ['fall','struck-by','electrocution','caught-in','other'] },
        { key: 'severity', label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'injury_reported', label: 'Injury?', type: 'boolean' },
        { key: 'occurred_at', label: 'Occurred', type: 'datetime' },
        { key: 'status', label: 'Status', type: 'select', options: ['open','investigating','closed'] },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
    />
  );
}
