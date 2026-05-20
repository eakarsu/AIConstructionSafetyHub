import React, { useState } from 'react';
import { bulkImport } from '../services/api';
import { Upload, FileText, Download } from 'lucide-react';

const ENTITIES = ['workers', 'contractors', 'permits'];
const HEADERS = {
  workers: 'worker_id,name,role,certifications,site,status,hire_date',
  contractors: 'contractor_id,name,license_no,insurance_expiry,safety_score,status',
  permits: 'permit_id,site,type,issued_to,valid_from,valid_to,status',
};

export default function BulkImportPage() {
  const [entity, setEntity] = useState('workers');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    if (!file) { setError('Choose a CSV file first'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const r = await bulkImport(entity, file);
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([HEADERS[entity] + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entity}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <h1><FileText size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Bulk CSV Import</h1>
          <p>Import workers, contractors, or permits from a CSV file.</p>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Configure</div>
        <div className="form-grid">
          <label>
            <span>Entity</span>
            <select value={entity} onChange={(e) => { setEntity(e.target.value); setResult(null); }}>
              {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </label>
          <label>
            <span>Expected Headers</span>
            <input value={HEADERS[entity]} readOnly />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
          <button className="btn secondary" onClick={downloadTemplate}>
            <Download size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Template
          </button>
          <button className="btn" onClick={run} disabled={loading || !file}>
            {loading ? <><span className="spinner" /> Importing...</> : <><Upload size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Import</>}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      {result && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-title">Import Result</div>
          <div className="grid cols-4">
            <div className="card"><div className="muted">Entity</div><div style={{ fontSize: 18, fontWeight: 600 }}>{result.entity}</div></div>
            <div className="card"><div className="muted">Total Rows</div><div style={{ fontSize: 18, fontWeight: 600 }}>{result.total_rows}</div></div>
            <div className="card"><div className="muted">Inserted</div><div style={{ fontSize: 18, fontWeight: 600, color: '#22c55e' }}>{result.inserted}</div></div>
            <div className="card"><div className="muted">Failed</div><div style={{ fontSize: 18, fontWeight: 600, color: '#ef4444' }}>{result.failed}</div></div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 12 }}>First Errors</div>
              <pre className="ai-output">{JSON.stringify(result.errors, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
