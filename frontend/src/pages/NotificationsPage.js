import React, { useEffect, useState } from 'react';
import { notificationsList, notificationsMarkRead, notificationsMarkAllRead } from '../services/api';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [rows, setRows] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const r = await notificationsList(200);
      setRows(r.data || []);
      setUnread(r.unread_count || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function markRead(id) { await notificationsMarkRead(id); await load(); }
  async function markAll() { await notificationsMarkAllRead(); await load(); }

  function sevClass(s) {
    return ({ critical: 'red', high: 'red', medium: 'yellow', low: 'green' })[String(s||'').toLowerCase()] || 'gray';
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <h1><Bell size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Notifications</h1>
          <p>{unread} unread &middot; {rows.length} total</p>
        </div>
        <button className="btn secondary" onClick={markAll} disabled={unread === 0}>
          <CheckCheck size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Mark all read
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="card table-wrap" style={{ padding: 0 }}>
        {loading ? <div style={{ padding: 24, textAlign: 'center' }}><span className="spinner" /> Loading...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Severity</th><th>Title</th><th>Body</th><th>Type</th><th>Created</th><th>Read</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="7" style={{ padding: 24, textAlign: 'center' }} className="muted">No notifications.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} style={{ opacity: r.read ? 0.55 : 1 }}>
                  <td><span className={`badge ${sevClass(r.severity)}`}>{String(r.severity || '').toUpperCase()}</span></td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.body}</td>
                  <td className="muted">{r.type}</td>
                  <td className="muted">{String(r.created_at).replace('T', ' ').slice(0, 19)}</td>
                  <td>{r.read ? <span className="badge gray">READ</span> : <span className="badge yellow">UNREAD</span>}</td>
                  <td className="right">
                    {!r.read && <button className="btn secondary small" onClick={() => markRead(r.id)}><Check size={11} /> Mark</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
