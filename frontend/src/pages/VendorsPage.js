import React from 'react';
import CrudTable from '../components/CrudTable';
import { vendorsApi } from '../services/api';

export default function VendorsPage() {
  return (
    <CrudTable
      title="Vendors"
      subtitle="Approved vendor list with W9, insurance, and approval status."
      api={vendorsApi}
      defaults={{ status: 'approved', w9_on_file: false }}
      columns={[
        { key: 'vendor_id', label: 'Vendor ID' },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { key: 'w9_on_file', label: 'W9 On File', type: 'boolean' },
        { key: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['approved','under_review','blocked'] },
      ]}
    />
  );
}
