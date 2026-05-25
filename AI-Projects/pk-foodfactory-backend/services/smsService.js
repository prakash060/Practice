const https = require('https');

function getSmsProvider() {
  return (process.env.SMS_PROVIDER || 'none').trim().toLowerCase();
}

const SMS_PLACEHOLDER_MARKERS = ['your_msg91', 'your_twilio', 'change_me'];

function looksLikePlaceholder(value) {
  const v = String(value).trim().toLowerCase();
  if (!v) return true;
  return SMS_PLACEHOLDER_MARKERS.some((marker) => v.includes(marker));
}

function isMsg91Configured() {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey || !templateId) return false;
  if (looksLikePlaceholder(authKey) || looksLikePlaceholder(templateId)) return false;
  return true;
}

function isTwilioConfigured() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!accountSid || !authToken || !from) return false;
  if (
    looksLikePlaceholder(accountSid) ||
    looksLikePlaceholder(authToken) ||
    looksLikePlaceholder(from)
  ) {
    return false;
  }
  return true;
}

function getSmsOtpStatusLabel() {
  const provider = getSmsProvider();
  if (provider === 'msg91') {
    return isMsg91Configured()
      ? 'configured (MSG91)'
      : 'MSG91 selected but MSG91_AUTH_KEY / MSG91_TEMPLATE_ID missing or placeholder';
  }
  if (provider === 'twilio') {
    return isTwilioConfigured()
      ? 'configured (Twilio)'
      : 'Twilio selected but TWILIO_* vars missing or placeholder';
  }
  if (provider !== 'none') {
    return `unknown SMS_PROVIDER "${provider}" — use msg91, twilio, or leave unset for dev-only`;
  }
  return 'dev-only (set SMS_PROVIDER=msg91 and MSG91_* keys)';
}

function devLogSms(phone, code, purposeLabel) {
  if (process.env.NODE_ENV !== 'production' || process.env.OTP_DEV_LOG === 'true') {
    console.warn(`[OTP SMS → ${phone}] ${code} (${purposeLabel})`);
    return true;
  }
  return false;
}

function sendMsg91(phone, code) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey || !templateId) return Promise.reject(new Error('MSG91 not configured'));

  const mobile = phone.replace(/\D/g, '').slice(-10);
  const body = JSON.stringify({
    template_id: templateId,
    short_url: '0',
    recipients: [{ mobiles: `91${mobile}`, var: code }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'control.msg91.com',
        path: '/api/v5/flow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: authKey,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else {
            console.error(
              `MSG91 failed (HTTP ${res.statusCode}): ${data || '(empty body)'}`
            );
            reject(new Error(`MSG91 failed (HTTP ${res.statusCode})`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendTwilio(phone, code, purposeLabel) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio not configured');
  }

  const params = new URLSearchParams({
    To: phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`,
    From: from,
    Body: `SVI Foods: Your ${purposeLabel} code is ${code}. Valid 10 minutes.`,
  });

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(params.toString()),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`Twilio failed: ${data}`));
        });
      }
    );
    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

async function sendOtpSms(phone, code, purposeLabel = 'verification') {
  const provider = getSmsProvider();

  if (provider === 'msg91') {
    if (!isMsg91Configured()) {
      console.error(
        'MSG91: SMS_PROVIDER=msg91 but MSG91_AUTH_KEY or MSG91_TEMPLATE_ID is missing or placeholder'
      );
      if (devLogSms(phone, code, purposeLabel)) return { sent: false, devLog: true };
      throw new Error('MSG91 is not configured on the server');
    }
    try {
      await sendMsg91(phone, code);
      return { sent: true };
    } catch (err) {
      console.error('MSG91 error:', err.message);
      if (devLogSms(phone, code, purposeLabel)) return { sent: false, devLog: true };
      throw err;
    }
  }

  if (provider === 'twilio') {
    if (!isTwilioConfigured()) {
      console.error('Twilio: SMS_PROVIDER=twilio but TWILIO_* vars are missing or placeholder');
      if (devLogSms(phone, code, purposeLabel)) return { sent: false, devLog: true };
      throw new Error('Twilio is not configured on the server');
    }
    try {
      await sendTwilio(phone, code, purposeLabel);
      return { sent: true };
    } catch (err) {
      console.error('Twilio error:', err.message);
      if (devLogSms(phone, code, purposeLabel)) return { sent: false, devLog: true };
      throw err;
    }
  }

  if (devLogSms(phone, code, purposeLabel)) {
    return { sent: false, devLog: true };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMS is not configured on the server');
  }

  return { sent: false, devLog: true };
}

module.exports = {
  sendOtpSms,
  getSmsProvider,
  getSmsOtpStatusLabel,
  isMsg91Configured,
  isTwilioConfigured,
};
