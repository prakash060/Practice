const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken, requireAuth } = require('../middleware/auth');
const {
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
  validateAddress,
} = require('../utils/userValidation');

const router = express.Router();

function safeUser(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const nameRes = validateName(name);
    if (nameRes.error) return res.status(400).json({ error: nameRes.error });

    const emailRes = validateEmail(email);
    if (emailRes.error) return res.status(400).json({ error: emailRes.error });

    const passRes = validatePassword(password);
    if (passRes.error) return res.status(400).json({ error: passRes.error });

    const phoneRes = validatePhone(phone);
    if (phoneRes.error) return res.status(400).json({ error: phoneRes.error });

    const addrRes = validateAddress(address);
    if (addrRes.error) return res.status(400).json({ error: addrRes.error });

    const user = await User.create({
      name: nameRes.value,
      email: emailRes.value,
      password: passRes.value,
      phone: phoneRes.value,
      address: addrRes.value,
    });

    let token;
    try {
      token = signToken(user._id);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || 'Token signing failed' });
    }

    return res.status(201).json({ ...safeUser(user), token });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailRes = validateEmail(email);
    if (emailRes.error || !password || typeof password !== 'string') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = await User.findOne({ email: emailRes.value }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let token;
    try {
      token = signToken(user._id);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || 'Token signing failed' });
    }

    user.password = undefined;
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
