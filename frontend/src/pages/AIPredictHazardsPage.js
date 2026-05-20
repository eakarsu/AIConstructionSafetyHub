import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiPredictHazards } from '../services/api';

export default function AIPredictHazardsPage() {
  return (
    <AiPanel
      feature="predict-hazards"
      title="AI: Predict Hazards"
      subtitle="Forecast likely hazards for a site based on project type, location, and workforce."
      fields={[
        { key: 'name', label: 'Site Name' },
        { key: 'project_type', label: 'Project Type' },
        { key: 'address', label: 'Address' },
        { key: 'worker_count', label: 'Worker Count', type: 'number' },
        { key: 'supervisor', label: 'Supervisor' },
        { key: 'notes', label: 'Site Conditions / Notes', type: 'textarea' },
      ]}
      initial={{
        name: 'Riverside Tower Phase II',
        project_type: 'High-rise Residential',
        address: '4400 Riverside Blvd, Sacramento, CA',
        worker_count: 142,
        supervisor: 'James Conroy',
        notes: 'Active 18-story slab pour zone; tower crane in use; adjacent occupied units.',
      }}
      onRun={(form) => aiPredictHazards(form)}
    />
  );
}
