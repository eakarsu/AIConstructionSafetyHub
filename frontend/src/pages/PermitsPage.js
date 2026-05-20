import React from 'react';
import CrudTable from '../components/CrudTable';
import { permitsApi } from '../services/api';

export default function PermitsPage() {
  return (
    <CrudTable
      title="Permits"
      subtitle="Hot-work, confined-space, excavation, and electrical work permits."
      api={permitsApi}
      defaults={{ status: 'active', type: 'hot-work' }}
      columns={[
        { key: 'permit_id', label: 'Permit ID' },
        { key: 'site', label: 'Site' },
        { key: 'type', label: 'Type', type: 'select', options: ['hot-work','confined-space','excavation','electrical'] },
        { key: 'issued_to', label: 'Issued To' },
        { key: 'valid_from', label: 'Valid From', type: 'date' },
        { key: 'valid_to', label: 'Valid To', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['active','pending','expired','closed'] },
      ]}
    />
  );
}
