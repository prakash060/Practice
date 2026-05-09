const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN = 2;
const NAME_MAX = 120;
const ADDRESS_MIN = 10;
const ADDRESS_MAX = 500;
const PASSWORD_MIN = 8;

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

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { error: 'Password is required' };
  }
  if (password.length < PASSWORD_MIN) {
    return { error: `Password must be at least ${PASSWORD_MIN} characters` };
  }
  return { value: password };
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
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
  validateAddress,
  normalizePhoneDigits,
};
