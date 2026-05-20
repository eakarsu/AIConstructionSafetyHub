import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiScaffoldInspector } from '../services/api';

export default function AIScaffoldInspectorPage() {
  return (
    <AiPanel
      feature="scaffold-inspector"
      title="AI: Scaffold Inspector"
      subtitle="Generate an inspection checklist + risk score for any scaffold."
      fields={[
        { key: 'scaffold_id', label: 'Scaffold ID' },
        { key: 'site', label: 'Site' },
        { key: 'type', label: 'Type', type: 'select', options: ['supported','suspended','aerial','mobile','tube-and-coupler'] },
        { key: 'height_ft', label: 'Height (ft)', type: 'number' },
        { key: 'platform_load_class', label: 'Load Class', type: 'select', options: ['light','medium','heavy'] },
        { key: 'condition_notes', label: 'Condition Notes', type: 'textarea' },
      ]}
      initial={{
        scaffold_id: 'SCAF-2201',
        site: 'Tower 88 Curtain Wall',
        type: 'suspended',
        height_ft: 280,
        platform_load_class: 'medium',
        condition_notes: 'Two-point suspended scaffold; one rope shows surface UV; outriggers tied off.',
      }}
      onRun={(form) => aiScaffoldInspector(form)}
    />
  );
}
