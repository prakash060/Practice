const jwt = require('jsonwebtoken');
const { extractBearerToken } = require('./authToken');

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

  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'AUTH_MISSING',
    });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (!payload.sub) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_INVALID',
      });
    }
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'AUTH_INVALID',
    });
  }
}

module.exports = { signToken, requireAuth, getJwtSecret };
