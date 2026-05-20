import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3131/api';

export default function SafetyScoreTrend() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/custom-views/safety-score-trend`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((j) => { setData(j); setLoading(false); })
      .catch((e) => { setErr(String(e.message || e)); setLoading(false); });
  }, []);

  if (loading) return <div className="card">Loading safety score trend...</div>;
  if (err) return <div className="card" style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data || !data.trend) return <div className="card">No trend data.</div>;

  const width = 640;
  const height = 220;
  const padding = { l: 36, r: 16, t: 16, b: 28 };
  const innerW = width - padding.l - padding.r;
  const innerH = height - padding.t - padding.b;

  const points = data.trend;
  const minY = 60;
  const maxY = 100;
  const xStep = points.length > 1 ? innerW / (points.length - 1) : 0;

  const path = points.map((p, i) => {
    const x = padding.l + i * xStep;
    const y = padding.t + (1 - (p.avg_score - minY) / (maxY - minY)) * innerH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const yTicks = [60, 70, 80, 90, 100];

  return (
    <div className="card" data-testid="safety-score-trend">
      <h3 style={{ marginTop: 0 }}>Safety Score Trend (weekly)</h3>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
        Overall avg: <strong>{data.overall_avg}</strong> -
        delta first->last: <strong style={{ color: data.delta_first_to_last >= 0 ? '#10b981' : '#ef4444' }}>{data.delta_first_to_last >= 0 ? '+' : ''}{data.delta_first_to_last}</strong> -
        {data.points} weeks
      </div>
      <svg width={width} height={height} style={{ background: '#0b1220', border: '1px solid #1f2937', borderRadius: 6 }}>
        {yTicks.map((t) => {
          const y = padding.t + (1 - (t - minY) / (maxY - minY)) * innerH;
          return (
            <g key={t}>
              <line x1={padding.l} x2={width - padding.r} y1={y} y2={y} stroke="#1f2937" strokeDasharray="2 2" />
              <text x={4} y={y + 4} fill="#94a3b8" fontSize="10">{t}</text>
            </g>
          );
        })}
        <path d={path} fill="none" stroke="#10b981" strokeWidth="2" />
        {points.map((p, i) => {
          const x = padding.l + i * xStep;
          const y = padding.t + (1 - (p.avg_score - minY) / (maxY - minY)) * innerH;
          return (
            <g key={p.week + i}>
              <circle cx={x} cy={y} r="3" fill="#f59e0b" />
              {i % 2 === 0 && (
                <text x={x} y={height - 8} fill="#94a3b8" fontSize="9" textAnchor="middle">
                  {p.week.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
