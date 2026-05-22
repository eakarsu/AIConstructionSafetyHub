// Lone-worker monitor: check-in / dead-man-switch endpoint.
// CRUD on lone_worker_checkins, plus:
//   GET /overdue - records whose next_checkin_due is in the past and status != resolved
//   POST /:id/ack - acknowledge / mark resolved
const express = require('express');
const { makeCrudRouter } = require('../services/crud');
const pool = require('../config/database');

const baseRouter = makeCrudRouter('lone_worker_checkins', [
  { name: 'checkin_id' },
  { name: 'worker' },
  { name: 'site' },
  { name: 'lat' },
  { name: 'lng' },
  { name: 'status' },
  { name: 'next_checkin_due' },
  { name: 'battery_pct' },
  { name: 'notes' },
]);

const router = express.Router();

router.get('/overdue', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM lone_worker_checkins
       WHERE next_checkin_due IS NOT NULL
         AND next_checkin_due < NOW()
         AND status NOT IN ('resolved','off-duty')
       ORDER BY next_checkin_due ASC`
    );
    res.json({ total: r.rows.length, data: r.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/ack', async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE lone_worker_checkins SET status = 'resolved', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use('/', baseRouter);

module.exports = router;
