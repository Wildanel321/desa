const express = require('express');
const {
  createToken,
  verifyToken,
  verifyAdminCredentials
} = require('../middleware/auth');
const { logActivity } = require('../config/database');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = verifyAdminCredentials(email, password);
  if (!user) {
    return res.status(401).json({
      error: 'Email atau kata sandi admin demo tidak sesuai.'
    });
  }

  const token = createToken(user);
  logActivity('admin_login', 'Sesi Admin Desa Toyamas dimulai untuk pengelolaan pengaduan.', user.name);
  return res.json({ token, user });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const user = verifyToken(token);
  if (!user) {
    return res.json({ authenticated: false, user: null });
  }
  return res.json({ authenticated: true, user });
});

module.exports = router;
