import React, { useEffect, useState } from 'react';
import CrudTable from '../components/CrudTable';
import {
  subcontractorOnboardingApi,
  subcontractorOnboardingStages,
  subcontractorOnboardingAdvance,
} from '../services/api';

export default function SubcontractorOnboardingPage() {
  const [stages, setStages] = useState([]);
  const [advancing, setAdvancing] = useState('');
  const [msg, setMsg] = useState('');
  const [advId, setAdvId] = useState('');

  useEffect(() => {
    subcontractorOnboardingStages()
      .then((r) => setStages(r.stages || []))
      .catch(() => {});
  }, []);

  async function advance(id) {
    if (!id) return;
    setAdvancing(String(id));
    setMsg('');
    try {
      const r = await subcontractorOnboardingAdvance(id);
      setMsg(`Advanced ${r.onboarding_id} to stage: ${r.stage}`);
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setAdvancing('');
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Onboarding Workflow</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Stages: {stages.join(' → ') || 'invited → prequal_in_progress → docs_pending → coi_review → approved | rejected'}
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label className="muted" style={{ fontSize: 12 }}>Advance record by id</label>
          <input
            type="number"
            value={advId}
            onChange={(e) => setAdvId(e.target.value)}
            style={{ width: 100 }}
          />
          <button className="btn small" onClick={() => advance(advId)} disabled={!!advancing}>
            {advancing ? 'Advancing…' : 'Advance Stage'}
          </button>
        </div>
        {msg && <div style={{ marginTop: 8, fontSize: 12 }}>{msg}</div>}
      </div>

      <CrudTable
        title="Subcontractor Onboarding"
        subtitle="Prequal scoring, COI review, MSA/W9, safety manual hand-off."
        api={subcontractorOnboardingApi}
        defaults={{ stage: 'invited', coi_received: false, msa_signed: false, w9_received: false, safety_manual_received: false }}
        columns={[
          { key: 'onboarding_id', label: 'Onboarding ID' },
          { key: 'sub_name', label: 'Subcontractor' },
          { key: 'scope', label: 'Scope' },
          { key: 'coi_received', label: 'COI Received', type: 'boolean' },
          { key: 'coi_expiry', label: 'COI Expiry', type: 'date' },
          { key: 'prequal_score', label: 'Prequal Score', type: 'number' },
          { key: 'msa_signed', label: 'MSA Signed', type: 'boolean' },
          { key: 'w9_received', label: 'W9 Received', type: 'boolean' },
          { key: 'safety_manual_received', label: 'Safety Manual', type: 'boolean' },
          { key: 'stage', label: 'Stage', type: 'select', options: ['invited','prequal_in_progress','docs_pending','coi_review','approved','rejected'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]}
      />
    </div>
  );
}
