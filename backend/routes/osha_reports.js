// OSHA 300 / 300A report generator.
// Pulls from incidents table and classifies recordability by simple rules.
// Supports format=json (default) or format=csv via query param.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Classification: derived from incidents columns. Rules are intentionally simple
// so that the same logic can be ported into a rules engine later.
function classifyRecordable(row) {
  const sev = String(row.severity || '').toLowerCase();
  const injury = row.injury_reported === true || row.injury_reported === 'true' || row.injury_reported === 't';
  if (!injury) return { recordable: false, classification: 'not_recordable' };
  if (sev === 'critical') return { recordable: true, classification: 'days_away' };
  if (sev === 'high') return { recordable: true, classification: 'days_away' };
  if (sev === 'medium') return { recordable: true, classification: 'job_transfer' };
  return { recordable: true, classification: 'other_recordable' };
}

function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toISOString().slice(0, 10); } catch (_) { return ''; }
}

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

// GET /api/osha-reports/300?year=2026&format=json|csv
router.get('/300', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const format = String(req.query.format || 'json').toLowerCase();
    const site = req.query.site || null;

    const params = [year];
    let sql = `SELECT * FROM incidents WHERE EXTRACT(YEAR FROM occurred_at) = $1`;
    if (site) {
      params.push(site);
      sql += ` AND site = $${params.length}`;
    }
    sql += ` ORDER BY occurred_at ASC`;
    const r = await pool.query(sql, params);

    const log = r.rows.map((row, idx) => {
      const c = classifyRecordable(row);
      return {
        case_no: row.incident_id || `CASE-${idx + 1}`,
        employee_name: row.employee_name || '',
        job_title: row.job_title || '',
        date_of_event: fmtDate(row.occurred_at),
        where_event_occurred: row.site || '',
        description_of_injury: row.description || '',
        classification: c.classification,
        recordable: c.recordable,
        days_away_from_work: c.classification === 'days_away' ? (row.days_away || 1) : 0,
        days_on_job_transfer: c.classification === 'job_transfer' ? (row.days_transfer || 1) : 0,
        severity: row.severity || '',
        type: row.type || '',
      };
    }).filter((e) => e.recordable);

    if (format === 'csv') {
      const headers = [
        'case_no', 'employee_name', 'job_title', 'date_of_event', 'where_event_occurred',
        'description_of_injury', 'classification', 'days_away_from_work', 'days_on_job_transfer',
        'severity', 'type',
      ];
      const lines = [headers.join(',')];
      for (const e of log) lines.push(headers.map((h) => csvEscape(e[h])).join(','));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="osha-300-${year}.csv"`);
      return res.send(lines.join('\n'));
    }

    res.json({ year, site: site || 'all', total_recordable: log.length, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/osha-reports/300A?year=2026&format=json|csv
router.get('/300A', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const format = String(req.query.format || 'json').toLowerCase();
    const site = req.query.site || null;

    const params = [year];
    let sql = `SELECT * FROM incidents WHERE EXTRACT(YEAR FROM occurred_at) = $1`;
    if (site) {
      params.push(site);
      sql += ` AND site = $${params.length}`;
    }
    const r = await pool.query(sql, params);

    let totalRecordable = 0;
    let daysAway = 0;
    let jobTransfer = 0;
    let otherRecordable = 0;
    let deaths = 0;
    let totalDaysAway = 0;
    let totalDaysTransfer = 0;
    const byType = {};

    for (const row of r.rows) {
      const c = classifyRecordable(row);
      if (!c.recordable) continue;
      totalRecordable++;
      if (c.classification === 'days_away') { daysAway++; totalDaysAway += (row.days_away || 1); }
      else if (c.classification === 'job_transfer') { jobTransfer++; totalDaysTransfer += (row.days_transfer || 1); }
      else if (c.classification === 'other_recordable') { otherRecordable++; }
      const t = row.type || 'other';
      byType[t] = (byType[t] || 0) + 1;
    }

    // Worker hours: pull worker_count from sites, assume 2000 hr/worker/yr
    const wh = await pool.query(`SELECT COALESCE(SUM(worker_count), 0) AS workers FROM sites${site ? ' WHERE name = $1' : ''}`,
      site ? [site] : []);
    const totalWorkers = parseInt(wh.rows[0].workers) || 0;
    const totalHoursWorked = totalWorkers * 2000;
    const dart = totalHoursWorked > 0
      ? Number(((daysAway + jobTransfer) * 200000 / totalHoursWorked).toFixed(2))
      : 0;
    const trir = totalHoursWorked > 0
      ? Number((totalRecordable * 200000 / totalHoursWorked).toFixed(2))
      : 0;

    const summary = {
      year,
      site: site || 'all',
      total_cases: totalRecordable,
      deaths,
      cases_with_days_away: daysAway,
      cases_with_job_transfer: jobTransfer,
      other_recordable_cases: otherRecordable,
      total_days_away_from_work: totalDaysAway,
      total_days_job_transfer: totalDaysTransfer,
      total_workers: totalWorkers,
      total_hours_worked: totalHoursWorked,
      trir_per_100_workers: trir,
      dart_per_100_workers: dart,
      by_type: byType,
    };

    if (format === 'csv') {
      const headers = Object.keys(summary).filter((k) => k !== 'by_type');
      const lines = [headers.join(',')];
      lines.push(headers.map((h) => csvEscape(summary[h])).join(','));
      lines.push('');
      lines.push('by_type,count');
      for (const [t, n] of Object.entries(byType)) lines.push(csvEscape(t) + ',' + n);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="osha-300A-${year}.csv"`);
      return res.send(lines.join('\n'));
    }

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
