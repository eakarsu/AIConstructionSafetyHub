import React from 'react';
import CrudTable from '../components/CrudTable';
import { subcontractorsApi } from '../services/api';

export default function SubcontractorsPage() {
  return (
    <CrudTable
      title="Subcontractors"
      subtitle="Tier 2 trades rolled up to parent contractor and scope."
      api={subcontractorsApi}
      defaults={{ status: 'approved' }}
      columns={[
        { key: 'sub_id', label: 'Sub ID' },
        { key: 'parent_contractor', label: 'Parent Contractor' },
        { key: 'name', label: 'Name' },
        { key: 'scope', label: 'Scope' },
        { key: 'license_no', label: 'License No' },
        { key: 'status', label: 'Status', type: 'select', options: ['approved','probation','blocked'] },
      ]}
    />
  );
}
