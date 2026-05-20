import React, { useState } from 'react';

const API_BASE = 'http://localhost:3131/api';

export default function IncidentInvestigationPDF() {
  const [incidentId, setIncidentId] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function generate() {
    setLoading(true);
    setErr('');
    setReport('');
    try {
      const token = localStorage.getItem('token');
      const qs = incidentId ? `?incident_id=${encodeURIComponent(incidentId)}` : '';
      const r = await fetch(`${API_BASE}/custom-views/incident-investigation-pdf${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const text = await r.text();
      if (!r.ok) throw new Error(text || `HTTP ${r.status}`);
      setReport(text);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_investigation_${incidentId || 'latest'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card" data-testid="incident-investigation-pdf">
      <h3 style={{ marginTop: 0 }}>Incident Investigation Report</h3>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
        Generates a structured investigation document (PDF-style text) for the latest or specified incident.
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <input
          placeholder="Incident ID (e.g. INC-3001) - optional"
          value={incidentId}
          onChange={(e) => setIncidentId(e.target.value)}
          style={{ padding: 6, minWidth: 240 }}
        />
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        {report && (
          <button className="btn secondary" onClick={download}>Download .txt</button>
        )}
      </div>
      {err && <div style={{ color: '#ef4444', fontSize: 12 }}>Error: {err}</div>}
      {report && (
        <pre style={{
          background: '#0b1220', color: '#e2e8f0', padding: 12, borderRadius: 6,
          maxHeight: 360, overflow: 'auto', fontSize: 11, lineHeight: 1.45,
          whiteSpace: 'pre-wrap',
        }}>{report}</pre>
      )}
    </div>
  );
}
