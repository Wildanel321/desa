const express = require('express');
const { db, logActivity } = require('../config/database');
const {
  VILLAGE_PROFILE,
  VILLAGE_OFFICIALS,
  ADMIN_SERVICES
} = require('../data/villageKnowledge');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const announcements = db
    .prepare('SELECT id, title, category, summary, content, published_at FROM announcements ORDER BY published_at DESC, id DESC')
    .all();

  res.json({
    profile: VILLAGE_PROFILE,
    officials: VILLAGE_OFFICIALS,
    services: ADMIN_SERVICES,
    announcements
  });
});

router.post('/announcements', requireAdmin, (req, res) => {
  const { title, category, summary, content } = req.body || {};
  const cleanTitle = String(title || '').trim();
  const cleanCategory = String(category || '').trim() || 'Informasi Umum';
  const cleanSummary = String(summary || '').trim();
  const cleanContent = String(content || '').trim();

  if (cleanTitle.length < 5) {
    return res.status(400).json({ error: 'Judul pengumuman minimal 5 karakter.' });
  }
  if (cleanContent.length < 15) {
    return res.status(400).json({ error: 'Isi pengumuman minimal 15 karakter.' });
  }

  const effectiveSummary =
    cleanSummary.length >= 10
      ? cleanSummary
      : `${cleanContent.slice(0, 140).trim()}${cleanContent.length > 140 ? '...' : ''}`;
  const now = new Date().toISOString();

  const result = db
    .prepare(
      'INSERT INTO announcements (title, category, summary, content, published_at) VALUES (?, ?, ?, ?, ?)'
    )
    .run(cleanTitle, cleanCategory, effectiveSummary, cleanContent, now);

  logActivity('announcement_created', `Pengumuman baru diterbitkan: ${cleanTitle}.`, req.user.name);

  const created = db
    .prepare('SELECT id, title, category, summary, content, published_at FROM announcements WHERE id = ?')
    .get(result.lastInsertRowid);

  return res.status(201).json(created);
});

module.exports = router;
