const express = require('express');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { isAdminEmail } = require('../middleware/admin');
const { hashPassword } = require('../models/User');
const {
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateOtpCode,
  validateIdentifier,
  validatePassword,
  phoneLookupRegex,
  getPhoneLast10,
  DEFAULT_COUNTRY_DIAL,
} = require('../utils/userValidation');
const { buildLoginMethodsResponse, recordSuccessfulLogin, LOGIN_METHODS } = require('../utils/authMethods');
const {
  createChallengeAndSendOtps,
  createLoginChallengeAndSendOtp,
  createResetSession,
  findActiveChallenge,
  verifyChallengeOtps,
  verifyLoginOtp,
  verifyResetSingleOtp,
  resendOtps,
  resendLoginOtp,
  resendResetSingleOtp,
  sendResetSingleOtp,
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
  if (delivery?.emailSent && channel === 'email') {
    return 'Verification code sent to your email.';
  }
  if (delivery?.smsSent && channel === 'phone') {
    return 'Verification code sent to your mobile number.';
  }
  if (delivery?.emailSent && channel === 'phone') {
    return 'SMS could not be sent; verification code sent to your email instead.';
  }
  if (delivery?.smsSent && channel === 'email') {
    return 'Email could not be sent; verification code sent via SMS instead.';
  }
  return channel === 'email'
    ? 'Verification code sent to your email.'
    : 'Verification code sent to your mobile number.';
}

function getAvailableOtpChannels(user) {
  const channels = [];
  if (user?.email) channels.push('email');
  if (user?.phone) channels.push('phone');
  return channels.length ? channels : ['email'];
}

