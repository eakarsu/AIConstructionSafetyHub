const express = require('express');
const pool = require('../config/database');

// Build a generic CRUD router for a table with the given allowed columns.
// columns: array of { name, default? }
function makeCrudRouter(table, columns) {
  const router = express.Router();

  // LIST
  router.get('/', async (req, res) => {
    try {
      const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 100));
      const offset = Math.max(0, parseInt(req.query.offset) || 0);
      const result = await pool.query(
        `SELECT * FROM ${table} ORDER BY id DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      const countRes = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      res.json({ data: result.rows, total: parseInt(countRes.rows[0].count) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET ONE
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // CREATE
  router.post('/', async (req, res) => {
    try {
      const cols = columns.map((c) => c.name);
      const values = cols.map((c) => req.body[c] === undefined ? null : req.body[c]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
      const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders}) RETURNING *`;
      const result = await pool.query(sql, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // UPDATE
  router.put('/:id', async (req, res) => {
    try {
      const cols = columns.map((c) => c.name);
      const sets = cols.map((c, i) => `${c}=$${i + 1}`).join(',');
      const values = cols.map((c) => req.body[c] === undefined ? null : req.body[c]);
      values.push(req.params.id);
      const sql = `UPDATE ${table} SET ${sets}, updated_at=NOW() WHERE id=$${values.length} RETURNING *`;
      const result = await pool.query(sql, values);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted', record: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = { makeCrudRouter };
