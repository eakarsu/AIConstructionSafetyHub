import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiTrainingGap } from '../services/api';

export default function AITrainingGapPage() {
  return (
    <AiPanel
      feature="training-gap"
      title="AI: Training Gap Analysis"
      subtitle="Find training gaps vs role requirements and certification expiries."
      fields={[
        { key: 'name', label: 'Worker' },
        { key: 'role', label: 'Role' },
        { key: 'site', label: 'Site' },
        { key: 'certifications', label: 'Current Certifications', type: 'textarea' },
        { key: 'cert_expiries', label: 'Certification Expiries', type: 'textarea' },
        { key: 'planned_tasks', label: 'Planned Tasks', type: 'textarea' },
      ]}
      initial={{
        name: 'Priya Nair',
        role: 'PV Installer',
        site: 'Greenway Solar Array',
        certifications: 'OSHA 30, NABCEP PV, Fall Protection, NFPA 70E',
        cert_expiries: 'NFPA 70E 2026-08-10; First Aid expired 2026-03-01',
        planned_tasks: 'DC combiner wiring, arc-flash work, roof PV install',
      }}
      onRun={(form) => aiTrainingGap(form)}
    />
  );
}
