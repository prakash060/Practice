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
  validateOtpCode,
  validateIdentifier,
  validateAuthCredential,
  validateOptionalSignupCredentials,
  phoneLookupRegex,
  getPhoneLast10,
} = require('../utils/userValidation');
const { buildLoginMethodsResponse, recordSuccessfulLogin, LOGIN_METHODS } = require('../utils/authMethods');
const {
  createChallengeAndSendOtps,
  createLoginChallengeAndSendOtp,
  createResetSession,
  createSwitchAuthChallenge,
  findActiveChallenge,
  verifyChallengeOtps,
  verifyLoginOtp,
  verifyResetSingleOtp,
  verifySwitchAuthOtp,
  resendOtps,
  resendLoginOtp,
  resendResetSingleOtp,
  sendResetSingleOtp,
  resendSwitchAuthOtp,
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
  const re = phoneLookupRegex(phone);
  if (!re) return null;
  return User.findOne({ phone: re });
}

async function findUserByPhoneWithSecrets(phone) {
  const re = phoneLookupRegex(phone);
  if (!re) return null;
  return User.findOne({ phone: re }).select('+password +pinHash');
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

// POST /api/auth/signup/complete — create account after dual OTP verify
router.post('/signup/complete', async (req, res) => {
  try {
    const { sessionToken, authType, password, pin } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const credRes = validateOptionalSignupCredentials(password, pin);
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

    const existingPhone = await findUserByPhone(challenge.phone);
    if (existingPhone) {
      return res.status(409).json({ error: 'An account with this phone number already exists' });
    }

    const initialLoginMethod =
      authType && LOGIN_METHODS.includes(authType)
        ? authType
        : credRes.password
          ? 'password'
          : credRes.pin
            ? 'pin'
            : 'otp';

    const userData = {
      name: payload.name,
      email: challenge.email,
      phone: getPhoneLast10(challenge.phone) || challenge.phone,
      address: payload.address,
      authType: initialLoginMethod,
      lastLoginMethod: initialLoginMethod,
      emailVerified: true,
      phoneVerified: true,
    };

    if (credRes.password) {
      userData.password = credRes.password;
    }
    if (credRes.pin) {
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

// POST /api/auth/login/start — send OTP to email OR mobile used to sign in
router.post('/login/start', async (req, res) => {
  try {
    const { identifier } = req.body || {};
    const idRes = validateIdentifier(identifier);
    if (idRes.error) return res.status(400).json({ error: idRes.error });

    const user =
      idRes.kind === 'email'
        ? await User.findOne({ email: idRes.value })
        : await findUserByPhone(idRes.value);

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
      const userWithSecrets = await User.findById(user._id).select('+password +pinHash lastLoginMethod');
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
      return res.status(400).json({ error: 'verifyMethod must be otp, password, or pin' });
    }

    const challenge = await findActiveChallenge(sessionToken, 'reset_credentials');
    const user = await User.findById(challenge.userId).select('+password +pinHash lastLoginMethod');
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
    } else if (verifyMethod === 'pin') {
      if (!secret || typeof secret !== 'string') {
        return res.status(400).json({ error: 'PIN is required' });
      }
      if (!user.pinHash) {
        return res.status(400).json({ error: 'No PIN is set for this account' });
      }
      const ok = await user.verifyPin(secret);
      if (!ok) {
        return res.status(401).json({ error: 'PIN is incorrect' });
      }
      challenge.identityVerified = true;
      await challenge.save();
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
    const { sessionToken, authType, password, pin } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const credRes = validateAuthCredential(authType, password, pin);
    if (credRes.error) return res.status(400).json({ error: credRes.error });
    if (credRes.authType === 'otp') {
      return res.status(400).json({ error: 'Choose password or PIN for credential reset' });
    }

    const challenge = await findActiveChallenge(sessionToken, 'reset_credentials');
    if (!challenge.identityVerified && !(challenge.emailVerified && challenge.phoneVerified)) {
      return res.status(400).json({ error: 'Verify your identity first' });
    }

    const user = await User.findById(challenge.userId);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (credRes.authType === 'password') {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          authType: 'password',
          password: credRes.password,
          emailVerified: true,
          phoneVerified: true,
        },
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

function authTypeLabel(authType) {
  if (authType === 'password') return 'password';
  if (authType === 'pin') return 'PIN';
  return 'OTP';
}

// POST /api/auth/switch-method/start — begin auth-method migration (optional; login 409 also starts a session)
router.post('/switch-method/start', async (req, res) => {
  try {
    const { identifier, targetAuthType } = req.body || {};
    const idRes = validateIdentifier(identifier);
    if (idRes.error) return res.status(400).json({ error: idRes.error });

    if (targetAuthType !== 'password' && targetAuthType !== 'pin') {
      return res.status(400).json({ error: 'targetAuthType must be password or pin' });
    }

    const user =
      idRes.kind === 'email'
        ? await User.findOne({ email: idRes.value })
        : await findUserByPhone(idRes.value);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/phone or credentials' });
    }

    const storedAuth = user.authType || 'otp';
    if (storedAuth === targetAuthType) {
      return res.status(400).json({
        error: `This account already uses ${authTypeLabel(storedAuth)} sign-in.`,
      });
    }

    const channel = idRes.kind === 'email' ? 'email' : 'phone';
    const { sessionToken, devOtp, delivery, channel: otpChannel } = await createSwitchAuthChallenge({
      user,
      targetAuthType,
      channel,
    });

    const verifyWith = storedAuth;
    let message =
      verifyWith === 'otp'
        ? loginOtpMessage(otpChannel || channel, devOtp, delivery)
        : `Verify your ${authTypeLabel(verifyWith)} to set up ${authTypeLabel(targetAuthType)} login.`;

    return res.json({
      sessionToken,
      verifyWith,
      targetAuthType,
      storedAuthType: storedAuth,
      message,
      ...(verifyWith === 'otp' ? { channel: otpChannel || channel } : {}),
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    return respondOtpDeliveryError(err, res, 'Switch method start error');
  }
});

router.post('/switch-method/send-otp', async (req, res) => {
  try {
    const { sessionToken } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const { channel, devOtp, delivery } = await resendSwitchAuthOtp(sessionToken);

    return res.json({
      channel,
      message: loginOtpMessage(channel, devOtp, delivery),
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    return respondOtpDeliveryError(err, res, 'Switch method resend OTP error');
  }
});

router.post('/switch-method/verify-old', async (req, res) => {
  try {
    const { sessionToken, secret, otp } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const challenge = await findActiveChallenge(sessionToken, 'switch_auth_method');
    const user = await User.findById(challenge.userId).select('+password +pinHash lastLoginMethod');
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const { verifyMethod } = req.body || {};
    const method = LOGIN_METHODS.includes(verifyMethod) ? verifyMethod : user.lastLoginMethod || 'otp';
    const { availableMethods } = buildLoginMethodsResponse(user);

    if (!availableMethods.includes(method)) {
      return res.status(400).json({
        error: `This account cannot be verified with ${authTypeLabel(method)} sign-in.`,
      });
    }

    if (method === 'otp') {
      const otpRes = validateOtpCode(otp);
      if (otpRes.error) return res.status(400).json({ error: otpRes.error });
      await verifySwitchAuthOtp(sessionToken, otpRes.value);
    } else if (method === 'pin') {
      if (!secret || typeof secret !== 'string') {
        return res.status(400).json({ error: 'PIN is required' });
      }
      if (!user.pinHash) {
        return res.status(400).json({ error: 'This account does not have a PIN configured' });
      }
      const ok = await user.verifyPin(secret);
      if (!ok) {
        return res.status(401).json({ error: 'PIN is incorrect' });
      }
      challenge.oldAuthVerified = true;
      await challenge.save();
    } else {
      if (!secret || typeof secret !== 'string') {
        return res.status(400).json({ error: 'Password is required' });
      }
      if (!user.password) {
        return res.status(400).json({ error: 'This account does not have a password configured' });
      }
      const ok = await user.verifyPassword(secret);
      if (!ok) {
        return res.status(401).json({ error: 'Password is incorrect' });
      }
      challenge.oldAuthVerified = true;
      await challenge.save();
    }

    return res.json({
      verified: true,
      targetAuthType: challenge.targetAuthType,
    });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Switch method verify-old error:', err);
    return res.status(500).json({ error: 'Failed to verify current sign-in method' });
  }
});

router.post('/switch-method/complete', async (req, res) => {
  try {
    const { sessionToken, password, pin } = req.body || {};
    if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

    const challenge = await findActiveChallenge(sessionToken, 'switch_auth_method');
    if (!challenge.oldAuthVerified) {
      return res.status(400).json({ error: 'Verify your current sign-in method first' });
    }

    const credRes = validateAuthCredential(challenge.targetAuthType, password, pin);
    if (credRes.error) return res.status(400).json({ error: credRes.error });

    const user = await User.findById(challenge.userId);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (credRes.authType === 'password') {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          authType: 'password',
          password: credRes.password,
        },
      });
    } else {
      const pinHash = await hashPin(credRes.pin);
      await User.findByIdAndUpdate(user._id, {
        $set: {
          authType: 'pin',
          pinHash,
        },
      });
    }

    challenge.completed = true;
    await challenge.save();

    const updated = await User.findById(user._id);
    const token = signUserToken(updated);
    return res.json({ user: safeUser(updated), token });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('Switch method complete error:', err);
    return res.status(500).json({ error: 'Failed to update sign-in method' });
  }
});

module.exports = router;