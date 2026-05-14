const User = require('../models/User');

const DEFAULT_ADMIN_EMAIL = 'brprakash060@gmail.com';

function getAdminEmail() {
  const raw = process.env.ADMIN_EMAIL;
  const email = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return email || DEFAULT_ADMIN_EMAIL;
}

function isAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase() === getAdminEmail();
}

// Must run AFTER requireAuth so req.userId is set.
async function requireAdmin(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await User.findById(req.userId).select('email');
    if (!user || !isAdminEmail(user.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.adminUser = user;
    return next();
  } catch (err) {
    console.error('requireAdmin:', err);
    return res.status(500).json({ error: 'Failed to verify admin access' });
  }
}

module.exports = { requireAdmin, isAdminEmail, getAdminEmail };
