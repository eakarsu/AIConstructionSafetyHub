const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/notifications - list (most recent first)
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const r = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    const unread = await pool.query('SELECT COUNT(*) FROM notifications WHERE read = false');
    res.json({ data: r.rows, unread_count: parseInt(unread.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', async (req, res) => {
  try {
    const r = await pool.query('SELECT COUNT(*) FROM notifications WHERE read = false');
    res.json({ unread_count: parseInt(r.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications - create
router.post('/', async (req, res) => {
  try {
    const { type, title, body, severity, link, user_id } = req.body || {};
    const r = await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, severity, link)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [user_id || null, type || 'info', title || '', body || '', severity || 'low', link || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', async (req, res) => {
  try {
    const r = await pool.query('UPDATE notifications SET read=true WHERE id=$1 RETURNING *', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET read=true WHERE read=false');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM notifications WHERE id=$1 RETURNING *', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
