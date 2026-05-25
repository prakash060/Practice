const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN = 2;
const NAME_MAX = 120;
const ADDRESS_MIN = 10;
const ADDRESS_MAX = 500;
const PASSWORD_MIN = 8;
const PIN_RE = /^\d{4,6}$/;
const AUTH_TYPES = ['password', 'pin'];

function normalizePhoneDigits(value) {
  return String(value).replace(/[\s\-().]/g, '');
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

function validatePin(pin, { required = true } = {}) {
  if (!pin || typeof pin !== 'string' || !pin.trim()) {
    if (!required) return { value: null };
    return { error: 'PIN is required' };
  }
  const trimmed = pin.trim();
  if (!PIN_RE.test(trimmed)) {
    return { error: 'PIN must be 4 to 6 digits' };
  }
  return { value: trimmed };
}

function validateAuthCredential(authType, password, pin) {
  if (!AUTH_TYPES.includes(authType)) {
    return { error: 'authType must be password or pin' };
  }
  if (authType === 'password') {
    const passRes = validatePassword(password, { required: true });
    if (passRes.error) return passRes;
    return { authType, password: passRes.value, pin: null };
  }
  const pinRes = validatePin(pin, { required: true });
  if (pinRes.error) return pinRes;
  return { authType, password: null, pin: pinRes.value };
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
    return { value: phoneNorm, kind: 'phone' };
  }
  return { error: 'Enter a valid email or 10–15 digit mobile number' };
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
      error: 'Phone must be 10–15 digits (optional leading +)',
    };
  }
  return { value: phoneNorm };
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
  PIN_RE,
  AUTH_TYPES,
  validateName,
  validateEmail,
  validatePassword,
  validatePin,
  validateAuthCredential,
  validateIdentifier,
  validateOtpCode,
  validatePhone,
  validateAddress,
  normalizePhoneDigits,
};
