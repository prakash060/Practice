const jwt = require('jsonwebtoken');
const DeliveryAgent = require('../models/DeliveryAgent');
const { getJwtSecret } = require('./auth');
const { extractBearerToken } = require('./authToken');

const AGENT_JWT_AUDIENCE = 'delivery-agent';
const AGENT_JWT_EXPIRES = '7d';

function signAgentToken(agentId) {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured (use a strong secret in .env)');
  }
  return jwt.sign({ sub: String(agentId), role: AGENT_JWT_AUDIENCE }, secret, {
    expiresIn: AGENT_JWT_EXPIRES,
    audience: AGENT_JWT_AUDIENCE,
  });
}

async function requireAgentAuth(req, res, next) {
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(500).json({ error: 'Server authentication is not configured' });
  }

  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_MISSING' });
  }

  try {
    const payload = jwt.verify(token, secret, { audience: AGENT_JWT_AUDIENCE });
    if (!payload.sub) {
      return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_INVALID' });
    }
    const agent = await DeliveryAgent.findById(payload.sub);
    if (!agent) {
      return res.status(401).json({ error: 'Agent no longer exists', code: 'AUTH_INVALID' });
    }
    if (agent.status !== 'active') {
      return res.status(403).json({ error: 'This delivery account is inactive' });
    }
    req.agent = agent;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'AUTH_INVALID' });
  }
}

module.exports = { signAgentToken, requireAgentAuth, AGENT_JWT_AUDIENCE };
