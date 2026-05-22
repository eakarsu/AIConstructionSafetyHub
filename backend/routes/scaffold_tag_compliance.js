const express = require('express');

const router = express.Router();

let rows = [
  { id: 1, scaffold_id: 'SCF-A12', site_name: 'East Podium', tag_color: 'yellow', last_inspection: '2026-05-21', competent_person: 'J. Rivera', open_defects: 2, status: 'restricted' },
  { id: 2, scaffold_id: 'SCF-C04', site_name: 'West Core', tag_color: 'green', last_inspection: '2026-05-22', competent_person: 'K. Singh', open_defects: 0, status: 'approved' },
];
const nextId = () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

router.get('/', (req, res) => res.json(rows));
router.post('/', (req, res) => {
  const row = { id: nextId(), ...req.body };
  rows.unshift(row);
  res.status(201).json(row);
});
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = rows.findIndex((row) => row.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  rows[idx] = { ...rows[idx], ...req.body, id };
  res.json(rows[idx]);
});
router.delete('/:id', (req, res) => {
  rows = rows.filter((row) => row.id !== Number(req.params.id));
  res.json({ message: 'deleted' });
});

module.exports = router;
