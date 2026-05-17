const jwt = require('jsonwebtoken');

const JWT_EXPIRES = '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 16 || secret.includes('your_jwt_secret')) {
    return null;
  }
  return secret;
}

function signToken(userId) {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured (use a strong secret in .env)');
  }
  return jwt.sign({ sub: String(userId) }, secret, { expiresIn: JWT_EXPIRES });
}

function requireAuth(req, res, next) {
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(500).json({ error: 'Server authentication is not configured' });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (!payload.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { signToken, requireAuth, getJwtSecret };
