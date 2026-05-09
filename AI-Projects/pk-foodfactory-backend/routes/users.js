const express = require('express');
const User = require('../models/User');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN = 2;
const NAME_MAX = 120;
const ADDRESS_MIN = 10;
const ADDRESS_MAX = 500;
const PASSWORD_MIN = 8;

function normalizePhoneDigits(value) {
  return String(value).replace(/[\s\-().]/g, '');
}

/** E.164-style: optional +, then 10–15 digits */
const PHONE_RE = /^\+?[0-9]{10,15}$/;

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

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const nameTrim = name.trim();
    if (nameTrim.length < NAME_MIN || nameTrim.length > NAME_MAX) {
      return res.status(400).json({
        error: `Name must be between ${NAME_MIN} and ${NAME_MAX} characters`,
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (password.length < PASSWORD_MIN) {
      return res.status(400).json({ error: `Password must be at least ${PASSWORD_MIN} characters` });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ error: 'Phone is required' });
    }
    const phoneNorm = normalizePhoneDigits(phone.trim());
    if (!PHONE_RE.test(phoneNorm)) {
      return res.status(400).json({
        error: 'Phone must be 10–15 digits (optional leading +)',
      });
    }

    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({ error: 'Address is required' });
    }
    const addressTrim = address.trim();
    if (addressTrim.length < ADDRESS_MIN || addressTrim.length > ADDRESS_MAX) {
      return res.status(400).json({
        error: `Address must be between ${ADDRESS_MIN} and ${ADDRESS_MAX} characters`,
      });
    }

    const user = await User.create({
      name: nameTrim,
      email: email.trim(),
      password,
      phone: phoneNorm,
      address: addressTrim,
    });

    return res.status(201).json(safeUser(user));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

router.get('/', async (req, res) => {
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
