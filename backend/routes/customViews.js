// Custom Views router for AIConstructionSafetyHub
// 4 endpoints: incident-heatmap (VIZ), safety-score-trend (VIZ),
// incident-investigation-pdf (NON-VIZ), safety-rules (NON-VIZ CRUD).
const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// In-memory store of safety rules / permits (no schema change required).
let RULES_STORE = [
  {
    id: 1,
    rule_id: 'SR-001',
    category: 'Fall Protection',
    title: 'PFAS required above 6 ft',
    permit_type: 'Hot Work',
    description: 'All workers at 6+ ft must use a personal fall arrest system anchored to a rated point.',
    osha_ref: '1926.501(b)(1)',
    severity: 'critical',
    active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    rule_id: 'SR-002',
    category: 'Electrical',
    title: 'LOTO before energized panel work',
    permit_type: 'Electrical',
    description: 'Lockout/tagout verified by competent person before opening 480V panels.',
    osha_ref: '1910.147',
    severity: 'critical',
    active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    rule_id: 'SR-003',
    category: 'Excavation',
    title: 'Type C soil sloped 1.5:1 minimum',
    permit_type: 'Excavation',
    description: 'Soil classification by competent person; trench boxes required >5 ft if not sloped.',
    osha_ref: '1926.652',
    severity: 'high',
    active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    rule_id: 'SR-004',
    category: 'Hot Work',
    title: 'Fire watch 30 min after hot work',
    permit_type: 'Hot Work',
    description: 'Maintain fire watch for 30 minutes after cessation of hot work in industrial zones.',
    osha_ref: '1926.352',
    severity: 'high',
    active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    rule_id: 'SR-005',
    category: 'Confined Space',
    title: 'Continuous gas monitoring',
    permit_type: 'Confined Space',
    description: 'Continuous O2 / LEL / H2S monitoring with calibrated 4-gas meter and attendant.',
    osha_ref: '1926.1204',
    severity: 'critical',
    active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    rule_id: 'SR-006',
    category: 'PPE',
    title: 'Hi-vis Class 2 in TTC zones',
    permit_type: 'Traffic Control',
    description: 'ANSI Class 2 hi-vis required for all workers exposed to vehicular traffic.',
    osha_ref: '1926.201',
    severity: 'medium',
    active: true,
    updated_at: new Date().toISOString(),
  },
];
let RULES_NEXT_ID = 7;

