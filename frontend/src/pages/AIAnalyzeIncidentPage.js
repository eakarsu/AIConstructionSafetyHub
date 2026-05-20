import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiAnalyzeIncident } from '../services/api';

export default function AIAnalyzeIncidentPage() {
  return (
    <AiPanel
      feature="analyze-incident"
      title="AI: Analyze Incident"
      subtitle="Root cause analysis, OSHA citation risk, remediation, and prevention plan."
      fields={[
        { key: 'site', label: 'Site' },
        { key: 'type', label: 'Type', type: 'select', options: ['fall','struck-by','electrocution','caught-in','other'] },
        { key: 'severity', label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'injury_reported', label: 'Injury Reported?', type: 'select', options: ['true','false'] },
        { key: 'occurred_at', label: 'Occurred At' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      initial={{
        site: 'Riverside Tower Phase II',
        type: 'fall',
        severity: 'high',
        injury_reported: 'true',
        occurred_at: '2026-04-12 09:42',
        description: 'Worker fell 8 ft from leading edge; harness was unanchored. PFAS lanyard found stowed in harness D-ring loop.',
      }}
      onRun={(form) => aiAnalyzeIncident({ ...form, injury_reported: form.injury_reported === 'true' })}
    />
  );
}
