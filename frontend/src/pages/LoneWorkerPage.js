import React, { useEffect, useState } from 'react';
import CrudTable from '../components/CrudTable';
import { loneWorkerApi, loneWorkerOverdue, loneWorkerAck } from '../services/api';

export default function LoneWorkerPage() {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await loneWorkerOverdue();
      setOverdue(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function ack(id) {
    try {
      await loneWorkerAck(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Overdue Check-ins (Dead-Man Switch)</h2>
        <p className="muted" style={{ marginTop: 0 }}>Lone workers past their next_checkin_due that have not been resolved.</p>
        <button className="btn small" onClick={load} disabled={loading} style={{ marginBottom: 8 }}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        {error && <div style={{ color: '#dc2626', fontSize: 12 }}>{error}</div>}
        <div style={{ maxHeight: 260, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#fff7ed' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: 6 }}>ID</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Worker</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Site</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Due</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Status</th>
                <th style={{ textAlign: 'right', padding: 6 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {overdue.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 8, color: '#6b7280' }}>No overdue check-ins.</td></tr>
              )}
              {overdue.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 6 }}>{r.checkin_id}</td>
                  <td style={{ padding: 6 }}>{r.worker}</td>
                  <td style={{ padding: 6 }}>{r.site}</td>
                  <td style={{ padding: 6 }}>{r.next_checkin_due}</td>
                  <td style={{ padding: 6 }}>{r.status}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>
                    <button className="btn small secondary" onClick={() => ack(r.id)}>Acknowledge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CrudTable
        title="Lone-Worker Check-ins"
        subtitle="Periodic check-ins, geofence, dead-man-switch state."
        api={loneWorkerApi}
        defaults={{ status: 'ok' }}
        columns={[
          { key: 'checkin_id', label: 'Check-in ID' },
          { key: 'worker', label: 'Worker' },
          { key: 'site', label: 'Site' },
          { key: 'lat', label: 'Lat', type: 'number' },
          { key: 'lng', label: 'Lng', type: 'number' },
          { key: 'status', label: 'Status', type: 'select', options: ['ok','overdue','alert','resolved','off-duty'] },
          { key: 'next_checkin_due', label: 'Next Check-in Due', type: 'datetime' },
          { key: 'battery_pct', label: 'Battery %', type: 'number' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]}
      />
    </div>
  );
}
