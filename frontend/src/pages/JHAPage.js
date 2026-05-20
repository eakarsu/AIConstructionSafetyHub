import React from 'react';
import CrudTable from '../components/CrudTable';
import { jhaApi } from '../services/api';

export default function JHAPage() {
  return (
    <CrudTable
      title="Job Hazard Analyses (JHA)"
      subtitle="Pre-task analyses with hazards, controls, and sign-off."
      api={jhaApi}
      defaults={{ signed_off: false }}
      columns={[
        { key: 'jha_id', label: 'JHA ID' },
        { key: 'site', label: 'Site' },
        { key: 'task', label: 'Task' },
        { key: 'hazards', label: 'Hazards', type: 'textarea' },
        { key: 'controls', label: 'Controls', type: 'textarea' },
        { key: 'performed_by', label: 'Performed By' },
        { key: 'performed_at', label: 'Performed At', type: 'datetime' },
        { key: 'signed_off', label: 'Signed Off', type: 'boolean' },
      ]}
    />
  );
}
