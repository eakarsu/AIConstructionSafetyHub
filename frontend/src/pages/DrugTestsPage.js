import React from 'react';
import CrudTable from '../components/CrudTable';
import { drugTestsApi } from '../services/api';

export default function DrugTestsPage() {
  return (
    <CrudTable
      title="Drug Tests"
      subtitle="Pre-employment, random, and post-incident testing log."
      api={drugTestsApi}
      defaults={{ type: 'random', result: 'negative' }}
      columns={[
        { key: 'test_id', label: 'Test ID' },
        { key: 'worker', label: 'Worker' },
        { key: 'type', label: 'Type', type: 'select', options: ['random','incident','pre-employment'] },
        { key: 'result', label: 'Result', type: 'select', options: ['negative','positive','inconclusive'] },
        { key: 'tested_at', label: 'Tested At', type: 'datetime' },
      ]}
    />
  );
}
