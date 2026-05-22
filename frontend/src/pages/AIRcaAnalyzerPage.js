import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiRcaAnalyzer } from '../services/api';

export default function AIRcaAnalyzerPage() {
  return (
    <AiPanel
      feature="rca-analyzer"
      title="AI: Root-Cause Analysis (5-Whys + Fishbone)"
      subtitle="Structured 5-Whys and fishbone (Ishikawa) decomposition with corrective action plan."
      fields={[
        { key: 'site', label: 'Site' },
        { key: 'type', label: 'Type', type: 'select', options: ['fall','struck-by','electrocution','caught-in','other'] },
        { key: 'severity', label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'occurred_at', label: 'Occurred At' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      initial={{
        site: 'Riverside Tower Phase II',
        type: 'fall',
        severity: 'high',
        occurred_at: '2026-04-12 09:42',
        description: 'Worker fell 8 ft from leading edge while setting rebar; lanyard found stowed in harness D-ring loop.',
      }}
      onRun={(form) => aiRcaAnalyzer(form)}
    />
  );
}
