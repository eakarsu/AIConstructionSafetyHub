import React from 'react';
import CrudTable from '../components/CrudTable';
import { nearMissesApi } from '../services/api';

export default function NearMissesPage() {
  return (
    <CrudTable
      title="Near Misses"
      subtitle="Track near-miss events and corrective actions; leading indicator analysis."
      api={nearMissesApi}
      columns={[
        { key: 'near_miss_id', label: 'NM ID' },
        { key: 'site', label: 'Site' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'severity_if_realized', label: 'Severity if Realized', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'reported_by', label: 'Reported By' },
        { key: 'reported_at', label: 'Reported At', type: 'datetime' },
        { key: 'action_taken', label: 'Action Taken', type: 'textarea' },
      ]}
    />
  );
}
