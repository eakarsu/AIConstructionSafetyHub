import React from 'react';
import CrudTable from '../components/CrudTable';
import { workersApi } from '../services/api';

export default function WorkersPage() {
  return (
    <CrudTable
      title="Workers"
      subtitle="Crew roster, roles, and OSHA / NCCCO certifications."
      api={workersApi}
      defaults={{ status: 'active' }}
      columns={[
        { key: 'worker_id', label: 'Worker ID' },
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'certifications', label: 'Certifications', type: 'textarea' },
        { key: 'site', label: 'Site' },
        { key: 'status', label: 'Status', type: 'select', options: ['active','on_leave','inactive'] },
        { key: 'hire_date', label: 'Hire Date', type: 'date' },
      ]}
    />
  );
}
