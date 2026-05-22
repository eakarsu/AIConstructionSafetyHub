import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiHazardImageClassifier } from '../services/api';

export default function AIHazardImageClassifierPage() {
  return (
    <AiPanel
      feature="hazard-image-classifier"
      title="AI: Hazard Image Classifier"
      subtitle="Vision-style site-photo classifier for exposed rebar, fall edges, housekeeping, and other general hazards."
      fields={[
        { key: 'site', label: 'Site' },
        { key: 'location', label: 'Location in site' },
        { key: 'image_url', label: 'Image URL (optional)' },
        { key: 'scene_description', label: 'Scene description (what the camera sees)', type: 'textarea' },
      ]}
      initial={{
        site: 'Riverside Tower Phase II',
        location: 'Level 18 slab-edge',
        image_url: '',
        scene_description: 'Vertical rebar protruding 18 in above formwork; no caps; pedestrian walkway 6 ft below.',
      }}
      onRun={(form) => aiHazardImageClassifier(form)}
    />
  );
}
