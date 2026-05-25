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

  const purposeLabel = purpose === 'signup' ? 'signup' : 'password reset';

  await Promise.all([
    sendOtpEmail(email, emailCode, purposeLabel),
    sendOtpSms(phone, phoneCode, purposeLabel),
  ]);

  markSendCooldown(email, phone, purpose);

  return {
    challenge,
    sessionToken,
    devOtp: buildDevOtpPayload(emailCode, phoneCode),
  };
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

  const purposeLabel = purpose === 'signup' ? 'signup' : 'password reset';
  await Promise.all([
    sendOtpEmail(challenge.email, emailCode, purposeLabel),
    sendOtpSms(challenge.phone, phoneCode, purposeLabel),
  ]);

  markSendCooldown(challenge.email, challenge.phone, purpose);
  return {
    challenge,
    devOtp: buildDevOtpPayload(emailCode, phoneCode),
  };
}

module.exports = {
  OTP_TTL_MS,
  isDevOtpExposureEnabled,
  createChallengeAndSendOtps,
  findActiveChallenge,
  verifyChallengeOtps,
  resendOtps,
};
