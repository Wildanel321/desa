const { db } = require('../config/database');
const { CHATBOT_KNOWLEDGE_BASE, VILLAGE_PROFILE } = require('../data/villageKnowledge');

function normalizeText(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function answerVillageQuestion(question) {
  const normalized = normalizeText(question);
  if (!normalized) {
    return {
      found: false,
      mode: 'simulation',
      modeLabel: 'Basis Pengetahuan Lokal (Simulasi)',
      topic: 'Pertanyaan Kosong',
      source: 'Asisten Layanan Desa Toyamas',
      answer:
        'Silakan tuliskan pertanyaan Anda mengenai layanan administrasi desa, jam pelayanan, atau pengumuman Desa Toyamas.',
      relatedView: null
    };
  }

  const tokens = normalized.split(' ').filter((t) => t.length >= 2);
  let bestEntry = null;
  let bestScore = 0;

  for (const entry of CHATBOT_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (normalized.includes(kw)) {
        score += kw.includes(' ') ? 4 : 3;
      } else {
        const kwParts = kw.split(' ');
        for (const part of kwParts) {
          if (part.length >= 3 && tokens.includes(part)) {
            score += 1;
          }
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Also check live announcements in SQLite when the user asks about pengumuman or latest village news.
  if (normalized.includes('pengumuman') || normalized.includes('berita') || normalized.includes('info terbaru')) {
    const latest = db
      .prepare('SELECT title, category, summary FROM announcements ORDER BY published_at DESC LIMIT 3')
      .all();
    if (latest.length > 0) {
      const listText = latest
        .map((item, idx) => `${idx + 1}. [${item.category}] ${item.title}: ${item.summary}`)
        .join('\n');
      return {
        found: true,
        mode: 'simulation',
        modeLabel: 'Basis Pengetahuan Lokal (Simulasi)',
        topic: 'Pengumuman Terbaru Desa Toyamas',
        source: 'Database Pengumuman Desa Toyamas',
        answer: `Berikut pengumuman terbaru Desa Toyamas:\n${listText}\n\nAnda dapat membaca rincian lengkapnya di menu Informasi Desa.`,
        relatedView: 'informasi'
      };
    }
  }

  if (bestEntry && bestScore >= 3) {
    return {
      found: true,
      mode: 'simulation',
      modeLabel: 'Basis Pengetahuan Lokal (Simulasi)',
      topic: bestEntry.topic,
      source: bestEntry.sourceLabel,
      answer: bestEntry.answer,
      relatedView: bestEntry.relatedView
    };
  }

  return {
    found: false,
    mode: 'simulation',
    modeLabel: 'Basis Pengetahuan Lokal (Simulasi)',
    topic: 'Perlu Konfirmasi Kantor Desa',
    source: 'Aturan Konfirmasi Kantor Desa Toyamas',
    answer:
      `Maaf, informasi mengenai "${String(question).trim()}" belum tersedia dalam basis pengetahuan Asisten Desa Toyamas. Informasi ini perlu dikonfirmasi langsung ke Kantor Desa Toyamas agar Anda mendapatkan keterangan resmi yang akurat.\n\nAlamat: ${VILLAGE_PROFILE.officeAddress}\nJam Pelayanan: Senin sampai Kamis 08.00 - 15.00 WIB, Jumat 08.00 - 11.30 WIB\nKontak Demo: ${VILLAGE_PROFILE.officePhone}`,
    relatedView: 'informasi'
  };
}

module.exports = {
  answerVillageQuestion
};
