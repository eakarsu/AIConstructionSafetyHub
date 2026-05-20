import React from 'react';
import CrudTable from '../components/CrudTable';
import { ppeInventoryApi } from '../services/api';

export default function PPEInventoryPage() {
  return (
    <CrudTable
      title="PPE Inventory"
      subtitle="Site-level PPE stock, reorder thresholds, and audit history."
      api={ppeInventoryApi}
      defaults={{ status: 'in-stock' }}
      columns={[
        { key: 'item_id', label: 'Item ID' },
        { key: 'site', label: 'Site' },
        { key: 'ppe_type', label: 'PPE Type' },
        { key: 'sku', label: 'SKU' },
        { key: 'qty', label: 'Qty', type: 'number' },
        { key: 'threshold_min', label: 'Min Threshold', type: 'number' },
        { key: 'last_audit', label: 'Last Audit', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['in-stock','reorder','audit','out'] },
      ]}
    />
  );
}
