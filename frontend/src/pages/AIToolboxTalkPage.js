import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiGenerateToolboxTalk } from '../services/api';

export default function AIToolboxTalkPage() {
  return (
    <AiPanel
      feature="toolbox-talk"
      title="AI: Toolbox Talk Generator"
      subtitle="Generate a full 10-15 minute toolbox-talk script with OSHA references."
      fields={[
        { key: 'topic', label: 'Topic', type: 'textarea' },
      ]}
      initial={{ topic: 'Fall Protection on Multi-Story Sites (29 CFR 1926 Subpart M)' }}
      onRun={(form) => aiGenerateToolboxTalk(form.topic)}
    />
  );
}
