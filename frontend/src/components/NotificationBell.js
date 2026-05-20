import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsList, notificationsMarkRead } from '../services/api';

export default function NotificationBell() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    try {
      const r = await notificationsList(20);
      setRows(r.data || []);
      setUnread(r.unread_count || 0);
    } catch (_) {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  async function handleClick(n) {
    await notificationsMarkRead(n.id).catch(() => {});
    setOpen(false);
    nav('/notifications');
  }

  function sevClass(s) {
    return ({ critical: 'red', high: 'red', medium: 'yellow', low: 'green' })[String(s||'').toLowerCase()] || 'gray';
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn secondary small icon-only"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={14} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: 'white',
            borderRadius: 10, fontSize: 10, padding: '1px 5px', fontWeight: 700
          }}>{unread}</span>
        )}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 36, right: 0, width: 360, maxHeight: 480,
            overflowY: 'auto', background: '#161b22', border: '1px solid #22272e',
            borderRadius: 8, zIndex: 100, boxShadow: '0 10px 24px rgba(0,0,0,0.4)'
          }}>
            <div style={{ padding: 12, borderBottom: '1px solid #22272e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600 }}>Notifications</div>
              <button className="btn secondary small" onClick={() => { setOpen(false); nav('/notifications'); }}>View all</button>
            </div>
            {rows.length === 0 && <div className="muted" style={{ padding: 16 }}>No notifications.</div>}
            {rows.map((n) => (
              <div key={n.id} onClick={() => handleClick(n)} style={{
                padding: 10, borderBottom: '1px solid #1f2630', cursor: 'pointer',
                opacity: n.read ? 0.55 : 1
              }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                  <span className={`badge ${sevClass(n.severity)}`}>{String(n.severity || '').toUpperCase()}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</span>
                </div>
                <div className="muted" style={{ fontSize: 12 }}>{n.body}</div>
                <div className="muted" style={{ fontSize: 10, marginTop: 4 }}>{String(n.created_at).replace('T', ' ').slice(0, 19)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
