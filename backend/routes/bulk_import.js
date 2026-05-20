const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../config/database');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Simple CSV parser (handles quoted fields with commas and newlines)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (ch === '\r') { /* skip */ }
      else cur += ch;
    }
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
  if (rows.length === 0) return { headers: [], data: [] };
  const headers = rows[0].map((h) => h.trim());
  const data = rows.slice(1).filter((r) => r.length > 0 && r.some((v) => v !== '')).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = r[idx] !== undefined ? r[idx] : null; });
    return obj;
  });
  return { headers, data };
}

const ENTITIES = {
  workers: {
    table: 'workers',
    columns: ['worker_id', 'name', 'role', 'certifications', 'site', 'status', 'hire_date'],
  },
  contractors: {
    table: 'contractors',
    columns: ['contractor_id', 'name', 'license_no', 'insurance_expiry', 'safety_score', 'status'],
  },
  permits: {
    table: 'permits',
    columns: ['permit_id', 'site', 'type', 'issued_to', 'valid_from', 'valid_to', 'status'],
  },
};

// POST /api/bulk-import/:entity
router.post('/:entity', upload.single('file'), async (req, res) => {
  try {
    const cfg = ENTITIES[req.params.entity];
    if (!cfg) return res.status(400).json({ error: `Unsupported entity. Allowed: ${Object.keys(ENTITIES).join(',')}` });
    let csvText = null;
    if (req.file) csvText = req.file.buffer.toString('utf8');
    else if (req.body && req.body.csv) csvText = req.body.csv;
    if (!csvText) return res.status(400).json({ error: 'Provide a multipart "file" or JSON {csv: "..."}' });

    const { headers, data } = parseCsv(csvText);
    const missing = cfg.columns.filter((c) => !headers.includes(c));
    if (missing.length === cfg.columns.length) {
      return res.status(400).json({ error: `CSV is missing all expected columns. Expected at least one of: ${cfg.columns.join(', ')}` });
    }

    let inserted = 0;
    let failed = 0;
    const errors = [];
    for (const row of data) {
      try {
        const cols = cfg.columns.filter((c) => row[c] !== undefined && row[c] !== '');
        const vals = cols.map((c) => row[c]);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
        const sql = `INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${placeholders})`;
        await pool.query(sql, vals);
        inserted += 1;
      } catch (e) {
        failed += 1;
        if (errors.length < 10) errors.push({ row, error: e.message });
      }
    }
    res.json({
      entity: req.params.entity,
      total_rows: data.length,
      inserted,
      failed,
      errors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bulk-import/template/:entity
router.get('/template/:entity', (req, res) => {
  const cfg = ENTITIES[req.params.entity];
  if (!cfg) return res.status(400).json({ error: 'Unknown entity' });
  res.type('text/csv').send(cfg.columns.join(',') + '\n');
});

module.exports = router;
