const crypto = require('crypto');
const https = require('https');
const http = require('http');
const url = require('url');
const pool = require('../config/database');

function sign(secret, payload) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function deliver(target, body, signature) {
  return new Promise((resolve) => {
    try {
      const parsed = new url.URL(target);
      const lib = parsed.protocol === 'https:' ? https : http;
      const opts = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: (parsed.pathname || '/') + (parsed.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'X-Hub-Signature-256': signature,
          'User-Agent': 'AI-Construction-Safety-Hub/1.0',
        },
      };
      const req = lib.request(opts, (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => resolve({ status: res.statusCode, body: chunks.slice(0, 500) }));
      });
      req.on('error', (e) => resolve({ status: 0, body: e.message }));
      req.setTimeout(5000, () => { req.destroy(new Error('timeout')); });
      req.write(body);
      req.end();
    } catch (e) {
      resolve({ status: 0, body: e.message });
    }
  });
}

// Fire all active webhooks listening for `event`.
// Logs each delivery to webhook_logs.
async function fireWebhooks(event, payload) {
  try {
    const r = await pool.query('SELECT * FROM webhooks WHERE active = true');
    const hooks = r.rows.filter((h) => {
      if (!h.events) return true;
      const list = String(h.events).split(',').map((s) => s.trim()).filter(Boolean);
      return list.length === 0 || list.includes(event) || list.includes('*');
    });
    for (const h of hooks) {
      const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });
      const signature = sign(h.secret || 'unsigned', body);
      const result = await deliver(h.url, body, signature);
      const delivered = result.status >= 200 && result.status < 300;
      try {
        await pool.query(
          `INSERT INTO webhook_logs (webhook_id, event, payload, response_status, response_body, signature, delivered)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [h.id, event, payload, result.status || 0, result.body || '', signature, delivered]
        );
      } catch (_) {}
    }
  } catch (e) {
    console.error('[webhooks] fire error:', e.message);
  }
}

module.exports = { fireWebhooks, sign };
