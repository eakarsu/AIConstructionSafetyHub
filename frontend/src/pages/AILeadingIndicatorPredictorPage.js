import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiLeadingIndicatorPredictor } from '../services/api';

export default function AILeadingIndicatorPredictorPage() {
  return (
    <AiPanel
      feature="leading-indicator-predictor"
      title="AI: Leading-Indicator Predictor"
      subtitle="Forecast 30-day injury risk from audits, near-miss rate, training completion, and other leading indicators."
      fields={[
        { key: 'site', label: 'Site' },
        { key: 'window_days', label: 'Window (days)', type: 'number' },
        { key: 'near_miss_count', label: 'Near-miss count', type: 'number' },
        { key: 'audit_findings_open', label: 'Open audit findings', type: 'number' },
        { key: 'training_completion_pct', label: 'Training completion %', type: 'number' },
        { key: 'toolbox_talks_completed', label: 'Toolbox talks completed', type: 'number' },
        { key: 'ppe_violations', label: 'PPE violations', type: 'number' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      initial={{
        site: 'Riverside Tower Phase II',
        window_days: 30,
        near_miss_count: 18,
        audit_findings_open: 12,
        training_completion_pct: 78,
        toolbox_talks_completed: 9,
        ppe_violations: 7,
        notes: 'Near-miss rate up 35% vs prior 30 days; 4 high-severity audit findings open >14 days.',
      }}
      onRun={(form) => aiLeadingIndicatorPredictor(form)}
    />
  );
}
