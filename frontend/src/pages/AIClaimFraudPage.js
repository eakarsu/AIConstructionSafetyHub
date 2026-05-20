import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiClaimFraud } from '../services/api';

export default function AIClaimFraudPage() {
  return (
    <AiPanel
      feature="claim-fraud"
      title="AI: Claim Fraud Likelihood"
      subtitle="Score fraud likelihood with red-flag indicators."
      fields={[
        { key: 'claim_id', label: 'Claim ID' },
        { key: 'type', label: 'Type', type: 'select', options: ['workers-comp','general-liability','auto'] },
        { key: 'claimant', label: 'Claimant' },
        { key: 'amount_usd', label: 'Amount (USD)', type: 'number' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'witnesses', label: 'Witnesses' },
        { key: 'medical_provider', label: 'Medical Provider' },
        { key: 'days_since_incident', label: 'Days From Incident to Report', type: 'number' },
      ]}
      initial={{
        claim_id: 'CLM-16007',
        type: 'workers-comp',
        claimant: 'Lacey Brown rigging strap failure',
        amount_usd: 33500,
        description: 'Claimant alleges back injury during pile-driving rigging incident.',
        witnesses: 'None present',
        medical_provider: 'New provider, prior history with other claims',
        days_since_incident: 21,
      }}
      onRun={(form) => aiClaimFraud(form)}
    />
  );
}
