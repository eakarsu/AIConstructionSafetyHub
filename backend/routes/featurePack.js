'use strict';
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth').authenticateToken;
const fp = require('../domain/featurePack');
const router = express.Router();
const tasks = new Map(); let seq = 1;
async function ownRecords(req) {
  if (Array.isArray(req.body && req.body.records)) return req.body.records;
  try { const r = await pool.query('SELECT * FROM incidents ORDER BY id DESC LIMIT 200'); return r.rows || []; } catch (_) { return []; }
}

router.get('/tasks', auth, (req,res)=> res.json({ data: fp.filterRecords([...tasks.values()], req.query) }));
router.post('/tasks', auth, (req,res)=>{ const title=String((req.body||{}).title||'').trim(); if(!title) return res.status(400).json({error:'title is required'}); const t={id:seq++, title, status:(req.body.status||'open'), priority:(req.body.priority||'medium'), description:(req.body.description??''), owner:(req.body.owner??req.user?.id??null), created_at:new Date().toISOString(), updated_at:new Date().toISOString()}; tasks.set(t.id,t); return res.status(201).json(t); });
router.put('/tasks/:id', auth, (req,res)=>{ const t=tasks.get(Number(req.params.id)); if(!t) return res.status(404).json({error:'Task not found'}); for(const k of ['title','status','priority','description','owner','due_date']) if(req.body[k]!==undefined) t[k]=req.body[k]; t.updated_at=new Date().toISOString(); return res.json(t); });
router.patch('/tasks/:id', auth, (req,res)=>{ const t=tasks.get(Number(req.params.id)); if(!t) return res.status(404).json({error:'Task not found'}); for(const k of ['title','status','priority','description','owner','due_date']) if(req.body[k]!==undefined) t[k]=req.body[k]; t.updated_at=new Date().toISOString(); return res.json(t); });

router.get('/incidents/search', auth, async (req, res) => { const rows = await ownRecords(req); res.json({ data: fp.filterRecords(rows, req.query), total: fp.filterRecords(rows, req.query).length }); });
router.get('/export/incidents', auth, async (req, res) => {
  const rows = fp.filterRecords(await ownRecords(req), req.query);
  if (String(req.query.format||'csv').toLowerCase() === 'json') return res.json({ data: rows });
  res.setHeader('Content-Type','text/csv'); res.setHeader('Content-Disposition','attachment; filename="incidents.csv"');
  return res.send(fp.toCsv(rows) || 'id\n');
});
router.post('/ai/incident-risk', auth, async (req,res)=> res.json(await fp.runAi('incident-risk', await ownRecords(req), fp.incidentRisk)));
router.post('/ai/hazard-trend', auth, async (req,res)=> res.json(await fp.runAi('hazard-trend', await ownRecords(req), fp.hazardTrend)));
router.post('/ai/training-gap', auth, async (req,res)=> res.json(await fp.runAi('training-gap', await ownRecords(req), fp.trainingGap)));
module.exports = router;
