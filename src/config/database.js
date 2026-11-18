const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const {
  INITIAL_COMPLAINTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITY_LOGS
} = require('../data/seedData');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'toyamas.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    reporter_label TEXT NOT NULL DEFAULT 'Warga (Simulasi)',
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Diproses', 'Selesai')),
    admin_note TEXT DEFAULT '',
    ai_category TEXT,
    ai_summary TEXT,
    ai_urgency TEXT CHECK (ai_urgency IS NULL OR ai_urgency IN ('Rendah', 'Sedang', 'Tinggi')),
    ai_urgency_reason TEXT,
    ai_handler TEXT,
    ai_mode TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    actor TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

function runInTransaction(work) {
  db.exec('BEGIN');
  try {
    work();
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// Seed initial demo records only when the database is empty so user edits persist across restarts.
function seedIfEmpty() {
  const complaintCount = db.prepare('SELECT COUNT(*) AS count FROM complaints').get().count;
  if (complaintCount === 0) {
    const insertComplaint = db.prepare(`
      INSERT INTO complaints (
        ticket_code, title, category, location, reporter_label, description,
        status, admin_note, ai_category, ai_summary, ai_urgency,
        ai_urgency_reason, ai_handler, ai_mode, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    runInTransaction(() => {
      for (const item of INITIAL_COMPLAINTS) {
        insertComplaint.run(
          item.ticket_code,
          item.title,
          item.category,
          item.location,
          item.reporter_label,
          item.description,
          item.status,
          item.admin_note,
          item.ai_category,
          item.ai_summary,
          item.ai_urgency,
          item.ai_urgency_reason,
          item.ai_handler,
          item.ai_mode,
          item.created_at,
          item.updated_at
        );
      }
    });
  }

  const announcementCount = db.prepare('SELECT COUNT(*) AS count FROM announcements').get().count;
  if (announcementCount === 0) {
    const insertAnnouncement = db.prepare(`
      INSERT INTO announcements (title, category, summary, content, published_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    runInTransaction(() => {
      for (const item of INITIAL_ANNOUNCEMENTS) {
        insertAnnouncement.run(
          item.title,
          item.category,
          item.summary,
          item.content,
          item.published_at
        );
      }
    });
  }

  const logCount = db.prepare('SELECT COUNT(*) AS count FROM activity_logs').get().count;
  if (logCount === 0) {
    const insertLog = db.prepare(`
      INSERT INTO activity_logs (action_type, description, actor, created_at)
      VALUES (?, ?, ?, ?)
    `);
    runInTransaction(() => {
      for (const item of INITIAL_ACTIVITY_LOGS) {
        insertLog.run(item.action_type, item.description, item.actor, item.created_at);
      }
    });
  }
}

seedIfEmpty();

function logActivity(actionType, description, actor) {
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO activity_logs (action_type, description, actor, created_at) VALUES (?, ?, ?, ?)'
  ).run(actionType, description, actor, now);
}

function generateNextTicketCode() {
  const row = db.prepare('SELECT MAX(id) AS maxId FROM complaints').get();
  const nextNumber = (row && row.maxId ? Number(row.maxId) : 0) + 1;
  const year = new Date().getFullYear();
  return `ADU-${year}-${String(nextNumber).padStart(3, '0')}`;
}

module.exports = {
  db,
  logActivity,
  generateNextTicketCode
};
