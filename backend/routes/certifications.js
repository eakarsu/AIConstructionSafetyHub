// Certifications: CRUD + expiry endpoint.
// Wraps makeCrudRouter and adds a GET /expiring?days=<n> endpoint that returns
// certifications whose expires_on falls inside the next <days> days (default 60).
const express = require('express');
const { makeCrudRouter } = require('../services/crud');
const pool = require('../config/database');

const baseRouter = makeCrudRouter('certifications', [
  { name: 'cert_id' },
  { name: 'worker' },
  { name: 'worker_role' },
  { name: 'cert_name' },
  { name: 'issuing_body' },
  { name: 'issued_on' },
  { name: 'expires_on' },
  { name: 'status' },
  { name: 'notes' },
]);

const router = express.Router();

// /expiring must be declared BEFORE mounting baseRouter so that
// the param-less /:id route doesn't swallow it.
router.get('/expiring', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(365, parseInt(req.query.days) || 60));
    const r = await pool.query(
      `SELECT *, (expires_on - CURRENT_DATE) AS days_to_expiry
       FROM certifications
       WHERE expires_on IS NOT NULL
         AND expires_on <= CURRENT_DATE + ($1 || ' days')::interval
       ORDER BY expires_on ASC`,
      [days]
    );
    const rows = r.rows.map((x) => ({
      ...x,
      expired: x.days_to_expiry !== null && x.days_to_expiry < 0,
    }));
    res.json({ window_days: days, total: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use('/', baseRouter);

module.exports = router;
