import React from 'react';
import CrudTable from '../components/CrudTable';
import { sitesApi } from '../services/api';

export default function SitesPage() {
  return (
    <CrudTable
      title="Sites"
      subtitle="Active construction sites and project status."
      api={sitesApi}
      defaults={{ status: 'active', worker_count: 0 }}
      columns={[
        { key: 'site_id', label: 'Site ID' },
        { key: 'name', label: 'Name' },
        { key: 'address', label: 'Address' },
        { key: 'project_type', label: 'Project Type' },
        { key: 'status', label: 'Status', type: 'select', options: ['active','paused','closed'] },
        { key: 'supervisor', label: 'Supervisor' },
        { key: 'worker_count', label: 'Workers', type: 'number' },
      ]}
    />
  );
}
