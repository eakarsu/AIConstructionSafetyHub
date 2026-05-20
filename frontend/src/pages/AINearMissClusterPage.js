import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiNearMissCluster } from '../services/api';

export default function AINearMissClusterPage() {
  return (
    <AiPanel
      feature="near-miss-cluster"
      title="AI: Near-Miss Cluster Analysis"
      subtitle="Identify near-miss clusters and leading indicators. Leave the dataset blank to pull recent records."
      fields={[
        { key: 'window_days', label: 'Window (days)', type: 'number' },
        { key: 'context', label: 'Context / Notes', type: 'textarea' },
      ]}
      initial={{ window_days: 30, context: 'Cluster recent near-misses to surface leading indicators.' }}
      onRun={(form) => aiNearMissCluster(form)}
    />
  );
}
