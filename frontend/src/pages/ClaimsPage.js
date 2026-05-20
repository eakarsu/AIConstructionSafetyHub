import React from 'react';
import CrudTable from '../components/CrudTable';
import { claimsApi } from '../services/api';

export default function ClaimsPage() {
  return (
    <CrudTable
      title="Claims"
      subtitle="Workers-comp, general-liability, and auto claims with status and amount."
      api={claimsApi}
      defaults={{ status: 'open', type: 'workers-comp' }}
      columns={[
        { key: 'claim_id', label: 'Claim ID' },
        { key: 'type', label: 'Type', type: 'select', options: ['workers-comp','general-liability','auto'] },
        { key: 'claimant', label: 'Claimant' },
        { key: 'status', label: 'Status', type: 'select', options: ['open','in-review','closed'] },
        { key: 'opened_at', label: 'Opened At', type: 'datetime' },
        { key: 'amount_usd', label: 'Amount (USD)', type: 'number' },
      ]}
    />
  );
}
