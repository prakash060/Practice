const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const OtpChallenge = require('../models/OtpChallenge');
const { signToken, requireAuth } = require('../middleware/auth');
const { isAdminEmail, requireAdmin, getAdminEmail } = require('../middleware/admin');
const {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateIdentifier,
  phoneLookupRegex,
} = require('../utils/userValidation');

const { recordSuccessfulLogin } = require('../utils/authMethods');

const router = express.Router();

function safeUser(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    authType: doc.authType || 'otp',
    lastLoginMethod: doc.lastLoginMethod || null,
    emailVerified: Boolean(doc.emailVerified),
    phoneVerified: Boolean(doc.phoneVerified),
    isAdmin: isAdminEmail(doc.email),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function findUserByPhoneWithSecrets(phone) {
  const re = phoneLookupRegex(phone);
  if (!re) return null;
  return User.findOne({ phone: re }).select('+password');
}

// Deprecated — use POST /api/auth/signup/* (OTP-verified signup)
router.post('/register', async (req, res) => {
  return res.status(410).json({
    error:
      'Direct registration is disabled. Please sign up via the app using email and mobile OTP verification.',
  });
});

// Password login (use /api/auth/login/* for OTP sign-in)
router.post('/login', async (req, res) => {
  try {
    const { identifier, secret, email, password } = req.body || {};
    const loginId = identifier ?? email;
    const loginSecret = secret ?? password;

    const idRes = validateIdentifier(loginId);
    if (idRes.error || !loginSecret || typeof loginSecret !== 'string') {
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    const user =
      idRes.kind === 'email'
        ? await User.findOne({ email: idRes.value }).select('+password')
        : await findUserByPhoneWithSecrets(idRes.value);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    if (!user.password) {
      return res.status(401).json({
        error:
          'No password is set for this account. Sign in with a mobile OTP, or set a password via Forgot password.',
      });
    }

    const ok = await user.verifyPassword(loginSecret);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    if (user.passwordNeedsRehash()) {
      user.password = loginSecret;
      await user.save();
    }

    let token;
    try {
      token = signToken(user._id);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || 'Token signing failed' });
    }

    await recordSuccessfulLogin(user._id, 'password');

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

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(users.map((u) => safeUser(u)));
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: 'Failed to list users' });
  }
});

// POST /api/users/bulk-delete — admin removes selected customer accounts (not admin / self)
router.post('/bulk-delete', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const objectIds = [];
    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: `Invalid user id: ${id}` });
      }
      objectIds.push(new mongoose.Types.ObjectId(id));
    }

    const candidates = await User.find({ _id: { $in: objectIds } }).select('email').lean();

    const adminEmail = (getAdminEmail() || '').toLowerCase();
    const currentId = req.userId ? String(req.userId) : null;

    const deletableIds = candidates
      .filter((u) => {
        const email = (u.email || '').trim().toLowerCase();
        if (adminEmail && email === adminEmail) return false;
        if (currentId && String(u._id) === currentId) return false;
        return true;
      })
      .map((u) => u._id);

    if (deletableIds.length === 0) {
      return res.json({
        deleted: 0,
        skipped: ids.length,
        message: 'No deletable users in selection (admin accounts cannot be removed).',
      });
    }

    await OtpChallenge.deleteMany({ userId: { $in: deletableIds } });
    const result = await User.deleteMany({ _id: { $in: deletableIds } });

    const deleted = result.deletedCount || 0;
    const skipped = ids.length - deleted;

    return res.json({
      deleted,
      skipped,
      message:
        deleted === 1
          ? '1 user account deleted.'
          : `${deleted} user accounts deleted.`,
    });
  } catch (err) {
    console.error('Bulk delete users error:', err);
    return res.status(500).json({ error: 'Failed to delete users' });
  }
});

module.exports = router;