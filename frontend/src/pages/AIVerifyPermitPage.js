import React from 'react';
import AiPanel from '../components/AiPanel';
import { aiVerifyPermit } from '../services/api';

export default function AIVerifyPermitPage() {
  return (
    <AiPanel
      feature="verify-permit"
      title="AI: Verify Permit"
      subtitle="OSHA compliance check on a hot-work, confined-space, excavation, or electrical permit."
      fields={[
        { key: 'type', label: 'Permit Type', type: 'select', options: ['hot-work','confined-space','excavation','electrical'] },
        { key: 'site', label: 'Site' },
        { key: 'issued_to', label: 'Issued To' },
        { key: 'valid_from', label: 'Valid From' },
        { key: 'valid_to', label: 'Valid To' },
        { key: 'scope_of_work', label: 'Scope of Work', type: 'textarea' },
        { key: 'controls_in_place', label: 'Controls In Place', type: 'textarea' },
      ]}
      initial={{
        type: 'confined-space',
        site: 'Downtown Tunnel Boring TBM-3',
        issued_to: 'Rafael Ortiz',
        valid_from: '2026-05-13',
        valid_to: '2026-05-14',
        scope_of_work: 'Inspect cutterhead bearings inside TBM shield during shutdown.',
        controls_in_place: 'Pre-entry atmospheric testing for O2/LEL/CO/H2S; lockout of cutterhead drive; ventilation 6 ACH; trained attendant; rescue team on standby.',
      }}
      onRun={(form) => aiVerifyPermit(form)}
    />
  );
}
