import React, { useEffect, useState } from 'react';
import { Sparkles, History, X } from 'lucide-react';
import { aiHistory, aiSamples } from '../services/api';
import AIResultDisplay from './AIResultDisplay';

// Reusable AI form panel.
// fields: [{ key, label, type?: 'text'|'textarea'|'select'|'number', options? }]
// onRun: (formObject) => Promise<result>
// feature: string  (server-side feature key used by /api/ai/history?feature=...)
export default function AiPanel({ title, subtitle, fields, onRun, initial = {}, feature }) {
  const [form, setForm] = useState(() => {
    const base = {};
    fields.forEach((f) => { base[f.key] = initial[f.key] ?? ''; });
    return base;
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // History state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Sample-fill state (fetched on mount from /api/ai/samples?feature=<verb>)
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (!feature) return undefined;
    aiSamples(feature)
      .then((res) => { if (!cancelled) setSamples(Array.isArray(res?.samples) ? res.samples : []); })
      .catch(() => { /* samples are optional; silently ignore */ });
    return () => { cancelled = true; };
  }, [feature]);

  function applySample(sample) {
    if (!sample || !sample.values) return;
    setForm((prev) => {
      const next = { ...prev };
      // Only fill keys the panel actually declares as fields - keeps payload shape stable.
      fields.forEach((f) => {
        if (Object.prototype.hasOwnProperty.call(sample.values, f.key)) {
          const v = sample.values[f.key];
          next[f.key] = v === null || v === undefined ? '' : v;
        }
      });
      return next;
    });
  }

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function run() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await onRun(form);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openHistory() {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError('');
    setExpandedId(null);
    try {
      const res = await aiHistory(feature);
      setHistoryRows(res.data || []);
    } catch (e) {
      setHistoryError(e.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {feature && (
          <button className="btn secondary" onClick={openHistory} title="View past AI runs for this feature">
            <History size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            History
          </button>
        )}
      </div>

      {samples.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="section-title" style={{ marginBottom: 6 }}>Sample Fill</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
            Click a scenario to populate the form with a realistic construction safety case.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {samples.map((s, i) => (
              <button
                key={i}
                type="button"
                className="btn secondary small"
                onClick={() => applySample(s)}
                title={`Fill form with: ${s.label}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">Inputs</div>
        <div className="form-grid">
          {fields.map((f) => {
            const v = form[f.key] ?? '';
            if (f.type === 'select') {
              return (
                <label key={f.key}>
                  <span>{f.label}</span>
                  <select value={v} onChange={(e) => update(f.key, e.target.value)}>
                    {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              );
            }
            if (f.type === 'textarea') {
              return (
                <label key={f.key} style={{ gridColumn: '1 / -1' }}>
                  <span>{f.label}</span>
                  <textarea value={v} onChange={(e) => update(f.key, e.target.value)} />
                </label>
              );
            }
            return (
              <label key={f.key}>
                <span>{f.label}</span>
                <input
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={v}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              </label>
            );
          })}
        </div>
        <button className="btn" onClick={run} disabled={loading}>
          {loading ? <><span className="spinner" /> Running...</> : <><Sparkles size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Run AI</>}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      {(result || loading) && (
        <div style={{ marginTop: 16 }}>
          <AIResultDisplay result={result} loading={loading} error={null} />
        </div>
      )}

      {historyOpen && (
        <div className="modal-backdrop" onClick={() => setHistoryOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="section-title" style={{ margin: 0 }}>AI Result History</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  feature: <code>{feature || '(any)'}</code> &middot; latest {historyRows.length} runs
                </div>
              </div>
              <button className="btn secondary small icon-only" onClick={() => setHistoryOpen(false)} aria-label="Close">
                <X size={14} />
              </button>
            </div>
            <div className="modal-body">
              {historyLoading && <div style={{ padding: 12 }}><span className="spinner" /> Loading...</div>}
              {historyError && <div className="error">{historyError}</div>}
              {!historyLoading && !historyError && historyRows.length === 0 && (
                <div className="muted" style={{ padding: 12 }}>No prior AI runs recorded for this feature.</div>
              )}
              {!historyLoading && historyRows.map((r) => {
                const open = expandedId === r.id;
                const when = String(r.created_at).replace('T', ' ').slice(0, 19);
                return (
                  <div key={r.id} className="history-item">
                    <div className="history-row" onClick={() => setExpandedId(open ? null : r.id)}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>#{r.id} &middot; {r.feature}</div>
                        <div className="muted" style={{ fontSize: 11 }}>{when} &middot; {r.model || '-'}</div>
                      </div>
                      <button className="btn secondary small">{open ? 'Hide' : 'View'}</button>
                    </div>
                    {open && (
                      <div className="history-detail">
                        {r.input && Object.keys(r.input || {}).length > 0 && (
                          <>
                            <div className="section-title" style={{ fontSize: 12 }}>Input</div>
                            <pre className="ai-raw-pre" style={{ maxHeight: 200 }}>{JSON.stringify(r.input, null, 2)}</pre>
                          </>
                        )}
                        <div style={{ marginTop: 10 }}>
                          <AIResultDisplay result={r.output} loading={false} error={null} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
