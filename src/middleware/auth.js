const crypto = require('crypto');

const AUTH_SECRET = process.env.AUTH_SECRET || 'toyamas-demo-secret-key-2026';
const DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || 'admin@toyamas.desa.id';
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'toyamas2026';

// Stateless HMAC-signed token keeps demo admin auth working without external session storage.
function createToken(payload) {
  const data = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 12
  };
  const encoded = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  const [encoded, signature] = token.split('.');
  const expected = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function verifyAdminCredentials(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '').trim();
  if (
    normalizedEmail === DEMO_ADMIN_EMAIL.toLowerCase() &&
    normalizedPassword === DEMO_ADMIN_PASSWORD
  ) {
    return {
      email: DEMO_ADMIN_EMAIL,
      name: 'Admin Desa Toyamas',
      role: 'admin'
    };
  }
  return null;
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return res.status(401).json({
      error: 'Akses khusus Admin Desa. Silakan masuk menggunakan akun admin demo terlebih dahulu.'
    });
  }
  req.user = user;
  return next();
}

module.exports = {
  DEMO_ADMIN_EMAIL,
  createToken,
  verifyToken,
  verifyAdminCredentials,
  requireAdmin
};
