import React, { useEffect, useState } from 'react';
import { attachmentsList, attachmentUpload, attachmentDelete } from '../services/api';
import { Upload, Trash2, Download, Paperclip } from 'lucide-react';

const ENTITIES = ['incidents', 'inspections', 'hazards', 'near_misses', 'jha', 'workers', 'permits'];

export default function AttachmentsPage() {
  const [entityType, setEntityType] = useState('incidents');
  const [entityId, setEntityId] = useState('1');
  const [rows, setRows] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError('');
    try {
      const r = await attachmentsList(entityType, entityId);
      setRows(r.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [entityType, entityId]);

  async function doUpload() {
    if (!file) return;
    setError('');
    try {
      await attachmentUpload(entityType, entityId, file);
      setFile(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function doDelete(id) {
    if (!window.confirm('Delete attachment?')) return;
    await attachmentDelete(id);
    await load();
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <h1><Paperclip size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Attachments</h1>
          <p>Upload photos and documents to incidents, inspections, hazards, JHAs, and more.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">Select Entity</div>
        <div className="form-grid">
          <label>
            <span>Entity Type</span>
            <select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
              {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </label>
          <label>
            <span>Entity ID</span>
            <input type="number" value={entityId} onChange={(e) => setEntityId(e.target.value)} />
          </label>
        </div>
        <div className="section-title" style={{ marginTop: 12 }}>Upload</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button className="btn" onClick={doUpload} disabled={!file}>
            <Upload size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Upload
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        {loading ? <div style={{ padding: 24, textAlign: 'center' }}><span className="spinner" /> Loading...</div> : (
          <table className="table">
            <thead><tr><th>ID</th><th>Original Name</th><th>Type</th><th>Size</th><th>Uploaded By</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="7" style={{ padding: 24, textAlign: 'center' }} className="muted">No attachments.</td></tr>}
              {rows.map((a) => (
                <tr key={a.id}>
                  <td>#{a.id}</td>
                  <td>{a.original_name}</td>
                  <td className="muted">{a.mime_type}</td>
                  <td className="muted">{Math.round((a.size_bytes || 0) / 1024)} KB</td>
                  <td>{a.uploaded_by}</td>
                  <td className="muted">{String(a.created_at).replace('T', ' ').slice(0, 19)}</td>
                  <td className="right">
                    <a className="btn secondary small" href={`http://localhost:3031/api/attachments/${a.id}/download`} target="_blank" rel="noreferrer" style={{ marginRight: 6 }}>
                      <Download size={11} /> Download
                    </a>
                    <button className="btn danger small" onClick={() => doDelete(a.id)}><Trash2 size={11} /> Delete</button>
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
