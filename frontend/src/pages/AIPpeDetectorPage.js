import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiPpeDetector } from '../services/api';

export default function AIPpeDetectorPage() {
  return (
    <AiPanel
      feature="ppe-detector"
      title="AI: PPE Detector"
      subtitle="Image-style assessment of PPE compliance and missing items."
      fields={[
        { key: 'worker_id', label: 'Worker ID' },
        { key: 'worker', label: 'Worker Name' },
        { key: 'site', label: 'Site' },
        { key: 'task', label: 'Task' },
        { key: 'image_url', label: 'Image URL (optional)' },
        { key: 'expected_ppe', label: 'Expected PPE (comma list)', type: 'textarea' },
      ]}
      initial={{
        worker_id: 'W-1005',
        worker: 'David Olsen',
        site: 'Riverside Tower Phase II',
        task: 'Tower crane operator briefing in slab pour zone',
        image_url: '',
        expected_ppe: 'hard hat, safety glasses, hi-vis, harness, gloves, steel-toe boots',
      }}
      onRun={(form) => aiPpeDetector(form)}
    />
  );
}
