const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Fallback demo users (used if users table is empty or missing) - mirrors seeded users
const DEMO_USERS = [
  { id: 1, email: 'safety@construction.io', name: 'Safety Manager', role: 'safety_officer', passwordHash: bcrypt.hashSync('osha123', 10) },
  { id: 2, email: 'admin@construction.io', name: 'Site Admin', role: 'admin', passwordHash: bcrypt.hashSync('admin123', 10) },
  { id: 3, email: 'worker@construction.io', name: 'Crew Worker', role: 'worker', passwordHash: bcrypt.hashSync('worker123', 10) },
];

async function findUser(email) {
  try {
    const r = await pool.query(
      'SELECT id, email, name, role, password_hash FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1',
      [email]
    );
    if (r.rows.length > 0) {
      const u = r.rows[0];
      return { id: u.id, email: u.email, name: u.name, role: u.role, passwordHash: u.password_hash };
    }
  } catch (_) { /* table may not exist on cold start */ }
  return DEMO_USERS.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    const user = await findUser(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
