import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3131/api';

const EMPTY = {
  rule_id: '',
  category: 'General',
  title: '',
  permit_type: 'Hot Work',
  description: '',
  osha_ref: '',
  severity: 'medium',
  active: true,
};

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function SafetyRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const r = await fetch(`${API_BASE}/custom-views/safety-rules`, { headers: authHeaders() });
      const j = await r.json();
      setRules(j.data || []);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function setF(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setErr('');
    try {
      const opts = {
        method: editingId ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      };
      const url = editingId
        ? `${API_BASE}/custom-views/safety-rules/${editingId}`
        : `${API_BASE}/custom-views/safety-rules`;
      const r = await fetch(url, opts);
      if (!r.ok) throw new Error((await r.json()).error || `HTTP ${r.status}`);
      setForm(EMPTY);
      setEditingId(null);
      await load();
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  function startEdit(rule) {
    setEditingId(rule.id);
    setForm({
      rule_id: rule.rule_id || '',
      category: rule.category || 'General',
      title: rule.title || '',
      permit_type: rule.permit_type || 'Hot Work',
      description: rule.description || '',
      osha_ref: rule.osha_ref || '',
      severity: rule.severity || 'medium',
      active: !!rule.active,
    });
  }

  async function remove(id) {
    setErr('');
    try {
      const r = await fetch(`${API_BASE}/custom-views/safety-rules/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await load();
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  return (
    <div className="card" data-testid="safety-rules-editor">
      <h3 style={{ marginTop: 0 }}>Safety Rules & Permits Editor</h3>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
        CRUD against /api/custom-views/safety-rules. {rules.length} rules loaded.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: 6, marginBottom: 8 }}>
        <input placeholder="Rule ID" value={form.rule_id} onChange={(e) => setF('rule_id', e.target.value)} style={{ padding: 6 }} />
        <input placeholder="Title" value={form.title} onChange={(e) => setF('title', e.target.value)} style={{ padding: 6 }} />
        <select value={form.category} onChange={(e) => setF('category', e.target.value)} style={{ padding: 6 }}>
          {['General','Fall Protection','Electrical','Excavation','Hot Work','Confined Space','PPE','Traffic Control'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={form.permit_type} onChange={(e) => setF('permit_type', e.target.value)} style={{ padding: 6 }}>
          {['Hot Work','Electrical','Excavation','Confined Space','Traffic Control','Lift Plan','Other'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input placeholder="OSHA Ref" value={form.osha_ref} onChange={(e) => setF('osha_ref', e.target.value)} style={{ padding: 6 }} />
        <select value={form.severity} onChange={(e) => setF('severity', e.target.value)} style={{ padding: 6 }}>
          {['low','medium','high','critical'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setF('description', e.target.value)}
        style={{ padding: 6, width: '100%', minHeight: 60, marginBottom: 8 }}
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <label style={{ fontSize: 12 }}>
          <input type="checkbox" checked={!!form.active} onChange={(e) => setF('active', e.target.checked)} /> Active
        </label>
        <button className="btn" onClick={save}>{editingId ? 'Update' : 'Create'}</button>
        {editingId && (
          <button className="btn secondary" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>
        )}
      </div>
      {err && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>Error: {err}</div>}

      {loading ? (
        <div>Loading rules...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#0b1220' }}>
                {['Rule ID','Category','Title','Permit','Severity','OSHA','Active','Actions'].map((h) => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #1f2937' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 8px' }}>{r.rule_id}</td>
                  <td style={{ padding: '6px 8px' }}>{r.category}</td>
                  <td style={{ padding: '6px 8px' }}>{r.title}</td>
                  <td style={{ padding: '6px 8px' }}>{r.permit_type}</td>
                  <td style={{ padding: '6px 8px' }}>{r.severity}</td>
                  <td style={{ padding: '6px 8px' }}>{r.osha_ref}</td>
                  <td style={{ padding: '6px 8px' }}>{r.active ? 'yes' : 'no'}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <button className="btn secondary small" onClick={() => startEdit(r)} style={{ marginRight: 4 }}>Edit</button>
                    <button className="btn secondary small" onClick={() => remove(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
