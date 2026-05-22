// Drone safety walkthrough: batch photo ingest + AI walkthrough scoring.
// Needs DJI / Skydio platform credentials — returns 503 stub.
const express = require('express');
const router = express.Router();

function stub503(req, res) {
  res.status(503).json({
    error: 'Drone integration not configured',
    detail: 'Set vendor credentials (DJI_API_KEY / SKYDIO_API_KEY) and walkthrough scoring rubric to enable.',
    supported_platforms: ['DJI', 'Skydio'],
    endpoint: req.originalUrl || req.url,
  });
}

router.get('/status', (req, res) => {
  res.json({
    configured: false,
    supported_platforms: ['DJI', 'Skydio'],
    capabilities: ['batch_photo_ingest', 'walkthrough_scoring', 'thermal_overlay'],
  });
});

router.post('/walkthrough', stub503);
router.post('/photos/ingest', stub503);
router.get('/missions', stub503);

module.exports = router;
