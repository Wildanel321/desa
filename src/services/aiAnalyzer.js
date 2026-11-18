// Mesin analisis pengaduan: mendukung API Gemini jika dikonfigurasi, atau fallback jujur ke simulasi lokal.

const CATEGORY_RULES = [
  {
    category: 'Infrastruktur & Jalan',
    handler: 'Kasi Kesejahteraan & Tim Pekerjaan Umum Desa (koordinasi Dinas PUPR Kecamatan)',
    keywords: [
      'jalan', 'berlubang', 'aspal', 'jembatan', 'rusak', 'retak', 'longsor',
      'gorong', 'trotoar', 'jalan poros', 'amblas', 'beton', 'paving', 'balai'
    ]
  },
  {
    category: 'Air Bersih & Drainase',
    handler: 'Kasi Kesejahteraan, Pengelola PAMSIMAS & Satgas Lingkungan Desa',
    keywords: [
      'air', 'drainase', 'selokan', 'banjir', 'bocor', 'pipa', 'pamsimas',
      'tersumbat', 'genangan', 'parit', 'irigasi', 'sungai', 'meluap', 'kering', 'keruh'
    ]
  },
  {
    category: 'Penerangan & Listrik',
    handler: 'Kasi Kesejahteraan & Teknisi PJU Desa (koordinasi PLN setempat)',
    keywords: [
      'lampu', 'pju', 'penerangan', 'mati', 'gelap', 'tiang', 'listrik', 'kabel',
      'padam', 'korslet', 'trafo', 'lampu jalan'
    ]
  },
  {
    category: 'Kebersihan & Lingkungan',
    handler: 'Pengelola Kebersihan BUMDes Toyamas & Kasi Pelayanan',
    keywords: [
      'sampah', 'tps', 'bau', 'kotor', 'limbah', 'tumpukan', 'kebersihan',
      'pohon tumbang', 'dahan', 'rumput', 'bak sampah', 'lingkungan'
    ]
  },
  {
    category: 'Layanan Administrasi',
    handler: 'Kasi Pelayanan Umum & Staf Administrasi Kependudukan Desa',
    keywords: [
      'surat', 'ktp', 'kk', 'domisili', 'sku', 'sktm', 'antrean', 'loket',
      'administrasi', 'formulir', 'pelayanan', 'akta', 'pindah', 'berkas'
    ]
  },
  {
    category: 'Keamanan & Ketertiban',
    handler: 'Kasi Pemerintahan, Linmas Desa Toyamas & Bhabinkamtibmas',
    keywords: [
      'keamanan', 'ronda', 'pos kamling', 'maling', 'pencurian', 'ribut',
      'bising', 'ketertiban', 'rawan', 'pagar', 'linmas', 'balap liar'
    ]
  }
];

const HIGH_URGENCY_SIGNALS = [
  'kecelakaan', 'berbahaya', 'membahayakan', 'tergelincir', 'banjir', 'meluap',
  'roboh', 'tumbang', 'longsor', 'bocor deras', 'korslet', 'darurat', 'kebakaran',
  'rumah warga', 'akses utama', 'putus', 'terancam', 'sangat parah', 'tergenang',
  'menurun drastis', '18 rumah', 'banyak rumah', 'rawan'
];

const MEDIUM_URGENCY_SIGNALS = [
  'padam', 'mati', 'tersumbat', 'penuh', 'bau', 'mengganggu', 'rusak',
  'terlambat', 'tertunda', 'khawatir', 'lapuk', 'retak', 'gelap', 'tumpukan'
];

function buildSimulatedSummary(title, location, description) {
  const cleanDesc = String(description || '').replace(/\s+/g, ' ').trim();
  const sentences = cleanDesc
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const firstSentence = sentences[0] || String(title || '').trim();
  const concise = firstSentence.length > 155
    ? `${firstSentence.slice(0, 152).trim()}...`
    : firstSentence;

  if (location && !concise.toLowerCase().includes(location.toLowerCase().slice(0, 12))) {
    return `${concise} (Lokasi: ${location}).`;
  }
  return concise;
}

