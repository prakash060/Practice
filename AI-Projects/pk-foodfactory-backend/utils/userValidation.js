const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN = 2;
const NAME_MAX = 120;
const ADDRESS_MIN = 10;
const ADDRESS_MAX = 500;
const PASSWORD_MIN = 8;
const AUTH_TYPES = ['password', 'otp'];
const DEFAULT_COUNTRY_DIAL = (process.env.DEFAULT_COUNTRY_DIAL || '91').replace(/\D/g, '') || '91';
const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;

function normalizePhoneDigits(value) {
  return String(value).replace(/[\s\-().+]/g, '');
}

/** Last 10 digits — canonical local form for Indian mobiles (DB lookup). */
function getPhoneLast10(phone) {
  const digits = normalizePhoneDigits(phone).replace(/\D/g, '');
  if (digits.length < 10) return null;

  let local;
  if (
    digits.length >= DEFAULT_COUNTRY_DIAL.length + 10 &&
    digits.startsWith(DEFAULT_COUNTRY_DIAL)
  ) {
    local = digits.slice(DEFAULT_COUNTRY_DIAL.length);
    if (local.length > 10) local = local.slice(-10);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    local = digits.slice(1);
  } else {
    local = digits.slice(-10);
  }

  if (local.length !== 10 || !INDIAN_MOBILE_RE.test(local)) return null;
  return local;
}

/** MSG91 / Twilio — international format without + (e.g. 919876543210). */
function formatMsg91Mobile(phone) {
  const last10 = getPhoneLast10(phone);
  if (!last10) {
    throw new Error('Invalid mobile number for SMS');
  }
  return `${DEFAULT_COUNTRY_DIAL}${last10}`;
}

function formatPhoneWithDialCode(phone) {
  return formatMsg91Mobile(phone);
}

function phoneLookupRegex(phone) {
  const last10 = getPhoneLast10(phone);
  if (!last10) return null;
  return new RegExp(`${last10}$`);
}

const PHONE_RE = /^\+?[0-9]{10,15}$/;

function validateName(name) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { error: 'Name is required' };
  }
  const nameTrim = name.trim();
  if (nameTrim.length < NAME_MIN || nameTrim.length > NAME_MAX) {
    return {
      error: `Name must be between ${NAME_MIN} and ${NAME_MAX} characters`,
    };
  }
  return { value: nameTrim };
}

function validateEmail(email) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { error: 'Email is required' };
  }
  if (!EMAIL_RE.test(email.trim())) {
    return { error: 'Invalid email format' };
  }
  return { value: email.trim().toLowerCase() };
}

function validatePassword(password, { required = true } = {}) {
  if (!password || typeof password !== 'string' || !password.length) {
    if (!required) return { value: null };
    return { error: 'Password is required' };
  }
  if (password.length < PASSWORD_MIN) {
    return { error: `Password must be at least ${PASSWORD_MIN} characters` };
  }
  return { value: password };
}

function validateIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    return { error: 'Email or mobile number is required' };
  }
  const raw = identifier.trim();
  if (EMAIL_RE.test(raw)) {
    return { value: raw.toLowerCase(), kind: 'email' };
  }
  const phoneNorm = normalizePhoneDigits(raw);
  if (PHONE_RE.test(phoneNorm)) {
    const last10 = getPhoneLast10(phoneNorm);
    if (!last10) {
      return { error: 'Enter a valid 10-digit Indian mobile number (+91)' };
    }
    return { value: last10, kind: 'phone' };
  }
  return { error: 'Enter a valid email or 10-digit mobile (+91)' };
}

function validateOtpCode(code) {
  if (!code || typeof code !== 'string') {
    return { error: 'OTP is required' };
  }
  const trimmed = code.trim().replace(/\s/g, '');
  if (!/^\d{6}$/.test(trimmed)) {
    return { error: 'OTP must be 6 digits' };
  }
  return { value: trimmed };
}

function validatePhone(phone) {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { error: 'Phone is required' };
  }
  const phoneNorm = normalizePhoneDigits(phone.trim());
  if (!PHONE_RE.test(phoneNorm)) {
    return {
      error: 'Enter a valid 10-digit mobile number with country code +91',
    };
  }
  const last10 = getPhoneLast10(phoneNorm);
  if (!last10) {
    return { error: 'Enter a valid 10-digit Indian mobile number (+91)' };
  }
  return { value: last10 };
}

function validateAddress(address) {
  if (!address || typeof address !== 'string' || !address.trim()) {
    return { error: 'Address is required' };
  }
  const addressTrim = address.trim();
  if (addressTrim.length < ADDRESS_MIN || addressTrim.length > ADDRESS_MAX) {
    return {
      error: `Address must be between ${ADDRESS_MIN} and ${ADDRESS_MAX} characters`,
    };
  }
  return { value: addressTrim };
}

module.exports = {
  NAME_MIN,
  NAME_MAX,
  ADDRESS_MIN,
  ADDRESS_MAX,
  PASSWORD_MIN,
  AUTH_TYPES,
  validateName,
  validateEmail,
  validatePassword,
  validateIdentifier,
  validateOtpCode,
  validatePhone,
  validateAddress,
  normalizePhoneDigits,
  getPhoneLast10,
  formatMsg91Mobile,
  formatPhoneWithDialCode,
  DEFAULT_COUNTRY_DIAL,
  phoneLookupRegex,
};
