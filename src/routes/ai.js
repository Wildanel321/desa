const express = require('express');
const { analyzeComplaint, getAiEngineStatus } = require('../services/aiAnalyzer');
const { answerVillageQuestion } = require('../services/villageAssistant');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json(getAiEngineStatus());
});

router.post('/analyze-preview', async (req, res) => {
  const { title, category, location, description } = req.body || {};
  const cleanTitle = String(title || '').trim();
  const cleanDescription = String(description || '').trim();

  if (cleanTitle.length < 3 && cleanDescription.length < 10) {
    return res.status(400).json({
      error: 'Masukkan judul atau deskripsi pengaduan minimal 10 karakter untuk dianalisis.'
    });
  }

  const analysis = await analyzeComplaint({
    title: cleanTitle || 'Pengaduan Uji Coba',
    category: String(category || '').trim(),
    location: String(location || '').trim(),
    description: cleanDescription || cleanTitle
  });

  return res.json(analysis);
});

router.post('/assistant', (req, res) => {
  const { question } = req.body || {};
  if (!question || !String(question).trim()) {
    return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' });
  }
  const reply = answerVillageQuestion(question);
  return res.json(reply);
});

module.exports = router;
