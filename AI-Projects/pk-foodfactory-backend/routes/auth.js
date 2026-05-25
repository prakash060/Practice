const express = require('express');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { isAdminEmail } = require('../middleware/admin');
const { hashPin } = require('../models/User');
const {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateAuthCredential,
  validateOtpCode,
} = require('../utils/userValidation');
const {
  createChallengeAndSendOtps,
  findActiveChallenge,
  verifyChallengeOtps,
  resendOtps,
} = require('../services/otpService');

const router = express.Router();

const GENERIC_RESET_MSG =
  'If an account exists for this email and phone, verification codes have been sent.';

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

function signUserToken(user) {
  try {
    return signToken(user._id);
  } catch (e) {
    const err = new Error(e.message || 'Token signing failed');
    err.statusCode = 500;
    throw err;
  }
}

// POST /api/auth/signup/start
router.post('/signup/start', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body || {};

    const nameRes = validateName(name);
    if (nameRes.error) return res.status(400).json({ error: nameRes.error });

    const emailRes = validateEmail(email);
    if (emailRes.error) return res.status(400).json({ error: emailRes.error });

    const phoneRes = validatePhone(phone);
    if (phoneRes.error) return res.status(400).json({ error: phoneRes.error });

    const addrRes = validateAddress(address);
    if (addrRes.error) return res.status(400).json({ error: addrRes.error });

    const existingEmail = await User.findOne({ email: emailRes.value });
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const existingPhone = await User.findOne({ phone: phoneRes.value });
    if (existingPhone) {
      return res.status(409).json({ error: 'An account with this phone number already exists' });
    }

    const { sessionToken, devOtp } = await createChallengeAndSendOtps({
      purpose: 'signup',
      email: emailRes.value,
      phone: phoneRes.value,
      signupPayload: {
        name: nameRes.value,
        address: addrRes.value,
      },
    });

    return res.status(201).json({
      sessionToken,
      message: 'Verification codes sent to your email and mobile number.',
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Signup start error:', err);
    return res.status(500).json({ error: 'Failed to start signup' });
  }
});

// POST /api/auth/signup/send-otp
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { sessionToken } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const { devOtp } = await resendOtps(sessionToken, 'signup');

    return res.json({
      message: 'New verification codes sent to your email and mobile number.',
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Signup resend OTP error:', err);
    return res.status(500).json({ error: 'Failed to resend codes' });
  }
});

// POST /api/auth/signup/verify-otp
router.post('/signup/verify-otp', async (req, res) => {
  try {
    const { sessionToken, emailOtp, phoneOtp } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const emailOtpRes = validateOtpCode(emailOtp);
    if (emailOtpRes.error) return res.status(400).json({ error: emailOtpRes.error });

    const phoneOtpRes = validateOtpCode(phoneOtp);
    if (phoneOtpRes.error) return res.status(400).json({ error: phoneOtpRes.error });

    await verifyChallengeOtps(
      sessionToken,
      'signup',
      emailOtpRes.value,
      phoneOtpRes.value
    );

    return res.json({ verified: true });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Signup verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify codes' });
  }
});

// POST /api/auth/signup/complete
router.post('/signup/complete', async (req, res) => {
  try {
    const { sessionToken, authType, password, pin } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const credRes = validateAuthCredential(authType, password, pin);
    if (credRes.error) return res.status(400).json({ error: credRes.error });

    const challenge = await findActiveChallenge(sessionToken, 'signup');
    if (!challenge.emailVerified || !challenge.phoneVerified) {
      return res.status(400).json({ error: 'Verify email and SMS codes before completing signup' });
    }

    const payload = challenge.signupPayload || {};
    const existingEmail = await User.findOne({ email: challenge.email });
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const existingPhone = await User.findOne({ phone: challenge.phone });
    if (existingPhone) {
      return res.status(409).json({ error: 'An account with this phone number already exists' });
    }

    const userData = {
      name: payload.name,
      email: challenge.email,
      phone: challenge.phone,
      address: payload.address,
      authType: credRes.authType,
      emailVerified: true,
      phoneVerified: true,
    };

    if (credRes.authType === 'password') {
      userData.password = credRes.password;
      userData.pinHash = null;
    } else {
      userData.password = undefined;
      userData.pinHash = await hashPin(credRes.pin);
    }

    const user = await User.create(userData);

    challenge.completed = true;
    await challenge.save();

    const token = signUserToken(user);
    return res.status(201).json({ user: safeUser(user), token });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email or phone already registered' });
    }
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Signup complete error:', err);
    return res.status(500).json({ error: 'Failed to complete signup' });
  }
});

