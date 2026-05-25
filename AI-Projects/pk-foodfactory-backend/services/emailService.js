const nodemailer = require('nodemailer');

function isEmailConfigured() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return false;
  const u = String(user).trim().toLowerCase();
  const p = String(pass).trim();
  if (!u || !p || u.includes('your_email') || p.includes('your_email')) return false;
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
    if (process.env.NODE_ENV !== 'production' || process.env.OTP_DEV_LOG === 'true') {
      console.warn(`[OTP email → ${to}] ${code} (${purposeLabel})`);
      return { sent: false, devLog: true };
    }
    throw new Error('Email is not configured on the server');
  }

  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });
  return { sent: true };
}

module.exports = { sendOtpEmail, isEmailConfigured };
