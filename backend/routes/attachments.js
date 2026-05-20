const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../config/database');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch (_) {}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9._-]/gi, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

// POST /api/attachments - upload a file
// multipart: file (the upload), entity_type, entity_id
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    const { entity_type, entity_id } = req.body || {};
    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: 'entity_type and entity_id are required' });
    }
    const uploadedBy = (req.user && req.user.email) || 'anonymous';
    const r = await pool.query(
      `INSERT INTO attachments (entity_type, entity_id, filename, original_name, mime_type, size_bytes, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [entity_type, parseInt(entity_id), req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, uploadedBy]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attachments?entity_type=X&entity_id=Y
router.get('/', async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;
    let r;
    if (entity_type && entity_id) {
      r = await pool.query(
        'SELECT * FROM attachments WHERE entity_type=$1 AND entity_id=$2 ORDER BY id DESC',
        [entity_type, parseInt(entity_id)]
      );
    } else {
      r = await pool.query('SELECT * FROM attachments ORDER BY id DESC LIMIT 200');
    }
    res.json({ data: r.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attachments/:id/download
router.get('/:id/download', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM attachments WHERE id=$1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const a = r.rows[0];
    const p = path.join(UPLOAD_DIR, a.filename);
    if (!fs.existsSync(p)) return res.status(404).json({ error: 'File missing on disk' });
    res.download(p, a.original_name || a.filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/attachments/:id
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM attachments WHERE id=$1 RETURNING *', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    try { fs.unlinkSync(path.join(UPLOAD_DIR, r.rows[0].filename)); } catch (_) {}
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
