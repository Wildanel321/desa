const express = require('express');
const { db } = require('../config/database');
const { POPULATION_STATS } = require('../data/seedData');
const { getAiEngineStatus } = require('../services/aiAnalyzer');

const router = express.Router();

router.get('/', (req, res) => {
  const statusRows = db
    .prepare('SELECT status, COUNT(*) AS count FROM complaints GROUP BY status')
    .all();

  const counts = {
    total: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0
  };

  for (const row of statusRows) {
    counts.total += row.count;
    if (row.status === 'Menunggu') counts.menunggu = row.count;
    if (row.status === 'Diproses') counts.diproses = row.count;
    if (row.status === 'Selesai') counts.selesai = row.count;
  }

  const byCategory = db
    .prepare(
      'SELECT category, COUNT(*) AS count FROM complaints GROUP BY category ORDER BY count DESC, category ASC'
    )
    .all();

  const recentActivities = db
    .prepare('SELECT id, action_type, description, actor, created_at FROM activity_logs ORDER BY created_at DESC, id DESC LIMIT 8')
    .all();

  const openComplaints = db
    .prepare(
      `SELECT id, ticket_code, title, category, location, status, ai_urgency, created_at
       FROM complaints
       WHERE status != 'Selesai'
       ORDER BY
         CASE ai_urgency WHEN 'Tinggi' THEN 1 WHEN 'Sedang' THEN 2 WHEN 'Rendah' THEN 3 ELSE 4 END,
         created_at DESC
       LIMIT 5`
    )
    .all();

  res.json({
    population: POPULATION_STATS,
    complaintsSummary: counts,
    byCategory,
    recentActivities,
    openComplaints,
    aiEngine: getAiEngineStatus()
  });
});

module.exports = router;
