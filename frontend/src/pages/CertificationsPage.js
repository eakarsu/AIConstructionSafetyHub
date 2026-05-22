import React, { useEffect, useState } from 'react';
import CrudTable from '../components/CrudTable';
import { certificationsApi, certificationsExpiring } from '../services/api';

export default function CertificationsPage() {
  const [expiring, setExpiring] = useState([]);
  const [days, setDays] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadExpiring(d) {
    setLoading(true);
    setError('');
    try {
      const res = await certificationsExpiring(d);
      setExpiring(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadExpiring(days); }, []); // eslint-disable-line

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Expiry Watch</h2>
        <p className="muted" style={{ marginTop: 0 }}>Certifications expiring within a configurable window.</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <label className="muted" style={{ fontSize: 12 }}>Window (days)</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value) || 0)}
            style={{ width: 80 }}
          />
          <button className="btn small" onClick={() => loadExpiring(days)} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {error && <div style={{ color: '#dc2626', fontSize: 12 }}>{error}</div>}
        <div style={{ maxHeight: 260, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: 6 }}>Cert ID</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Worker</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Cert</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Expires</th>
                <th style={{ textAlign: 'right', padding: 6 }}>Days</th>
              </tr>
            </thead>
            <tbody>
              {expiring.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 8, color: '#6b7280' }}>No certifications expiring in this window.</td></tr>
              )}
              {expiring.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb', color: r.expired ? '#dc2626' : 'inherit' }}>
                  <td style={{ padding: 6 }}>{r.cert_id}</td>
                  <td style={{ padding: 6 }}>{r.worker}</td>
                  <td style={{ padding: 6 }}>{r.cert_name}</td>
                  <td style={{ padding: 6 }}>{r.expires_on}</td>
                  <td style={{ padding: 6, textAlign: 'right' }}>{r.days_to_expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CrudTable
        title="Certifications"
        subtitle="Worker certifications ledger with expiry tracking."
        api={certificationsApi}
        defaults={{ status: 'active' }}
        columns={[
          { key: 'cert_id', label: 'Cert ID' },
          { key: 'worker', label: 'Worker' },
          { key: 'worker_role', label: 'Role' },
          { key: 'cert_name', label: 'Cert Name' },
          { key: 'issuing_body', label: 'Issuing Body' },
          { key: 'issued_on', label: 'Issued On', type: 'date' },
          { key: 'expires_on', label: 'Expires On', type: 'date' },
          { key: 'status', label: 'Status', type: 'select', options: ['active','expired','suspended','revoked'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]}
      />
    </div>
  );
}
