const express = require('express');
const { db, logActivity, generateNextTicketCode } = require('../config/database');
const { requireAdmin, verifyToken } = require('../middleware/auth');
const { analyzeComplaint } = require('../services/aiAnalyzer');

const router = express.Router();

const ALLOWED_STATUSES = ['Menunggu', 'Diproses', 'Selesai'];

router.get('/', (req, res) => {
  const { status, category, q } = req.query;
  const clauses = [];
  const params = [];

  if (status && ALLOWED_STATUSES.includes(status)) {
    clauses.push('status = ?');
    params.push(status);
  }
  if (category && category !== 'Semua') {
    clauses.push('category = ?');
    params.push(category);
  }
  if (q && String(q).trim()) {
    const keyword = `%${String(q).trim()}%`;
    clauses.push('(title LIKE ? OR location LIKE ? OR description LIKE ? OR ticket_code LIKE ?)');
    params.push(keyword, keyword, keyword, keyword);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const items = db
    .prepare(`SELECT * FROM complaints ${whereSql} ORDER BY created_at DESC, id DESC`)
    .all(...params);

  res.json({ items, total: items.length });
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID pengaduan tidak valid.' });
  }
  const item = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
  if (!item) {
    return res.status(404).json({ error: 'Pengaduan tidak ditemukan.' });
  }
  return res.json(item);
});

router.post('/', (req, res) => {
  const { title, category, location, description, reporterLabel } = req.body || {};

  const cleanTitle = String(title || '').trim();
  const cleanCategory = String(category || '').trim();
  const cleanLocation = String(location || '').trim();
  const cleanDescription = String(description || '').trim();
  const cleanReporter = String(reporterLabel || '').trim() || 'Warga Desa (Demo)';

  if (cleanTitle.length < 5) {
    return res.status(400).json({ error: 'Judul laporan minimal 5 karakter.' });
  }
  if (!cleanCategory) {
    return res.status(400).json({ error: 'Silakan pilih kategori pengaduan.' });
  }
  if (cleanLocation.length < 3) {
    return res.status(400).json({ error: 'Lokasi kejadian wajib diisi (minimal 3 karakter).' });
  }
  if (cleanDescription.length < 15) {
    return res.status(400).json({ error: 'Deskripsi pengaduan minimal 15 karakter agar mudah ditindaklanjuti.' });
  }

  const ticketCode = generateNextTicketCode();
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO complaints (
        ticket_code, title, category, location, reporter_label, description,
        status, admin_note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Menunggu', '', ?, ?)`
    )
    .run(ticketCode, cleanTitle, cleanCategory, cleanLocation, cleanReporter, cleanDescription, now, now);

  logActivity(
    'complaint_created',
    `Laporan baru ${ticketCode} masuk: ${cleanTitle}.`,
    cleanReporter
  );

  const created = db.prepare('SELECT * FROM complaints WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(created);
});

router.patch('/:id/status', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { status, adminNote } = req.body || {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID pengaduan tidak valid.' });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Status harus salah satu dari: Menunggu, Diproses, atau Selesai.' });
  }

  const existing = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Pengaduan tidak ditemukan.' });
  }

  const now = new Date().toISOString();
  const noteToSave = typeof adminNote === 'string' ? adminNote.trim() : existing.admin_note;

  db.prepare('UPDATE complaints SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?').run(
    status,
    noteToSave,
    now,
    id
  );

  logActivity(
    'status_updated',
    `Status ${existing.ticket_code} diubah dari ${existing.status} menjadi ${status}.`,
    req.user.name
  );

  const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
  return res.json(updated);
});

router.post('/:id/analyze', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID pengaduan tidak valid.' });
  }

  const existing = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Pengaduan tidak ditemukan.' });
  }

  const analysis = await analyzeComplaint({
    title: existing.title,
    category: existing.category,
    location: existing.location,
    description: existing.description
  });

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE complaints
     SET ai_category = ?, ai_summary = ?, ai_urgency = ?, ai_urgency_reason = ?, ai_handler = ?, ai_mode = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    analysis.category,
    analysis.summary,
    analysis.urgency,
    analysis.urgencyReason,
    analysis.suggestedHandler,
    analysis.mode,
    now,
    id
  );

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const user = verifyToken(token);
  const actor = user ? user.name : 'Pengunjung Demo';

  const modeTag = analysis.mode === 'external_api' ? 'API Eksternal' : 'Simulasi Lokal';
  logActivity(
    'ai_analyzed',
    `Analisis (${modeTag}) dijalankan pada ${existing.ticket_code}: kategori ${analysis.category}, urgensi ${analysis.urgency}.`,
    actor
  );

  const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
  return res.json({ complaint: updated, analysis });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID pengaduan tidak valid.' });
  }
  const existing = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Pengaduan tidak ditemukan.' });
  }
  db.prepare('DELETE FROM complaints WHERE id = ?').run(id);
  logActivity('complaint_deleted', `Laporan ${existing.ticket_code} dihapus oleh Admin Desa.`, req.user.name);
  return res.json({ deleted: true, id });
});

module.exports = router;