// -------------------- VIZ 1: Incident Heatmap (site x type) ------------------
router.get('/incident-heatmap', async (req, res) => {
  try {
    let rows = [];
    try {
      const result = await pool.query(
        `SELECT site, type, COUNT(*)::int AS cnt
           FROM incidents
          WHERE site IS NOT NULL AND type IS NOT NULL
          GROUP BY site, type`
      );
      rows = result.rows;
    } catch (_) {
      rows = [];
    }

    const sites = Array.from(new Set(rows.map((r) => r.site))).sort();
    const types = Array.from(new Set(rows.map((r) => r.type))).sort();

    // Fallback synthetic data if DB has no incidents
    if (sites.length === 0 || types.length === 0) {
      const fbSites = ['Riverside Tower Phase II', 'I-90 Bridge Deck Replacement', 'East Campus Excavation', 'Tower 88 Curtain Wall', 'Refinery Turnaround Unit 22'];
      const fbTypes = ['fall', 'struck-by', 'electrocution', 'caught-in', 'other'];
      const cells = [];
      fbSites.forEach((s, i) => {
        fbTypes.forEach((t, j) => {
          cells.push({ site: s, type: t, count: ((i * 7 + j * 3) % 6) });
        });
      });
      return res.json({
        sites: fbSites,
        types: fbTypes,
        cells,
        total: cells.reduce((s, c) => s + c.count, 0),
        source: 'synthetic',
      });
    }

    const cells = [];
    sites.forEach((s) => {
      types.forEach((t) => {
        const row = rows.find((r) => r.site === s && r.type === t);
        cells.push({ site: s, type: t, count: row ? row.cnt : 0 });
      });
    });

    res.json({
      sites,
      types,
      cells,
      total: cells.reduce((sum, c) => sum + c.count, 0),
      source: 'db',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- VIZ 2: Safety Score Trend (chart) ----------------------
router.get('/safety-score-trend', async (req, res) => {
  try {
    let trend = [];
    try {
      const result = await pool.query(
        `SELECT DATE_TRUNC('week', conducted_at)::date AS week,
                AVG(score)::float AS avg_score,
                COUNT(*)::int     AS inspections
           FROM inspections
          WHERE conducted_at IS NOT NULL AND score IS NOT NULL
          GROUP BY week
          ORDER BY week`
      );
      trend = result.rows.map((r) => ({
        week: r.week ? new Date(r.week).toISOString().slice(0, 10) : null,
        avg_score: Math.round((r.avg_score || 0) * 10) / 10,
        inspections: r.inspections,
      }));
    } catch (_) {
      trend = [];
    }

    if (trend.length === 0) {
      // Synthetic 12-week trend
      const today = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 7 * 86400000);
        const base = 82 + Math.sin(i / 2) * 6 + (11 - i) * 0.5;
        trend.push({
          week: d.toISOString().slice(0, 10),
          avg_score: Math.round(base * 10) / 10,
          inspections: 3 + ((i * 5) % 5),
        });
      }
    }

    const overall =
      trend.length === 0
        ? 0
        : Math.round((trend.reduce((s, p) => s + p.avg_score, 0) / trend.length) * 10) / 10;

    const last = trend[trend.length - 1] || { avg_score: 0 };
    const first = trend[0] || { avg_score: 0 };
    const delta = Math.round((last.avg_score - first.avg_score) * 10) / 10;

    res.json({
      trend,
      overall_avg: overall,
      delta_first_to_last: delta,
      points: trend.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- NON-VIZ 1: Incident Investigation PDF ------------------
// Generates a "PDF-style" investigation report as text. Optional ?incident_id=...
router.get('/incident-investigation-pdf', async (req, res) => {
  try {
    const incidentId = req.query.incident_id;
    let incident = null;
    try {
      if (incidentId) {
        const r = await pool.query(`SELECT * FROM incidents WHERE id=$1 OR incident_id=$2 LIMIT 1`,
          [parseInt(incidentId) || 0, String(incidentId)]);
        if (r.rows.length) incident = r.rows[0];
      } else {
        const r = await pool.query(`SELECT * FROM incidents ORDER BY id DESC LIMIT 1`);
        if (r.rows.length) incident = r.rows[0];
      }
    } catch (_) {}

    if (!incident) {
      incident = {
        incident_id: 'INC-DEMO',
        site: 'Riverside Tower Phase II',
        type: 'fall',
        severity: 'high',
        injury_reported: true,
        occurred_at: new Date().toISOString(),
        status: 'investigating',
        description: 'Worker fell from leading edge; investigation underway.',
      };
    }

    const generatedAt = new Date().toISOString();
    const lines = [];
    lines.push('================================================================');
    lines.push('         CONSTRUCTION SAFETY HUB - INCIDENT INVESTIGATION');
    lines.push('================================================================');
    lines.push('');
    lines.push(`Report ID:        IR-${(incident.incident_id || incident.id)}-${Date.now()}`);
    lines.push(`Generated:        ${generatedAt}`);
    lines.push(`Incident ID:      ${incident.incident_id || incident.id}`);
    lines.push(`Site:             ${incident.site || '-'}`);
    lines.push(`Type:             ${incident.type || '-'}`);
    lines.push(`Severity:         ${incident.severity || '-'}`);
    lines.push(`Injury Reported:  ${incident.injury_reported ? 'YES' : 'no'}`);
    lines.push(`Occurred At:      ${incident.occurred_at || '-'}`);
    lines.push(`Status:           ${incident.status || '-'}`);
    lines.push('');
    lines.push('--- DESCRIPTION ---');
    lines.push(String(incident.description || '-'));
    lines.push('');
    lines.push('--- ROOT CAUSE ANALYSIS (preliminary) ---');
    lines.push('* Direct cause: see description above');
    lines.push('* Contributing factors: PPE / supervision / hazard control / training');
    lines.push('* Systemic factors: pre-task planning, JHA coverage, competency verification');
    lines.push('');
    lines.push('--- CORRECTIVE ACTIONS ---');
    lines.push('1. Re-toolbox the crew on the relevant OSHA standard.');
    lines.push('2. Verify all anchor points / LOTO / permits on the affected work area.');
    lines.push('3. Update the JHA and add the failure mode to the hazard register.');
    lines.push('4. Re-inspect within 7 days; verify closure with photo evidence.');
    lines.push('');
    lines.push('--- OSHA REFERENCE ---');
    lines.push('1926 Subpart M (Fall Protection), 1910.147 (LOTO), 1926.652 (Excavation)');
    lines.push('');
    lines.push('Investigator:    ____________________');
    lines.push('Safety Officer:  ____________________');
    lines.push('Date:            ____________________');
    lines.push('================================================================');

    const body = lines.join('\n');
    // text/plain with a .txt-style filename so clients can save it
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="incident_${incident.incident_id || incident.id}.txt"`
    );
    res.status(200).send(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- NON-VIZ 2: Safety Rules / Permit Editor (CRUD) --------
router.get('/safety-rules', (req, res) => {
  res.json({ data: RULES_STORE, total: RULES_STORE.length });
});

router.post('/safety-rules', (req, res) => {
  const b = req.body || {};
  const item = {
    id: RULES_NEXT_ID++,
    rule_id: b.rule_id || `SR-${String(RULES_NEXT_ID).padStart(3, '0')}`,
    category: b.category || 'General',
    title: b.title || 'Untitled rule',
    permit_type: b.permit_type || '-',
    description: b.description || '',
    osha_ref: b.osha_ref || '',
    severity: b.severity || 'medium',
    active: b.active !== false,
    updated_at: new Date().toISOString(),
  };
  RULES_STORE.push(item);
  res.status(201).json(item);
});

router.put('/safety-rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = RULES_STORE.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  RULES_STORE[idx] = { ...RULES_STORE[idx], ...req.body, id, updated_at: new Date().toISOString() };
  res.json(RULES_STORE[idx]);
});

router.delete('/safety-rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = RULES_STORE.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = RULES_STORE.splice(idx, 1);
  res.json({ message: 'Deleted', record: removed });
});

module.exports = router;
