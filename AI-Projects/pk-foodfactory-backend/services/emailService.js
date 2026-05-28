const nodemailer = require('nodemailer');

const EMAIL_PLACEHOLDER_MARKERS = [
  'your_email',
  'your_gmail',
  'your_16_char_app_password',
  'your_email_password',
  'change_me',
  'changeme',
  'hello',
  'dummy',
  'example',
];

function looksLikePlaceholder(value) {
  const v = String(value).trim().toLowerCase();
  if (!v) return true;
  if (v === 'test') return true;
  return EMAIL_PLACEHOLDER_MARKERS.some((marker) => v.includes(marker));
}

function canOtpDevFallback() {
  return process.env.NODE_ENV !== 'production' || process.env.OTP_DEV_LOG === 'true';
}

function isEmailConfigured() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return false;
  if (looksLikePlaceholder(user) || looksLikePlaceholder(pass)) return false;
  return true;
}

function getTransport() {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER.trim(),
      pass: process.env.EMAIL_PASS.trim(),
    },
  });
}

async function sendOtpEmail(to, code, purposeLabel) {
  const transport = getTransport();
  const subject = `SVI Foods — ${purposeLabel} verification code`;
  const text = `Your verification code is ${code}. It expires in 10 minutes. Do not share this code.`;

  if (!transport) {
    if (canOtpDevFallback()) {
      console.warn(`[OTP email → ${to}] ${code} (${purposeLabel})`);
      return { sent: false, devLog: true };
    }
    throw new Error('Email is not configured on the server');
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });
    return { sent: true };
  } catch (err) {
    const hint =
      err.code === 'EAUTH'
        ? 'Gmail rejected EMAIL_PASS — use a Google App Password (16 chars), not your login password'
        : err.message;
    console.error(`SMTP send failed: ${hint}`);
    if (canOtpDevFallback()) {
      console.warn(`[OTP email → ${to}] ${code} (${purposeLabel}) — SMTP failed, dev fallback`);
      return { sent: false, devLog: true, error: hint };
    }
    const smtpErr = new Error(hint);
    smtpErr.code = err.code;
    throw smtpErr;
  }
}

module.exports = { sendOtpEmail, isEmailConfigured, canOtpDevFallback };
