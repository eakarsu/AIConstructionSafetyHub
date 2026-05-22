// Wearables telemetry ingestion (smart-helmet, harness, heart-rate, GPS).
// Needs vendor SDK credentials (Spot-r, Triax, Guardhat) — returns 503 stub.
const express = require('express');
const router = express.Router();

function stub503(req, res) {
  res.status(503).json({
    error: 'Wearable integration not configured',
    detail: 'Set vendor credentials (SPOTR_API_KEY / TRIAX_API_KEY / GUARDHAT_API_KEY) to enable telemetry ingestion.',
    supported_vendors: ['Spot-r', 'Triax', 'Guardhat'],
    endpoint: req.originalUrl || req.url,
  });
}

router.get('/status', (req, res) => {
  res.json({
    configured: false,
    supported_vendors: ['Spot-r', 'Triax', 'Guardhat'],
    metrics: ['impact_g', 'fall_detection', 'heart_rate_bpm', 'gps_lat', 'gps_lng', 'battery_pct'],
  });
});

router.post('/telemetry', stub503);
router.post('/devices/:id/register', stub503);
router.get('/devices', stub503);

module.exports = router;
