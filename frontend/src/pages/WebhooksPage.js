import React, { useEffect, useState } from 'react';
import CrudTable from '../components/CrudTable';
import { webhooksApi, webhookLogsAll } from '../services/api';
import { Webhook } from 'lucide-react';

export default function WebhooksPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadLogs() {
    setLoading(true);
    try {
      const r = await webhookLogsAll();
      setLogs(r.data || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadLogs(); }, []);

  return (
    <div>
      <CrudTable
        title={(<><Webhook size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Webhooks</>)}
        subtitle="Fire HMAC-signed payloads on incident/near-miss/hazard/claim events."
        api={webhooksApi}
        defaults={{ active: true, events: 'incident.upserted,near_miss.upserted,hazard.upserted,claim.upserted' }}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'url', label: 'URL' },
          { key: 'events', label: 'Events (comma list)' },
          { key: 'secret', label: 'Secret (HMAC)' },
          { key: 'active', label: 'Active', type: 'boolean' },
        ]}
      />

      <div style={{ marginTop: 24 }}>
        <div className="page-title">
          <div>
            <h1 style={{ fontSize: 18 }}>Recent Delivery Log</h1>
            <p>HMAC-signed delivery attempts and response status.</p>
          </div>
          <button className="btn secondary" onClick={loadLogs}>Refresh</button>
        </div>
        <div className="card table-wrap" style={{ padding: 0 }}>
          {loading ? <div style={{ padding: 24, textAlign: 'center' }}><span className="spinner" /> Loading...</div> : (
            <table className="table">
              <thead><tr><th>ID</th><th>Webhook</th><th>Event</th><th>Status</th><th>Signature</th><th>Delivered</th><th>Created</th></tr></thead>
              <tbody>
                {logs.length === 0 && <tr><td colSpan="7" className="muted" style={{ padding: 24, textAlign: 'center' }}>No deliveries yet.</td></tr>}
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>#{l.id}</td>
                    <td>{l.webhook_id}</td>
                    <td><code>{l.event}</code></td>
                    <td>{l.response_status || '-'}</td>
                    <td className="muted" style={{ fontSize: 11 }}>{(l.signature || '').slice(0, 24)}...</td>
                    <td>{l.delivered ? <span className="badge green">YES</span> : <span className="badge red">NO</span>}</td>
                    <td className="muted">{String(l.created_at).replace('T', ' ').slice(0, 19)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
