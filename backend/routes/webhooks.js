const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// CRUD on webhooks
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM webhooks ORDER BY id DESC');
    res.json({ data: r.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, url, events, secret, active } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url is required' });
    const r = await pool.query(
      `INSERT INTO webhooks (name, url, events, secret, active)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name || '', url, events || '*', secret || '', active !== false]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, url, events, secret, active } = req.body || {};
    const r = await pool.query(
      `UPDATE webhooks SET name=$1, url=$2, events=$3, secret=$4, active=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [name, url, events, secret, active !== false, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM webhooks WHERE id=$1 RETURNING *', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/webhooks/:id/logs
router.get('/:id/logs', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM webhook_logs WHERE webhook_id=$1 ORDER BY id DESC LIMIT 50',
      [req.params.id]
    );
    res.json({ data: r.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/webhooks/logs/all
router.get('/logs/all', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM webhook_logs ORDER BY id DESC LIMIT 100');
    res.json({ data: r.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