function analyzeWithLocalSimulation({ title, category, location, description }) {
  const combinedText = `${title || ''} ${category || ''} ${location || ''} ${description || ''}`.toLowerCase();

  let bestRule = null;
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (combinedText.includes(kw)) {
        score += kw.includes(' ') ? 3 : 2;
      }
    }
    if (category && category === rule.category) {
      score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  const detectedCategory = bestRule ? bestRule.category : (category || 'Fasilitas Umum Lainnya');
  const suggestedHandler = bestRule
    ? bestRule.handler
    : 'Sekretariat Desa & Kepala Dusun wilayah terkait';

  const matchedHigh = HIGH_URGENCY_SIGNALS.filter((signal) => combinedText.includes(signal));
  const matchedMedium = MEDIUM_URGENCY_SIGNALS.filter((signal) => combinedText.includes(signal));

  let urgency = 'Rendah';
  let urgencyReason = 'Tidak ditemukan indikator bahaya langsung; dapat dijadwalkan dalam tindak lanjut rutin desa.';

  if (matchedHigh.length >= 1) {
    urgency = 'Tinggi';
    urgencyReason = `Terdeteksi indikasi dampak keselamatan atau gangguan layanan vital (${matchedHigh.slice(0, 3).join(', ')}). Disarankan peninjauan lapangan segera.`;
  } else if (matchedMedium.length >= 1) {
    urgency = 'Sedang';
    urgencyReason = `Berdampak pada kenyamanan atau operasional fasilitas lingkungan (${matchedMedium.slice(0, 3).join(', ')}). Perlu penjadwalan perbaikan dalam 1 sampai 3 hari kerja.`;
  }

  return {
    category: detectedCategory,
    summary: buildSimulatedSummary(title, location, description),
    urgency,
    urgencyReason,
    suggestedHandler,
    mode: 'simulation',
    modeLabel: 'Mode Simulasi Lokal (Tanpa API AI)',
    disclaimer:
      'Hasil analisis ini dihasilkan oleh mesin simulasi berbasis aturan lokal untuk keperluan demo studi kasus, bukan keluaran layanan AI eksternal.'
  };
}

async function analyzeWithGeminiApi({ title, category, location, description }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = [
    'Analisis laporan pengaduan warga desa berikut dalam Bahasa Indonesia.',
    'Kembalikan HANYA JSON valid dengan kunci: category, summary, urgency (harus salah satu: Rendah, Sedang, Tinggi), urgencyReason, suggestedHandler.',
    `Judul: ${title}`,
    `Kategori awal: ${category || '-'}`,
    `Lokasi: ${location || '-'}`,
    `Deskripsi: ${description}`
  ].join('\n');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Respons API AI kosong');
  }

  const parsed = JSON.parse(rawText);
  const validUrgency = ['Rendah', 'Sedang', 'Tinggi'].includes(parsed.urgency)
    ? parsed.urgency
    : 'Sedang';

  return {
    category: String(parsed.category || category || 'Fasilitas Umum Lainnya'),
    summary: String(parsed.summary || buildSimulatedSummary(title, location, description)),
    urgency: validUrgency,
    urgencyReason: String(parsed.urgencyReason || 'Dievaluasi berdasarkan konteks laporan.'),
    suggestedHandler: String(parsed.suggestedHandler || 'Perangkat Desa Toyamas terkait'),
    mode: 'external_api',
    modeLabel: `API AI Eksternal (${model})`,
    disclaimer: 'Hasil analisis dihasilkan melalui koneksi API AI eksternal yang dikonfigurasi pada server.'
  };
}

async function analyzeComplaint(payload) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const apiResult = await analyzeWithGeminiApi(payload);
      if (apiResult) {
        return apiResult;
      }
    } catch {
      // Fall back to deterministic local simulation if the external API is unreachable.
    }
  }
  return analyzeWithLocalSimulation(payload);
}

function getAiEngineStatus() {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  return {
    externalApiConfigured: configured,
    mode: configured ? 'external_api' : 'simulation',
    modeLabel: configured
      ? `API AI Eksternal (${process.env.GEMINI_MODEL || 'gemini-2.0-flash'})`
      : 'Mode Simulasi Lokal (Tanpa API AI)'
  };
}

module.exports = {
  analyzeComplaint,
  getAiEngineStatus
};
