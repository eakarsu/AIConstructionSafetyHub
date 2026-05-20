const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '../.env' });

const pool = require('./config/database');
const { authenticateToken, requireWritePermission } = require('./middleware/auth');
const { fireWebhooks } = require('./services/webhooks');

const app = express();
const PORT = process.env.BACKEND_PORT || 3031;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3030,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, true); // permissive in dev
  },
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'construction-safety-hub', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Everything else under /api/* requires a valid JWT
app.use('/api', authenticateToken);

// Hook into write-side effects: notifications + webhooks for high-signal entities.
// Implemented as an Express middleware that wraps res.json on POST/PUT to specific routes.
function sideEffects(req, res, next) {
  const isWrite = req.method === 'POST' || req.method === 'PUT';
  if (!isWrite) return next();
  const url = req.originalUrl || req.url;
  const trackedPaths = ['/api/incidents', '/api/near_misses', '/api/hazards', '/api/claims'];
  const matched = trackedPaths.find((p) => url.startsWith(p));
  if (!matched) return next();
  const origJson = res.json.bind(res);
  res.json = (payload) => {
    try {
      const row = payload && payload.id ? payload : (payload && payload.record ? payload.record : null);
      if (row) {
        let event = matched.replace('/api/', '').replace('s', '') + '.upserted';
        let severity = String(row.severity || row.severity_if_realized || 'low').toLowerCase();
        const title = `${event}: ${row.incident_id || row.near_miss_id || row.hazard_id || row.claim_id || row.id}`;
        const body = (row.description || row.action_taken || row.type || '').slice(0, 240);
        const fireHigh = ['high', 'critical'].includes(severity);
        if (matched === '/api/incidents' || matched === '/api/near_misses' || (matched === '/api/hazards' && fireHigh) || matched === '/api/claims') {
          pool.query(
            `INSERT INTO notifications (type, title, body, severity, link)
             VALUES ($1,$2,$3,$4,$5)`,
            [event, title, body, severity, matched]
          ).catch(() => {});
          fireWebhooks(event, row).catch(() => {});
        }
      }
    } catch (_) {}
    return origJson(payload);
  };
  next();
}
app.use(sideEffects);

// Notifications, attachments, webhooks, bulk-import (no write-permission gate)
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/bulk-import', require('./routes/bulk_import'));

// CRUD routes (write-protected: workers can read but cannot mutate)
app.use('/api/sites', requireWritePermission, require('./routes/sites'));
app.use('/api/workers', requireWritePermission, require('./routes/workers'));
app.use('/api/equipment', requireWritePermission, require('./routes/equipment'));
app.use('/api/incidents', requireWritePermission, require('./routes/incidents'));
app.use('/api/inspections', requireWritePermission, require('./routes/inspections'));
app.use('/api/permits', requireWritePermission, require('./routes/permits'));
app.use('/api/trainings', requireWritePermission, require('./routes/trainings'));
app.use('/api/hazards', requireWritePermission, require('./routes/hazards'));

// 10 new CRUD entities
app.use('/api/jha', requireWritePermission, require('./routes/jha'));
app.use('/api/near_misses', requireWritePermission, require('./routes/near_misses'));
app.use('/api/safety_meetings', requireWritePermission, require('./routes/safety_meetings'));
app.use('/api/ppe_inventory', requireWritePermission, require('./routes/ppe_inventory'));
app.use('/api/contractors', requireWritePermission, require('./routes/contractors'));
app.use('/api/subcontractors', requireWritePermission, require('./routes/subcontractors'));
app.use('/api/drug_tests', requireWritePermission, require('./routes/drug_tests'));
app.use('/api/dot_records', requireWritePermission, require('./routes/dot_records'));
app.use('/api/claims', requireWritePermission, require('./routes/claims'));
app.use('/api/vendors', requireWritePermission, require('./routes/vendors'));

// AI routes
app.use('/api/ai', require('./routes/ai'));

// Custom Views (mounted BEFORE 404 handler)
app.use('/api/custom-views', require('./routes/customViews'));

// 404 fallback for /api/*
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));

app.listen(PORT, () => {
  console.log(`\n[Construction Safety Hub] API running on http://localhost:${PORT}\n`);
});
