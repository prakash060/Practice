const express = require('express');
const User = require('../models/User');
const { signToken, requireAuth } = require('../middleware/auth');
const { isAdminEmail } = require('../middleware/admin');
const {
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
  validateAddress,
  validateIdentifier,
} = require('../utils/userValidation');

const router = express.Router();

function safeUser(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    authType: doc.authType || 'password',
    emailVerified: Boolean(doc.emailVerified),
    phoneVerified: Boolean(doc.phoneVerified),
    isAdmin: isAdminEmail(doc.email),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// Deprecated — use POST /api/auth/signup/* (OTP-verified signup)
router.post('/register', async (req, res) => {
  return res.status(410).json({
    error:
      'Direct registration is disabled. Please sign up via the app using email and mobile OTP verification.',
  });
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, secret, email, password } = req.body || {};
    const loginId = identifier ?? email;
    const loginSecret = secret ?? password;

    const idRes = validateIdentifier(loginId);
    if (idRes.error || !loginSecret || typeof loginSecret !== 'string') {
      return res.status(401).json({ error: 'Invalid email/phone or credentials' });
    }

    const query =
      idRes.kind === 'email'
        ? { email: idRes.value }
        : { phone: idRes.value };

    const user = await User.findOne(query).select('+password +pinHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email/phone or credentials' });
    }

    const authType = user.authType || 'password';
    let ok = false;
    if (authType === 'pin') {
      ok = await user.verifyPin(loginSecret);
    } else {
      ok = await user.verifyPassword(loginSecret);
    }

    if (!ok) {
      return res.status(401).json({ error: 'Invalid email/phone or credentials' });
    }

    let token;
    try {
      token = signToken(user._id);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || 'Token signing failed' });
    }

    return res.json({ user: safeUser(user), token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(safeUser(user));
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const nameRes = validateName(name);
    if (nameRes.error) return res.status(400).json({ error: nameRes.error });

    const phoneRes = validatePhone(phone);
    if (phoneRes.error) return res.status(400).json({ error: phoneRes.error });

    const addrRes = validateAddress(address);
    if (addrRes.error) return res.status(400).json({ error: addrRes.error });

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name: nameRes.value,
        phone: phoneRes.value,
        address: addrRes.value,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(safeUser(user));
  } catch (err) {
    console.error('Update me error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const payload = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      isAdmin: isAdminEmail(u.email),
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return res.json(payload);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: 'Failed to list users' });
  }
});

module.exports = router;
