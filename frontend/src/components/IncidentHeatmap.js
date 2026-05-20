import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3131/api';

function colorFor(count, max) {
  if (count === 0) return '#1a2233';
  const ratio = max === 0 ? 0 : count / max;
  // amber -> red gradient
  if (ratio < 0.34) return '#fde68a';
  if (ratio < 0.67) return '#f59e0b';
  return '#dc2626';
}

export default function IncidentHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/custom-views/incident-heatmap`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((j) => { setData(j); setLoading(false); })
      .catch((e) => { setErr(String(e.message || e)); setLoading(false); });
  }, []);

  if (loading) return <div className="card">Loading incident heatmap...</div>;
  if (err) return <div className="card" style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data || !data.cells) return <div className="card">No heatmap data.</div>;

  const max = data.cells.reduce((m, c) => (c.count > m ? c.count : m), 0);

  return (
    <div className="card" data-testid="incident-heatmap">
      <h3 style={{ marginTop: 0 }}>Incident Heatmap (Site x Type)</h3>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
        {data.sites.length} sites x {data.types.length} types. Total incidents: {data.total}. Source: {data.source}.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>Site \\ Type</th>
              {data.types.map((t) => (
                <th key={t} style={{ padding: '6px 8px', textAlign: 'center' }}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.sites.map((s) => (
              <tr key={s}>
                <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>{s}</td>
                {data.types.map((t) => {
                  const cell = data.cells.find((c) => c.site === s && c.type === t) || { count: 0 };
                  const bg = colorFor(cell.count, max);
                  const fg = cell.count > Math.max(1, max / 2) ? '#fff' : '#0b1220';
                  return (
                    <td
                      key={t}
                      style={{
                        padding: '6px 10px',
                        textAlign: 'center',
                        background: bg,
                        color: fg,
                        minWidth: 38,
                        border: '1px solid #0b1220',
                        fontWeight: 600,
                      }}
                    >
                      {cell.count}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
        Higher counts trend amber/red. Empty (count=0) cells are dark.
      </div>
    </div>
  );
}
