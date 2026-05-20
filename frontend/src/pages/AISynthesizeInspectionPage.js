import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiSynthesizeInspection } from '../services/api';

export default function AISynthesizeInspectionPage() {
  return (
    <AiPanel
      feature="synthesize-inspection"
      title="AI: Synthesize Inspection Report"
      subtitle="Draft a full safety inspection report with findings, scores, and recommendations."
      fields={[
        { key: 'name', label: 'Site Name' },
        { key: 'project_type', label: 'Project Type' },
        { key: 'inspector', label: 'Inspector' },
        { key: 'type', label: 'Inspection Type', type: 'select', options: ['weekly','monthly','regulatory','pre-task','focused'] },
        { key: 'observed_conditions', label: 'Observed Conditions', type: 'textarea' },
      ]}
      initial={{
        name: 'East Campus Excavation',
        project_type: 'Excavation / Foundation',
        inspector: 'Kim Park',
        type: 'weekly',
        observed_conditions: 'Type C soil; trench 9 ft deep; protective system in place; ladder access every 25 ft; one toolbox talk completed.',
      }}
      onRun={(form) => aiSynthesizeInspection(form)}
    />
  );
}
