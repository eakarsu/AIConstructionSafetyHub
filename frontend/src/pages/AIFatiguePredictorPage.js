import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiFatiguePredictor } from '../services/api';

export default function AIFatiguePredictorPage() {
  return (
    <AiPanel
      feature="fatigue-predictor"
      title="AI: Fatigue Predictor"
      subtitle="Forecast worker fatigue from recent hours and assignment risk."
      fields={[
        { key: 'worker', label: 'Worker' },
        { key: 'role', label: 'Role' },
        { key: 'recent_hours', label: 'Hours Worked Last 7 Days (comma list)' },
        { key: 'shift_pattern', label: 'Shift Pattern' },
        { key: 'task_risk', label: 'Current Task Risk', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      initial={{
        worker: 'Rafael Ortiz',
        role: 'TBM Operator',
        recent_hours: '12, 12, 10, 12, 14, 12, 8',
        shift_pattern: 'Night shift, 5 consecutive',
        task_risk: 'high',
        notes: 'Heat 88F average; confined-space task tomorrow.',
      }}
      onRun={(form) => aiFatiguePredictor(form)}
    />
  );
}
