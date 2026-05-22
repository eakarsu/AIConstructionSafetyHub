import React, { useEffect, useState } from 'react';
import { dronesStatus } from '../services/api';

export default function DronesPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dronesStatus().then(setStatus).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>Drone Safety Walkthrough</h1>
          <p>Batch drone-photo ingest and AI walkthrough scoring (DJI / Skydio).</p>
        </div>
      </div>
      <div className="card">
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: 12, borderRadius: 6, marginBottom: 12 }}>
          <strong>Integration disabled.</strong> Drone platform credentials and walkthrough
          scoring rubric are not configured. Set <code>DJI_API_KEY</code> or <code>SKYDIO_API_KEY</code>
          in the backend environment. Endpoints currently return <code>503</code>.
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
            <li><code>POST /api/drones/walkthrough</code> — AI walkthrough scoring on a flight</li>
            <li><code>POST /api/drones/photos/ingest</code> — batch photo ingest</li>
            <li><code>GET /api/drones/missions</code> — list missions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