// POST /api/auth/credentials/reset/start
router.post('/credentials/reset/start', async (req, res) => {
  try {
    const { email, phone } = req.body || {};

    const emailRes = validateEmail(email);
    if (emailRes.error) return res.status(400).json({ error: emailRes.error });

    const phoneRes = validatePhone(phone);
    if (phoneRes.error) return res.status(400).json({ error: phoneRes.error });

    const user = await User.findOne({
      email: emailRes.value,
      phone: phoneRes.value,
    });

    let sessionToken;
    let devOtp;
    if (user) {
      const result = await createChallengeAndSendOtps({
        purpose: 'reset_credentials',
        email: emailRes.value,
        phone: phoneRes.value,
        userId: user._id,
      });
      sessionToken = result.sessionToken;
      devOtp = result.devOtp;
    }

    return res.json({
      message: GENERIC_RESET_MSG,
      ...(sessionToken ? { sessionToken } : {}),
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Reset start error:', err);
    return res.json({ message: GENERIC_RESET_MSG });
  }
});

// POST /api/auth/credentials/reset/send-otp
router.post('/credentials/reset/send-otp', async (req, res) => {
  try {
    const { sessionToken } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const { devOtp } = await resendOtps(sessionToken, 'reset_credentials');

    return res.json({
      message: 'New verification codes sent to your email and mobile number.',
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Reset resend OTP error:', err);
    return res.status(500).json({ error: 'Failed to resend codes' });
  }
});

// POST /api/auth/credentials/reset/verify-otp
router.post('/credentials/reset/verify-otp', async (req, res) => {
  try {
    const { sessionToken, emailOtp, phoneOtp } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const emailOtpRes = validateOtpCode(emailOtp);
    if (emailOtpRes.error) return res.status(400).json({ error: emailOtpRes.error });

    const phoneOtpRes = validateOtpCode(phoneOtp);
    if (phoneOtpRes.error) return res.status(400).json({ error: phoneOtpRes.error });

    await verifyChallengeOtps(
      sessionToken,
      'reset_credentials',
      emailOtpRes.value,
      phoneOtpRes.value
    );

    return res.json({ verified: true });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Reset verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify codes' });
  }
});

// POST /api/auth/credentials/reset/complete
router.post('/credentials/reset/complete', async (req, res) => {
  try {
    const { sessionToken, authType, password, pin } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const credRes = validateAuthCredential(authType, password, pin);
    if (credRes.error) return res.status(400).json({ error: credRes.error });

    const challenge = await findActiveChallenge(sessionToken, 'reset_credentials');
    if (!challenge.emailVerified || !challenge.phoneVerified) {
      return res.status(400).json({ error: 'Verify email and SMS codes first' });
    }

    const user = await User.findById(challenge.userId);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    user.authType = credRes.authType;
    user.emailVerified = true;
    user.phoneVerified = true;

    if (credRes.authType === 'password') {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          authType: 'password',
          password: credRes.password,
          emailVerified: true,
          phoneVerified: true,
        },
        $unset: { pinHash: 1 },
      });
    } else {
      const pinHash = await hashPin(credRes.pin);
      await User.findByIdAndUpdate(user._id, {
        $set: {
          authType: 'pin',
          pinHash,
          emailVerified: true,
          phoneVerified: true,
        },
        $unset: { password: 1 },
      });
    }

    challenge.completed = true;
    await challenge.save();

    return res.json({ message: 'Your login credentials have been updated. You can sign in now.' });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Reset complete error:', err);
    return res.status(500).json({ error: 'Failed to reset credentials' });
  }
});

module.exports = router;