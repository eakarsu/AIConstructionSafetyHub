const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

const JWT_SECRET = process.env.JWT_SECRET || 'construction-safety-hub-secret-key-2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based authorization. Accepts a list of allowed roles.
// admin always has access.
function requireRoles(...allowed) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role) return res.status(401).json({ error: 'Not authenticated' });
    if (role === 'admin') return next();
    if (allowed.includes(role)) return next();
    return res.status(403).json({ error: `Insufficient permissions (role: ${role})` });
  };
}

// Read-only writes block: workers can read but cannot write.
// Use on routers: blocks POST/PUT/DELETE unless role is admin or safety_officer.
function requireWritePermission(req, res, next) {
  const role = req.user && req.user.role;
  if (!role) return res.status(401).json({ error: 'Not authenticated' });
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  if (role === 'admin' || role === 'safety_officer') return next();
  return res.status(403).json({ error: `Read-only access for role: ${role}` });
}

module.exports = { authenticateToken, requireRoles, requireWritePermission, JWT_SECRET };
