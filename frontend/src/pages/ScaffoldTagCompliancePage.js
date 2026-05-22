import React from 'react';
import CrudTable from '../components/CrudTable';
import { scaffoldTagComplianceApi } from '../services/api';

export default function ScaffoldTagCompliancePage() {
  return (
    <CrudTable
      title="Scaffold Tag Compliance"
      subtitle="Track scaffold tag status, inspection freshness and unresolved defects."
      api={scaffoldTagComplianceApi}
      defaults={{ tag_color: 'green', open_defects: 0, status: 'approved' }}
      columns={[
        { key: 'scaffold_id', label: 'Scaffold ID' },
        { key: 'site_name', label: 'Site' },
        { key: 'tag_color', label: 'Tag', type: 'select', options: ['green','yellow','red'] },
        { key: 'last_inspection', label: 'Last Inspection', type: 'date' },
        { key: 'competent_person', label: 'Competent Person' },
        { key: 'open_defects', label: 'Open Defects', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: ['approved','restricted','locked_out'] },
      ]}
    />
  );
}
