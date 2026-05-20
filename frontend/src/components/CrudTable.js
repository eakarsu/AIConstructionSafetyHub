import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 25;

function toCsv(rows, columns) {
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'string' ? v : (typeof v === 'object' ? JSON.stringify(v) : String(v));
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const header = columns.map((c) => escape(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => escape(r[c.key])).join(',')).join('\n');
  return header + '\n' + body;
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Generic CRUD page driven by a column schema.
// columns: [{ key, label, type?: 'text'|'number'|'select'|'boolean'|'date'|'datetime'|'textarea', options? }]
export default function CrudTable({ title, subtitle, api, columns, defaults = {} }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | row
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const res = await api.list();
      setRows(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // Reset to page 1 when the filter or row set changes
  useEffect(() => { setPage(1); }, [search, rows.length]);

  function startNew() {
    const blank = {};
    columns.forEach((c) => { blank[c.key] = defaults[c.key] ?? ''; });
    setForm(blank);
    setEditing('new');
  }
  function startEdit(row) {
    const f = {};
    columns.forEach((c) => {
      let v = row[c.key];
      if (c.type === 'datetime' && v) v = String(v).slice(0, 16);
      else if (c.type === 'date' && v) v = String(v).slice(0, 10);
      f[c.key] = v ?? '';
    });
    setForm(f);
    setEditing(row);
  }
  async function save() {
    setError('');
    try {
      const payload = { ...form };
      columns.forEach((c) => {
        if (c.type === 'boolean') payload[c.key] = !!payload[c.key];
        if (c.type === 'number') payload[c.key] = payload[c.key] === '' ? null : Number(payload[c.key]);
      });
      if (editing === 'new') await api.create(payload);
      else await api.update(editing.id, payload);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  async function remove(row) {
    if (!window.confirm(`Delete record #${row.id}?`)) return;
    try {
      await api.remove(row.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  // Search across all string-y column values
  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => {
      // Search string fields and stringified non-string fields too
      for (const c of columns) {
        const v = r[c.key];
        if (v === null || v === undefined) continue;
        const s = typeof v === 'string' ? v : String(v);
        if (s.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [rows, search, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function exportCsv() {
    const csv = toCsv(filtered, columns);
    const stamp = new Date().toISOString().slice(0, 10);
    const base = (title || 'export').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    downloadCsv(`${base}_${stamp}.csv`, csv);
  }

  function renderCell(row, c) {
    let v = row[c.key];
    if (v === null || v === undefined || v === '') return <span className="muted">-</span>;
    if (c.type === 'boolean') return v ? <span className="badge green">YES</span> : <span className="badge gray">NO</span>;
    if (c.type === 'datetime') return String(v).replace('T', ' ').slice(0, 16);
    if (c.type === 'date') return String(v).slice(0, 10);
    if (c.key === 'status' || c.key === 'severity') {
      const cls = ({
        active: 'green', operational: 'green', mitigated: 'green', closed: 'gray',
        paused: 'yellow', maintenance: 'yellow', on_leave: 'yellow', pending: 'yellow', expired: 'red',
        inactive: 'gray', decommissioned: 'gray', open: 'yellow', investigating: 'yellow',
        critical: 'red', high: 'red', medium: 'yellow', low: 'green',
      })[String(v).toLowerCase()] || 'gray';
      return <span className={`badge ${cls}`}>{String(v).toUpperCase()}</span>;
    }
    if (typeof v === 'string' && v.length > 64) return v.slice(0, 64) + '...';
    return String(v);
  }

  function renderInput(c) {
    const v = form[c.key] ?? '';
    if (c.type === 'select') {
      return (
        <select value={v} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}>
          <option value="">--</option>
          {(c.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (c.type === 'boolean') {
      return (
        <select value={v ? 'true' : 'false'} onChange={(e) => setForm({ ...form, [c.key]: e.target.value === 'true' })}>
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      );
    }
    if (c.type === 'textarea') {
      return <textarea value={v} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} />;
    }
    const inputType = c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : c.type === 'datetime' ? 'datetime-local' : 'text';
    return <input type={inputType} value={v} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} />;
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn secondary" onClick={exportCsv} disabled={loading || filtered.length === 0} title="Export current view to CSV">
            <Download size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> CSV
          </button>
          <button className="btn" onClick={startNew}><Plus size={14} style={{ verticalAlign: 'middle' }} /> New</button>
        </div>
      </div>

      <div className="toolbar">
        <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="muted" style={{ fontSize: 12 }}>
          {filtered.length === 0
            ? `0 / ${rows.length}`
            : `${pageStart + 1}-${Math.min(filtered.length, pageStart + PAGE_SIZE)} of ${filtered.length}${search ? ` (filtered from ${rows.length})` : ''}`}
        </span>
        <div style={{ flex: 1 }} />
        <button
          className="btn secondary small icon-only"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="muted" style={{ fontSize: 12, minWidth: 60, textAlign: 'center' }}>
          {safePage} / {totalPages}
        </span>
        <button
          className="btn secondary small icon-only"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {editing && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">{editing === 'new' ? 'New Record' : `Edit #${editing.id}`}</div>
          <div className="form-grid">
            {columns.map((c) => (
              <label key={c.key}>
                <span>{c.label}</span>
                {renderInput(c)}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={save}>Save</button>
            <button className="btn secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card table-wrap" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}><span className="spinner" /> Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: 24 }} className="muted">No records.</td></tr>
              )}
              {pageRows.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => <td key={c.key}>{renderCell(row, c)}</td>)}
                  <td className="right">
                    <button className="btn secondary small" onClick={() => startEdit(row)} style={{ marginRight: 6 }}>
                      <Pencil size={11} /> Edit
                    </button>
                    <button className="btn danger small" onClick={() => remove(row)}>
                      <Trash2 size={11} /> Delete
                    </button>
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
