import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiContractorScore } from '../services/api';

export default function AIContractorScorePage() {
  return (
    <AiPanel
      feature="contractor-score"
      title="AI: Contractor Safety Score"
      subtitle="Multi-factor safety score and prequal recommendation."
      fields={[
        { key: 'name', label: 'Contractor Name' },
        { key: 'license_no', label: 'License No' },
        { key: 'emr', label: 'EMR' },
        { key: 'trir', label: 'TRIR' },
        { key: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
        { key: 'recent_incidents', label: 'Recent Incidents (12mo)', type: 'number' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      initial={{
        name: 'Liberty Demolition Services',
        license_no: 'MA-DM-1102',
        emr: '1.34',
        trir: '4.2',
        insurance_expiry: '2026-11-30',
        recent_incidents: 3,
        notes: 'Selective demolition only; one critical incident last year.',
      }}
      onRun={(form) => aiContractorScore(form)}
    />
  );
}
