import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiRecommendTraining } from '../services/api';

export default function AIRecommendTrainingPage() {
  return (
    <AiPanel
      feature="recommend-training"
      title="AI: Recommend Training"
      subtitle="Build a training plan for a construction role: OSHA, NCCCO, NFPA, role-specific."
      fields={[
        { key: 'worker_role', label: 'Worker Role' },
      ]}
      initial={{ worker_role: 'Crane Operator (Tower Crane)' }}
      onRun={(form) => aiRecommendTraining(form.worker_role)}
    />
  );
}
