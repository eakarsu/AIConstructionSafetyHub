import React, { useState } from 'react';
import { osha300, osha300A, oshaReportCsvUrl } from '../services/api';

export default function OshaReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [site, setSite] = useState('');
  const [log, setLog] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  async function load300() {
    setLoading('300');
    setError('');
    try {
      const res = await osha300(year, site || null);
      setLog(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading('');
    }
  }
  async function load300A() {
    setLoading('300A');
    setError('');
    try {
      const res = await osha300A(year, site || null);
      setSummary(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading('');
    }
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>OSHA 300 / 300A Reports</h1>
          <p>Generate the OSHA recordable injury log (300) and annual summary (300A). Export as JSON or CSV.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label className="muted" style={{ fontSize: 12, display: 'block' }}>Year</label>
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value) || year)} style={{ width: 100 }} />
          </div>
          <div>
            <label className="muted" style={{ fontSize: 12, display: 'block' }}>Site (optional)</label>
            <input type="text" value={site} onChange={(e) => setSite(e.target.value)} placeholder="all sites" style={{ width: 240 }} />
          </div>
          <button className="btn" onClick={load300} disabled={!!loading}>
            {loading === '300' ? 'Loading 300…' : 'Load 300 Log (JSON)'}
          </button>
          <button className="btn secondary" onClick={load300A} disabled={!!loading}>
            {loading === '300A' ? 'Loading 300A…' : 'Load 300A Summary (JSON)'}
          </button>
          <a className="btn secondary" href={oshaReportCsvUrl('300', year, site || null)} target="_blank" rel="noreferrer">300 CSV</a>
          <a className="btn secondary" href={oshaReportCsvUrl('300A', year, site || null)} target="_blank" rel="noreferrer">300A CSV</a>
        </div>
        {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{error}</div>}
      </div>

      {summary && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>OSHA 300A Summary — {summary.year}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
            <Stat label="Total recordable" value={summary.total_cases} />
            <Stat label="Days away" value={summary.cases_with_days_away} />
            <Stat label="Job transfer" value={summary.cases_with_job_transfer} />
            <Stat label="Other recordable" value={summary.other_recordable_cases} />
            <Stat label="Total days away" value={summary.total_days_away_from_work} />
            <Stat label="Total days transfer" value={summary.total_days_job_transfer} />
            <Stat label="Workers" value={summary.total_workers} />
            <Stat label="Hours worked" value={summary.total_hours_worked} />
            <Stat label="TRIR" value={summary.trir_per_100_workers} />
            <Stat label="DART" value={summary.dart_per_100_workers} />
          </div>
          <pre style={{ background: '#f8fafc', padding: 8, borderRadius: 6, marginTop: 12, fontSize: 11, maxHeight: 240, overflow: 'auto' }}>
            {JSON.stringify(summary.by_type || {}, null, 2)}
          </pre>
        </div>
      )}

      {log && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>OSHA 300 Log — {log.year} ({log.total_recordable} recordable)</h3>
          <div style={{ maxHeight: 400, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: 6 }}>Case #</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Site</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Classification</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Type</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {(log.log || []).map((r) => (
                  <tr key={r.case_no} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 6 }}>{r.case_no}</td>
                    <td style={{ padding: 6 }}>{r.date_of_event}</td>
                    <td style={{ padding: 6 }}>{r.where_event_occurred}</td>
                    <td style={{ padding: 6 }}>{r.classification}</td>
                    <td style={{ padding: 6 }}>{r.type}</td>
                    <td style={{ padding: 6 }}>{r.description_of_injury}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6 }}>
      <div className="muted" style={{ fontSize: 11 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{value ?? '-'}</div>
    </div>
  );
}
