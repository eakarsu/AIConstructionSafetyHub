import React from 'react';
import CrudTable from '../components/CrudTable';
import { contractorsApi } from '../services/api';

export default function ContractorsPage() {
  return (
    <CrudTable
      title="Contractors"
      subtitle="Approved contractor roster with insurance, license, and safety score."
      api={contractorsApi}
      defaults={{ status: 'approved' }}
      columns={[
        { key: 'contractor_id', label: 'Contractor ID' },
        { key: 'name', label: 'Name' },
        { key: 'license_no', label: 'License No' },
        { key: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
        { key: 'safety_score', label: 'Safety Score', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: ['approved','probation','blocked'] },
      ]}
    />
  );
}
