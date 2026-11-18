require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');

const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const complaintsRoutes = require('./src/routes/complaints');
const aiRoutes = require('./src/routes/ai');
const villageRoutes = require('./src/routes/village');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'toyamas-smart-village' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/village', villageRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint API tidak ditemukan.' });
});

// Serve the single-page application shell for non-API routes.
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan internal pada server.' });
});

if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Toyamas Smart Village Platform aktif di http://localhost:${PORT}`);
  });
}

module.exports = app;
