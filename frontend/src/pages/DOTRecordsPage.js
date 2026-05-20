import React from 'react';
import CrudTable from '../components/CrudTable';
import { dotRecordsApi } from '../services/api';

export default function DOTRecordsPage() {
  return (
    <CrudTable
      title="DOT Records"
      subtitle="CDL drivers, medical card, HOS logs, and violations."
      api={dotRecordsApi}
      columns={[
        { key: 'record_id', label: 'Record ID' },
        { key: 'driver', label: 'Driver' },
        { key: 'cdl_class', label: 'CDL Class', type: 'select', options: ['A','B','C'] },
        { key: 'medical_expires', label: 'Medical Expires', type: 'date' },
        { key: 'last_hours_log', label: 'Last Hours Log', type: 'datetime' },
        { key: 'violations_count', label: 'Violations', type: 'number' },
      ]}
    />
  );
}
