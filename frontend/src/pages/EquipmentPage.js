import React from 'react';
import CrudTable from '../components/CrudTable';
import { equipmentApi } from '../services/api';

export default function EquipmentPage() {
  return (
    <CrudTable
      title="Equipment"
      subtitle="Heavy equipment registry, manufacturer, and inspection status."
      api={equipmentApi}
      defaults={{ status: 'operational' }}
      columns={[
        { key: 'equipment_id', label: 'Equip ID' },
        { key: 'type', label: 'Type' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'serial', label: 'Serial' },
        { key: 'site', label: 'Site' },
        { key: 'status', label: 'Status', type: 'select', options: ['operational','maintenance','decommissioned'] },
        { key: 'last_inspected', label: 'Last Inspected', type: 'date' },
      ]}
    />
  );
}
