import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiNearMissSimilarity } from '../services/api';

export default function AINearMissSimilarityPage() {
  return (
    <AiPanel
      feature="near-miss-similarity"
      title="AI: Near-Miss Similarity Matcher"
      subtitle="Retrieve and rank past near-misses similar to a query event. Leave the corpus blank to use recent records."
      fields={[
        { key: 'query', label: 'Query event', type: 'textarea' },
        { key: 'site', label: 'Site' },
        { key: 'category', label: 'Category', type: 'select', options: ['fall','struck-by','electrocution','caught-in','fire','chemical','other'] },
        { key: 'window_days', label: 'Search window (days)', type: 'number' },
      ]}
      initial={{
        query: 'Wrench dropped from level 17 inside tower crane lift zone, near-miss to ground crew',
        site: 'Riverside Tower Phase II',
        category: 'struck-by',
        window_days: 180,
      }}
      onRun={(form) => aiNearMissSimilarity(form)}
    />
  );
}
