const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OtpChallenge = require('../models/OtpChallenge');
const { sendOtpEmail } = require('./emailService');
const { sendOtpSms } = require('./smsService');

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_SALT_ROUNDS = 8;
const SEND_COOLDOWN_MS = 60 * 1000;

const sendCooldown = new Map();

function isDevOtpExposureEnabled() {
  return process.env.NODE_ENV !== 'production' || process.env.OTP_DEV_LOG === 'true';
}

function buildDevOtpPayload(emailCode, phoneCode) {
  if (!isDevOtpExposureEnabled()) return undefined;
  return { email: emailCode, phone: phoneCode };
}

function buildDevOtpLoginPayload(channel, code) {
  if (!isDevOtpExposureEnabled()) return undefined;
  return { channel, code };
}

function purposeLabel(purpose) {
  if (purpose === 'signup') return 'signup';
  if (purpose === 'login') return 'sign in';
  return 'password reset';
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function newSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function hashOtp(code) {
  return bcrypt.hash(String(code), OTP_SALT_ROUNDS);
}

async function verifyOtpHash(code, hash) {
  if (!hash || !code) return false;
  return bcrypt.compare(String(code), hash);
}

function cooldownKey(email, phone, purpose) {
  return `${purpose}:${email}:${phone}`;
}

function checkSendCooldown(email, phone, purpose) {
  const key = cooldownKey(email, phone, purpose);
  const last = sendCooldown.get(key);
  if (last && Date.now() - last < SEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((SEND_COOLDOWN_MS - (Date.now() - last)) / 1000);
    const err = new Error(`Please wait ${waitSec} seconds before requesting another code`);
    err.statusCode = 429;
    throw err;
  }
}

function markSendCooldown(email, phone, purpose) {
  sendCooldown.set(cooldownKey(email, phone, purpose), Date.now());
}

async function invalidatePriorChallenges(email, phone, purpose) {
  await OtpChallenge.deleteMany({
    purpose,
    email,
    phone,
    completed: false,
  });
}

async function createChallengeAndSendOtps({
  purpose,
  email,
  phone,
  signupPayload,
  userId,
}) {
  checkSendCooldown(email, phone, purpose);

  const emailCode = generateOtpCode();
  const phoneCode = isDevOtpExposureEnabled() ? emailCode : generateOtpCode();
  const sessionToken = newSessionToken();

  await invalidatePriorChallenges(email, phone, purpose);

  const challenge = await OtpChallenge.create({
    purpose,
    sessionToken,
    email,
    phone,
    emailCodeHash: await hashOtp(emailCode),
    phoneCodeHash: await hashOtp(phoneCode),
    signupPayload: signupPayload || undefined,
    userId: userId || null,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    emailVerified: false,
    phoneVerified: false,
    completed: false,
  });

  const purposeLabelText = purposeLabel(purpose);

  const delivery = await deliverOtps(email, emailCode, phone, phoneCode, purposeLabelText);

  markSendCooldown(email, phone, purpose);

  return {
    challenge,
    sessionToken,
    devOtp:
      delivery.emailDevLog || delivery.smsDevLog
        ? buildDevOtpPayload(emailCode, phoneCode)
        : undefined,
    delivery,
  };
}

async function deliverOtps(email, emailCode, phone, phoneCode, purposeLabel) {
  const [emailResult, smsResult] = await Promise.allSettled([
    sendOtpEmail(email, emailCode, purposeLabel),
    sendOtpSms(phone, phoneCode, purposeLabel),
  ]);

  if (emailResult.status === 'rejected') {
    console.warn(`OTP email delivery failed (${purposeLabel}):`, emailResult.reason?.message);
  }
  if (smsResult.status === 'rejected') {
    console.warn(`OTP SMS delivery failed (${purposeLabel}):`, smsResult.reason?.message);
  }

  const emailValue = emailResult.status === 'fulfilled' ? emailResult.value : null;
  const smsValue = smsResult.status === 'fulfilled' ? smsResult.value : null;

  const delivery = {
    emailSent: Boolean(emailValue?.sent),
    smsSent: Boolean(smsValue?.sent),
    emailDevLog: Boolean(emailValue?.devLog),
    smsDevLog: Boolean(smsValue?.devLog),
  };

  // Only fail outright if neither channel could be delivered nor surfaced via the
  // dev fallback. Partial failures are reported by otpSessionMessage().
  const anyDelivered =
    delivery.emailSent || delivery.smsSent || delivery.emailDevLog || delivery.smsDevLog;
  if (!anyDelivered) {
    throw (
      (emailResult.status === 'rejected' && emailResult.reason) ||
      (smsResult.status === 'rejected' && smsResult.reason) ||
      new Error('Could not send verification codes. Check email/SMS settings on the server.')
    );
  }

  return delivery;
}

async function findActiveChallenge(sessionToken, purpose) {
  const challenge = await OtpChallenge.findOne({
    sessionToken,
    purpose,
    completed: false,
  }).select('+emailCodeHash +phoneCodeHash');

  if (!challenge) {
    const err = new Error('Session expired or invalid. Please start again.');
    err.statusCode = 404;
    throw err;
  }

  if (challenge.expiresAt < new Date()) {
    const err = new Error('Verification codes have expired. Please request new codes.');
    err.statusCode = 410;
    throw err;
  }

  return challenge;
}

async function verifyChallengeOtps(sessionToken, purpose, emailOtp, phoneOtp) {
  const challenge = await findActiveChallenge(sessionToken, purpose);

  if (challenge.attempts >= challenge.maxAttempts) {
    const err = new Error('Too many failed attempts. Please start again.');
    err.statusCode = 429;
    throw err;
  }

  const emailOk = await verifyOtpHash(emailOtp, challenge.emailCodeHash);
  const phoneOk = await verifyOtpHash(phoneOtp, challenge.phoneCodeHash);

  if (!emailOk || !phoneOk) {
    challenge.attempts += 1;
    await challenge.save();
    let message = 'Invalid verification code(s). Please check email and SMS codes.';
    if (!emailOk && phoneOk) message = 'Email verification code is incorrect.';
    else if (emailOk && !phoneOk) message = 'SMS verification code is incorrect.';
    const err = new Error(message);
    err.statusCode = 400;
    throw err;
  }

  challenge.emailVerified = true;
  challenge.phoneVerified = true;
  await challenge.save();

  return challenge;
}

async function resendOtps(sessionToken, purpose) {
  const challenge = await findActiveChallenge(sessionToken, purpose);
  checkSendCooldown(challenge.email, challenge.phone, purpose);

  const emailCode = generateOtpCode();
  const phoneCode = isDevOtpExposureEnabled() ? emailCode : generateOtpCode();
  challenge.emailCodeHash = await hashOtp(emailCode);
  challenge.phoneCodeHash = await hashOtp(phoneCode);
  challenge.emailVerified = false;
  challenge.phoneVerified = false;
  challenge.attempts = 0;
  challenge.expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await challenge.save();

  const purposeLabelText = purposeLabel(purpose);
  const delivery = await deliverOtps(
    challenge.email,
    emailCode,
    challenge.phone,
    phoneCode,
    purposeLabelText
  );

  markSendCooldown(challenge.email, challenge.phone, purpose);
  return {
    challenge,
    devOtp:
      delivery.emailDevLog || delivery.smsDevLog
        ? buildDevOtpPayload(emailCode, phoneCode)
        : undefined,
    delivery,
  };
}

async function deliverLoginOtp(user, preferredChannel, code, smsPhone) {
  const purpose = purposeLabel('login');
  let activeChannel = preferredChannel;
  let delivery = {
    emailSent: false,
    smsSent: false,
    emailDevLog: false,
    smsDevLog: false,
  };

  async function tryEmail() {
    if (!user.email) return null;
    const emailResult = await sendOtpEmail(user.email, code, purpose);
    return {
      emailSent: Boolean(emailResult?.sent),
      smsSent: false,
      emailDevLog: Boolean(emailResult?.devLog),
      smsDevLog: false,
    };
  }

  async function trySms() {
    const phone = smsPhone || user.phone;
    if (!phone) return null;
    const smsResult = await sendOtpSms(phone, code, purpose);
    return {
      emailSent: false,
      smsSent: Boolean(smsResult?.sent),
      emailDevLog: false,
      smsDevLog: Boolean(smsResult?.devLog),
    };
  }

  const primary = preferredChannel === 'email' ? tryEmail : trySms;
  const secondary = preferredChannel === 'email' ? trySms : tryEmail;
  const secondaryChannel = preferredChannel === 'email' ? 'phone' : 'email';

  try {
    const primaryDelivery = await primary();
    if (primaryDelivery) delivery = primaryDelivery;
  } catch (primaryErr) {
    console.warn(`Login OTP ${preferredChannel} delivery failed:`, primaryErr.message);
  }

  const primaryOk =
    Boolean(delivery.emailSent || delivery.smsSent) ||
    Boolean(delivery.emailDevLog || delivery.smsDevLog);

  if (!primaryOk) {
    try {
      const alt = await secondary();
      if (alt) {
        delivery = alt;
        activeChannel = secondaryChannel;
      }
    } catch (secondaryErr) {
      console.warn(`Login OTP ${secondaryChannel} fallback failed:`, secondaryErr.message);
    }
  }

  const delivered =
    Boolean(delivery.emailSent || delivery.smsSent) ||
    Boolean(delivery.emailDevLog || delivery.smsDevLog);

  if (!delivered) {
    const err = new Error(
      'Could not send verification code. Check server email/SMS settings or try the other channel.'
    );
    err.statusCode = 503;
    throw err;
  }

  return { activeChannel, delivery };
}

async function createLoginChallengeAndSendOtp({ user, channel, loginPhone }) {
  const email = user.email;
  const phone = user.phone;
  checkSendCooldown(email, phone, 'login');

  const code = generateOtpCode();
  const sessionToken = newSessionToken();

  await invalidatePriorChallenges(email, phone, 'login');

  const smsPhone = loginPhone || user.phone;
  const { activeChannel, delivery } = await deliverLoginOtp(user, channel, code, smsPhone);

  const challengeData = {
    purpose: 'login',
    sessionToken,
    email,
    phone,
    loginChannel: activeChannel,
    userId: user._id,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    emailVerified: false,
    phoneVerified: false,
    completed: false,
    emailCodeHash: null,
    phoneCodeHash: null,
  };

  if (activeChannel === 'email') {
    challengeData.emailCodeHash = await hashOtp(code);
  } else {
    challengeData.phoneCodeHash = await hashOtp(code);
  }

  const challenge = await OtpChallenge.create(challengeData);

  markSendCooldown(email, phone, 'login');

  const actuallySent = Boolean(delivery.emailSent || delivery.smsSent);
  const devOtp =
    delivery.emailDevLog || delivery.smsDevLog || (isDevOtpExposureEnabled() && !actuallySent)
      ? buildDevOtpLoginPayload(activeChannel, code)
      : undefined;

  return {
    challenge,
    sessionToken,
    channel: activeChannel,
    devOtp,
    delivery,
  };
}

async function resendLoginOtp(sessionToken) {
  const challenge = await findActiveChallenge(sessionToken, 'login');
  const channel = challenge.loginChannel;
  if (!channel) {
    const err = new Error('Invalid login session');
    err.statusCode = 400;
    throw err;
  }

  checkSendCooldown(challenge.email, challenge.phone, 'login');

  const code = generateOtpCode();
  challenge.emailCodeHash = null;
  challenge.phoneCodeHash = null;
  if (channel === 'email') {
    challenge.emailCodeHash = await hashOtp(code);
  } else {
    challenge.phoneCodeHash = await hashOtp(code);
  }
  challenge.emailVerified = false;
  challenge.phoneVerified = false;
  challenge.attempts = 0;
  challenge.expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await challenge.save();

  let delivery;
  if (channel === 'email') {
    const emailResult = await sendOtpEmail(challenge.email, code, purposeLabel('login'));
    delivery = {
      emailSent: Boolean(emailResult?.sent),
      smsSent: false,
      emailDevLog: Boolean(emailResult?.devLog),
      smsDevLog: false,
    };
  } else {
    const smsResult = await sendOtpSms(challenge.phone, code, purposeLabel('login'));
    delivery = {
      emailSent: false,
      smsSent: Boolean(smsResult?.sent),
      emailDevLog: false,
      smsDevLog: Boolean(smsResult?.devLog),
    };
  }

  markSendCooldown(challenge.email, challenge.phone, 'login');

  return {
    challenge,
    channel,
    devOtp:
      delivery.emailDevLog || delivery.smsDevLog
        ? buildDevOtpLoginPayload(channel, code)
        : undefined,
    delivery,
  };
}

async function verifyLoginOtp(sessionToken, otp) {
  const challenge = await findActiveChallenge(sessionToken, 'login');
  const channel = challenge.loginChannel;

  if (!channel) {
    const err = new Error('Invalid login session');
    err.statusCode = 400;
    throw err;
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    const err = new Error('Too many failed attempts. Please start again.');
    err.statusCode = 429;
    throw err;
  }

  const hash = channel === 'email' ? challenge.emailCodeHash : challenge.phoneCodeHash;
  const ok = await verifyOtpHash(otp, hash);

  if (!ok) {
    challenge.attempts += 1;
    await challenge.save();
    const err = new Error(
      channel === 'email'
        ? 'Email verification code is incorrect.'
        : 'SMS verification code is incorrect.'
    );
    err.statusCode = 400;
    throw err;
  }

  if (channel === 'email') {
    challenge.emailVerified = true;
  } else {
    challenge.phoneVerified = true;
  }
  await challenge.save();

  return challenge;
}

async function createResetSession({ email, phone, userId }) {
  await invalidatePriorChallenges(email, phone, 'reset_credentials');
  const sessionToken = newSessionToken();
  const challenge = await OtpChallenge.create({
    purpose: 'reset_credentials',
    sessionToken,
    email,
    phone,
    userId: userId || null,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    emailVerified: false,
    phoneVerified: false,
    identityVerified: false,
    completed: false,
    loginChannel: null,
    emailCodeHash: null,
    phoneCodeHash: null,
  });
  return { challenge, sessionToken };
}

async function sendResetSingleOtp(sessionToken, channel) {
  const challenge = await findActiveChallenge(sessionToken, 'reset_credentials');
  checkSendCooldown(challenge.email, challenge.phone, 'reset_credentials');

  const code = generateOtpCode();
  challenge.loginChannel = channel;
  challenge.emailCodeHash = null;
  challenge.phoneCodeHash = null;
  challenge.identityVerified = false;
  challenge.attempts = 0;
  challenge.expiresAt = new Date(Date.now() + OTP_TTL_MS);

  if (channel === 'email') {
    challenge.emailCodeHash = await hashOtp(code);
  } else {
    challenge.phoneCodeHash = await hashOtp(code);
  }
  await challenge.save();

  let delivery;
  if (channel === 'email') {
    const emailResult = await sendOtpEmail(challenge.email, code, purposeLabel('reset_credentials'));
    delivery = {
      emailSent: Boolean(emailResult?.sent),
      smsSent: false,
      emailDevLog: Boolean(emailResult?.devLog),
      smsDevLog: false,
    };
  } else {
    const smsResult = await sendOtpSms(challenge.phone, code, purposeLabel('reset_credentials'));
    delivery = {
      emailSent: false,
      smsSent: Boolean(smsResult?.sent),
      emailDevLog: false,
      smsDevLog: Boolean(smsResult?.devLog),
    };
  }

  markSendCooldown(challenge.email, challenge.phone, 'reset_credentials');

  return {
    challenge,
    channel,
    devOtp:
      delivery.emailDevLog || delivery.smsDevLog
        ? buildDevOtpLoginPayload(channel, code)
        : undefined,
    delivery,
  };
}

async function resendResetSingleOtp(sessionToken) {
  const challenge = await findActiveChallenge(sessionToken, 'reset_credentials');
  const channel = challenge.loginChannel;
  if (!channel) {
    const err = new Error('Choose email or SMS before requesting a code');
    err.statusCode = 400;
    throw err;
  }
  return sendResetSingleOtp(sessionToken, channel);
}

async function verifyResetSingleOtp(sessionToken, otp) {
  const challenge = await findActiveChallenge(sessionToken, 'reset_credentials');
  const channel = challenge.loginChannel;
  if (!channel) {
    const err = new Error('Request a verification code first');
    err.statusCode = 400;
    throw err;
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    const err = new Error('Too many failed attempts. Please start again.');
    err.statusCode = 429;
    throw err;
  }

  const hash = channel === 'email' ? challenge.emailCodeHash : challenge.phoneCodeHash;
  const ok = await verifyOtpHash(otp, hash);

  if (!ok) {
    challenge.attempts += 1;
    await challenge.save();
    const err = new Error('Verification code is incorrect.');
    err.statusCode = 400;
    throw err;
  }

  challenge.identityVerified = true;
  await challenge.save();
  return challenge;
}

module.exports = {
  OTP_TTL_MS,
  isDevOtpExposureEnabled,
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
};
