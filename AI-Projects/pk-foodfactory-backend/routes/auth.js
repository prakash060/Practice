const express = require('express');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { isAdminEmail } = require('../middleware/admin');
const {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateOtpCode,
  validateIdentifier,
} = require('../utils/userValidation');
const {
  createChallengeAndSendOtps,
  createLoginChallengeAndSendOtp,
  findActiveChallenge,
  verifyChallengeOtps,
  verifyLoginOtp,
  resendOtps,
  resendLoginOtp,
} = require('../services/otpService');

const router = express.Router();

const GENERIC_RESET_MSG =
  'If an account exists for this email and phone, verification codes have been sent.';

const GENERIC_LOGIN_MSG =
  'If an account exists for this email or mobile, a verification code has been sent.';

function loginOtpMessage(channel, devOtp, delivery) {
  if (devOtp && delivery && (delivery.emailDevLog || delivery.smsDevLog)) {
    return (
      'Verification code generated. Delivery failed — use the code shown below. ' +
      'For Gmail, set EMAIL_PASS to a Google App Password (not your login password).'
    );
  }
  return channel === 'email'
    ? 'Verification code sent to your email.'
    : 'Verification code sent to your mobile number.';
}

function otpSessionMessage(devOtp, delivery, { resent = false } = {}) {
  const prefix = resent ? 'New verification codes' : 'Verification codes';

  if (delivery?.emailSent && delivery?.smsSent) {
    return resent
      ? 'New verification codes sent to your email and mobile number.'
      : 'Verification codes sent to your email and mobile number.';
  }

  if (delivery?.smsSent && !delivery?.emailSent) {
    return (
      `${prefix} sent to your mobile number. Email could not be sent — ` +
      'use a Google App Password for EMAIL_PASS (https://myaccount.google.com/apppasswords).'
    );
  }

  if (delivery?.emailSent && !delivery?.smsSent) {
    return (
      `${prefix} sent to your email. SMS could not be sent — ` +
      'check MSG91_AUTH_KEY, MSG91_TEMPLATE_ID, and DLT template approval.'
    );
  }

  if (devOtp && delivery && (delivery.emailDevLog || delivery.smsDevLog)) {
    return (
      `${prefix} generated but delivery failed for email and SMS. ` +
      'Use the codes shown below, or fix EMAIL_PASS (Gmail App Password) and MSG91 settings.'
    );
  }

  return resent
    ? 'New verification codes sent to your email and mobile number.'
    : 'Verification codes sent to your email and mobile number.';
}

function respondOtpDeliveryError(err, res, logLabel) {
  if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
  if (err.code === 'EAUTH') {
    return res.status(503).json({
      error:
        'Gmail rejected EMAIL_PASS. Create a Google App Password at https://myaccount.google.com/apppasswords and put the 16-character password in EMAIL_PASS.',
    });
  }
  console.error(`${logLabel}:`, err);
  return res.status(500).json({ error: 'Failed to send verification codes' });
}

function safeUser(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    authType: doc.authType || 'otp',
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

    const { sessionToken, devOtp, delivery } = await createChallengeAndSendOtps({
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
      message: otpSessionMessage(devOtp, delivery),
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    return respondOtpDeliveryError(err, res, 'Signup start error');
  }
});

// POST /api/auth/signup/send-otp
router.post('/signup/send-otp', async (req, res) => {
  try {
    const { sessionToken } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const { devOtp, delivery } = await resendOtps(sessionToken, 'signup');

    return res.json({
      message: otpSessionMessage(devOtp, delivery, { resent: true }),
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    return respondOtpDeliveryError(err, res, 'Signup resend OTP error');
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

// POST /api/auth/signup/complete — create account after dual OTP verify (no password/PIN)
router.post('/signup/complete', async (req, res) => {
  try {
    const { sessionToken } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

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

    const user = await User.create({
      name: payload.name,
      email: challenge.email,
      phone: challenge.phone,
      address: payload.address,
      authType: 'otp',
      emailVerified: true,
      phoneVerified: true,
    });

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

// POST /api/auth/login/start — send OTP to email OR mobile used to sign in
router.post('/login/start', async (req, res) => {
  try {
    const { identifier } = req.body || {};
    const idRes = validateIdentifier(identifier);
    if (idRes.error) return res.status(400).json({ error: idRes.error });

    const query =
      idRes.kind === 'email' ? { email: idRes.value } : { phone: idRes.value };
    const user = await User.findOne(query);

    if (!user) {
      return res.json({ message: GENERIC_LOGIN_MSG });
    }

    const channel = idRes.kind;
    const { sessionToken, devOtp, delivery } = await createLoginChallengeAndSendOtp({
      user,
      channel,
    });

    return res.json({
      sessionToken,
      channel,
      message: loginOtpMessage(channel, devOtp, delivery),
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    return respondOtpDeliveryError(err, res, 'Login start error');
  }
});

// POST /api/auth/login/send-otp
router.post('/login/send-otp', async (req, res) => {
  try {
    const { sessionToken } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const { channel, devOtp, delivery } = await resendLoginOtp(sessionToken);

    return res.json({
      channel,
      message: loginOtpMessage(channel, devOtp, delivery),
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    return respondOtpDeliveryError(err, res, 'Login resend OTP error');
  }
});

// POST /api/auth/login/verify-otp
router.post('/login/verify-otp', async (req, res) => {
  try {
    const { sessionToken, otp } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const otpRes = validateOtpCode(otp);
    if (otpRes.error) return res.status(400).json({ error: otpRes.error });

    const challenge = await verifyLoginOtp(sessionToken, otpRes.value);

    const user = await User.findById(challenge.userId);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (challenge.loginChannel === 'email') {
      user.emailVerified = true;
    } else {
      user.phoneVerified = true;
    }
    user.authType = 'otp';
    await user.save();

    challenge.completed = true;
    await challenge.save();

    const token = signUserToken(user);
    return res.json({ user: safeUser(user), token });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Login verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Deprecated — OTP-only auth (use /api/auth/login/*)
router.post('/credentials/reset/start', async (req, res) => {
  return res.status(410).json({
    error: 'Password reset is no longer used. Sign in with a verification code sent to your email or mobile.',
  });
});

router.post('/credentials/reset/send-otp', async (req, res) => {
  return res.status(410).json({ error: 'Password reset is disabled. Use OTP sign in.' });
});

router.post('/credentials/reset/verify-otp', async (req, res) => {
  return res.status(410).json({ error: 'Password reset is disabled. Use OTP sign in.' });
});

router.post('/credentials/reset/complete', async (req, res) => {
  return res.status(410).json({ error: 'Password reset is disabled. Use OTP sign in.' });
});

module.exports = router;