function resolveLoginOtpChannel(user, identifierKind, requestedChannel) {
  const available = getAvailableOtpChannels(user);
  if (requestedChannel === 'email' || requestedChannel === 'phone') {
    if (available.includes(requestedChannel)) return requestedChannel;
  }
  if (identifierKind === 'email' && available.includes('email')) return 'email';
  if (identifierKind === 'phone' && available.includes('phone')) return 'phone';
  return available[0];
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
    lastLoginMethod: doc.lastLoginMethod || null,
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

async function findUserByPhone(phone) {
  const last10 = getPhoneLast10(phone);
  if (!last10) return null;

  const re = phoneLookupRegex(phone);
  if (re) {
    const byRegex = await User.findOne({ phone: re });
    if (byRegex) return byRegex;
  }

  return User.findOne({
    $or: [
      { phone: last10 },
      { phone: `${DEFAULT_COUNTRY_DIAL}${last10}` },
      { phone: `+${DEFAULT_COUNTRY_DIAL}${last10}` },
    ],
  });
}

async function findUserByEmailAndPhone(email, phone) {
  const byEmail = await User.findOne({ email });
  if (!byEmail) return null;
  const byPhone = await findUserByPhone(phone);
  if (!byPhone || String(byEmail._id) !== String(byPhone._id)) return null;
  return byEmail;
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

    const existingPhone = await findUserByPhone(phoneRes.value);
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
      delivery: {
        emailSent: Boolean(delivery?.emailSent),
        smsSent: Boolean(delivery?.smsSent),
      },
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
      delivery: {
        emailSent: Boolean(delivery?.emailSent),
        smsSent: Boolean(delivery?.smsSent),
      },
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

// POST /api/auth/signup/complete — create account after dual OTP verify
router.post('/signup/complete', async (req, res) => {
  try {
    const { sessionToken, password } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const passRes = validatePassword(password, { required: true });
    if (passRes.error) return res.status(400).json({ error: passRes.error });

    const challenge = await findActiveChallenge(sessionToken, 'signup');
    if (!challenge.emailVerified || !challenge.phoneVerified) {
      return res.status(400).json({ error: 'Verify email and SMS codes before completing signup' });
    }

    const payload = challenge.signupPayload || {};
    const existingEmail = await User.findOne({ email: challenge.email });
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const existingPhone = await findUserByPhone(challenge.phone);
    if (existingPhone) {
      return res.status(409).json({ error: 'An account with this phone number already exists' });
    }

    const userData = {
      name: payload.name,
      email: challenge.email,
      phone: getPhoneLast10(challenge.phone) || challenge.phone,
      address: payload.address,
      authType: 'password',
      lastLoginMethod: 'password',
      emailVerified: true,
      phoneVerified: true,
      password: passRes.value,
    };

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

// POST /api/auth/login/start — send OTP to email OR mobile used to sign in
router.post('/login/start', async (req, res) => {
  try {
    const { identifier, channel: requestedChannel } = req.body || {};
    const idRes = validateIdentifier(identifier);
    if (idRes.error) return res.status(400).json({ error: idRes.error });

    const user =
      idRes.kind === 'email'
        ? await User.findOne({ email: idRes.value })
        : await findUserByPhone(idRes.value);

    if (!user) {
      return res.json({ message: GENERIC_LOGIN_MSG });
    }

    // Always match OTP channel to how the user signed in (email vs mobile).
    const channel = idRes.kind === 'email' ? 'email' : 'phone';
    const { sessionToken, devOtp, delivery, channel: usedChannel } =
      await createLoginChallengeAndSendOtp({
        user,
        channel,
        loginPhone: idRes.kind === 'phone' ? idRes.value : undefined,
      });

    return res.json({
      sessionToken,
      channel: usedChannel,
      availableChannels: getAvailableOtpChannels(user),
      message: loginOtpMessage(usedChannel, devOtp, delivery),
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
    await user.save();

    await recordSuccessfulLogin(user._id, 'otp');

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

// POST /api/auth/credentials/reset/start
router.post('/credentials/reset/start', async (req, res) => {
  try {
    const { email, phone } = req.body || {};

    const emailRes = validateEmail(email);
    if (emailRes.error) return res.status(400).json({ error: emailRes.error });

    const phoneRes = validatePhone(phone);
    if (phoneRes.error) return res.status(400).json({ error: phoneRes.error });

    const user = await findUserByEmailAndPhone(emailRes.value, phoneRes.value);

    let sessionToken;
    let loginMethods;
    if (user) {
      const userWithSecrets = await User.findById(user._id).select('+password lastLoginMethod');
      loginMethods = buildLoginMethodsResponse(userWithSecrets);
      const result = await createResetSession({
        email: emailRes.value,
        phone: user.phone,
        userId: user._id,
      });
      sessionToken = result.sessionToken;
    }

    return res.json({
      message: GENERIC_RESET_MSG,
      ...(sessionToken ? { sessionToken } : {}),
      ...(loginMethods ? loginMethods : {}),
    });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Reset start error:', err);
    return res.json({ message: GENERIC_RESET_MSG });
  }
});

router.post('/credentials/reset/send-otp', async (req, res) => {
  try {
    const { sessionToken, channel } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });
    if (channel !== 'email' && channel !== 'phone') {
      return res.status(400).json({ error: 'channel must be email or phone' });
    }

    const { devOtp, delivery } = await sendResetSingleOtp(sessionToken, channel);

    return res.json({
      channel,
      message: loginOtpMessage(channel, devOtp, delivery),
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    return respondOtpDeliveryError(err, res, 'Reset send OTP error');
  }
});

router.post('/credentials/reset/verify', async (req, res) => {
  try {
    const { sessionToken, verifyMethod, secret, otp } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });
    if (!LOGIN_METHODS.includes(verifyMethod)) {
      return res.status(400).json({ error: 'verifyMethod must be otp or password' });
    }

    const challenge = await findActiveChallenge(sessionToken, 'reset_credentials');
    const user = await User.findById(challenge.userId).select('+password lastLoginMethod');
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const { availableMethods } = buildLoginMethodsResponse(user);
    if (!availableMethods.includes(verifyMethod)) {
      return res.status(400).json({
        error: `This account cannot be verified with ${authTypeLabel(verifyMethod)} sign-in.`,
      });
    }

    if (verifyMethod === 'otp') {
      const otpRes = validateOtpCode(otp);
      if (otpRes.error) return res.status(400).json({ error: otpRes.error });
      await verifyResetSingleOtp(sessionToken, otpRes.value);
    } else {
      if (!secret || typeof secret !== 'string') {
        return res.status(400).json({ error: 'Password is required' });
      }
      if (!user.password) {
        return res.status(400).json({ error: 'No password is set for this account' });
      }
      const ok = await user.verifyPassword(secret);
      if (!ok) {
        return res.status(401).json({ error: 'Password is incorrect' });
      }
      challenge.identityVerified = true;
      await challenge.save();
    }

    return res.json({ verified: true });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Reset verify error:', err);
    return res.status(500).json({ error: 'Failed to verify identity' });
  }
});

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

    const challenge = await findActiveChallenge(sessionToken, 'reset_credentials');
    challenge.identityVerified = true;
    await challenge.save();

    return res.json({ verified: true });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Reset verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify codes' });
  }
});

router.post('/credentials/reset/complete', async (req, res) => {
  try {
    const { sessionToken, password } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const passRes = validatePassword(password, { required: true });
    if (passRes.error) return res.status(400).json({ error: passRes.error });

    const challenge = await findActiveChallenge(sessionToken, 'reset_credentials');
    if (!challenge.identityVerified && !(challenge.emailVerified && challenge.phoneVerified)) {
      return res.status(400).json({ error: 'Verify your identity first' });
    }

    const user = await User.findById(challenge.userId);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: {
        authType: 'password',
        password: await hashPassword(passRes.value),
        emailVerified: true,
        phoneVerified: true,
      },
    });

    challenge.completed = true;
    await challenge.save();

    return res.json({ message: 'Your password has been updated. You can sign in now.' });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Reset complete error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

function authTypeLabel(authType) {
  if (authType === 'password') return 'password';
  return 'OTP';
}

module.exports = router;