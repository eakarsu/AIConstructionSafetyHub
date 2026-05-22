import React, { useEffect, useState } from 'react';
import { wearablesStatus } from '../services/api';

export default function WearablesPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    wearablesStatus().then(setStatus).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Wearable Telemetry</h1>
          <p>Smart-helmet, harness, heart-rate, and GPS telemetry ingestion (Spot-r / Triax / Guardhat).</p>
        </div>
      </div>
      <div className="card">
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: 12, borderRadius: 6, marginBottom: 12 }}>
          <strong>Integration disabled.</strong> Vendor SDK credentials are not configured.
          Set <code>SPOTR_API_KEY</code>, <code>TRIAX_API_KEY</code>, or <code>GUARDHAT_API_KEY</code> in
          the backend environment to enable. Endpoints currently return <code>503</code>.
        </div>
        {error && <div style={{ color: '#dc2626', fontSize: 12 }}>{error}</div>}
        {status && (
          <pre style={{ background: '#f8fafc', padding: 8, borderRadius: 6, fontSize: 12 }}>
            {JSON.stringify(status, null, 2)}
          </pre>
        )}
        <div style={{ marginTop: 12 }}>
          <strong>Available endpoints (when configured):</strong>
          <ul style={{ fontSize: 13 }}>
            <li><code>POST /api/wearables/telemetry</code> — ingest impact_g, fall_detection, heart_rate_bpm, GPS</li>
            <li><code>POST /api/wearables/devices/:id/register</code> — register a device</li>
            <li><code>GET /api/wearables/devices</code> — list registered devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
