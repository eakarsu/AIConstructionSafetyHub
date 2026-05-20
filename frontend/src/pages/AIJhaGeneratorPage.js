import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiJhaGenerator } from '../services/api';

export default function AIJhaGeneratorPage() {
  return (
    <AiPanel
      feature="jha-generator"
      title="AI: JHA Generator"
      subtitle="Draft a Job Hazard Analysis for any construction task."
      fields={[
        { key: 'task', label: 'Task' },
        { key: 'site', label: 'Site' },
        { key: 'crew_size', label: 'Crew Size', type: 'number' },
        { key: 'duration_hours', label: 'Duration (hours)', type: 'number' },
        { key: 'special_conditions', label: 'Special Conditions', type: 'textarea' },
      ]}
      initial={{
        task: 'Pile driving from barge in 8 ft tidal water',
        site: 'Harbor Pier 14 Reconstruction',
        crew_size: 6,
        duration_hours: 9,
        special_conditions: 'Tidal current 2 knots; vessel traffic nearby; impact hammer Delmag D62-22.',
      }}
      onRun={(form) => aiJhaGenerator(form)}
    />
  );
}
