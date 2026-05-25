/** Mirrors backend pk-foodfactory-backend/utils/userValidation.js */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PIN_RE = /^\d{4,6}$/

export const NAME_MIN = 2
export const NAME_MAX = 120
export const ADDRESS_MIN = 10
export const ADDRESS_MAX = 500
export const PASSWORD_MIN = 8

export type AuthType = 'password' | 'pin' | 'otp'

export function normalizePhoneDigits(value: string): string {
  return value.replace(/[\s\-().]/g, '')
}

const PHONE_RE = /^\+?[0-9]{10,15}$/

export type FieldErrors = Partial<
  Record<
    | 'name'
    | 'email'
    | 'password'
    | 'pin'
    | 'phone'
    | 'address'
    | 'identifier'
    | 'secret'
    | 'emailOtp'
    | 'phoneOtp'
    | 'authType',
    string
  >
>

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name is required'
  if (name.trim().length < NAME_MIN || name.trim().length > NAME_MAX) {
    return `Name must be between ${NAME_MIN} and ${NAME_MAX} characters`
  }
  return null
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required'
  if (!EMAIL_RE.test(email.trim())) return 'Invalid email format'
  return null
}

export function validatePassword(password: string, { required = true } = {}): string | null {
  if (!password) {
    if (!required) return null
    return 'Password is required'
  }
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters`
  }
  return null
}

export function validatePin(pin: string, { required = true } = {}): string | null {
  if (!pin.trim()) {
    if (!required) return null
    return 'PIN is required'
  }
  if (!PIN_RE.test(pin.trim())) {
    return 'PIN must be 4 to 6 digits'
  }
  return null
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'Phone is required'
  const norm = normalizePhoneDigits(phone.trim())
  if (!PHONE_RE.test(norm)) {
    return 'Phone must be 10–15 digits (optional leading +)'
  }
  return null
}

export function validateAddress(address: string): string | null {
  if (!address.trim()) return 'Address is required'
  const t = address.trim()
  if (t.length < ADDRESS_MIN || t.length > ADDRESS_MAX) {
    return `Address must be between ${ADDRESS_MIN} and ${ADDRESS_MAX} characters`
  }
  return null
}

export function validateIdentifier(identifier: string): string | null {
  if (!identifier.trim()) return 'Email or mobile number is required'
  const raw = identifier.trim()
  if (EMAIL_RE.test(raw)) return null
  const norm = normalizePhoneDigits(raw)
  if (PHONE_RE.test(norm)) return null
  return 'Enter a valid email or 10–15 digit mobile number'
}

export function validateOtp(code: string): string | null {
  const trimmed = code.trim().replace(/\s/g, '')
  if (!trimmed) return 'Code is required'
  if (!/^\d{6}$/.test(trimmed)) return 'Enter the 6-digit code'
  return null
}

export function validateSignupProfileForm(fields: {
  name: string
  email: string
  phone: string
  address: string
}): FieldErrors {
  const errors: FieldErrors = {}
  const eName = validateName(fields.name)
  if (eName) errors.name = eName
  const eEmail = validateEmail(fields.email)
  if (eEmail) errors.email = eEmail
  const ePhone = validatePhone(fields.phone)
  if (ePhone) errors.phone = ePhone
  const eAddr = validateAddress(fields.address)
  if (eAddr) errors.address = eAddr
  return errors
}

export function validateCredentialForm(authType: AuthType, password: string, pin: string): FieldErrors {
  const errors: FieldErrors = {}
  if (authType === 'otp') return errors
  if (authType === 'password') {
    const ePass = validatePassword(password)
    if (ePass) errors.password = ePass
  } else {
    const ePin = validatePin(pin)
    if (ePin) errors.pin = ePin
  }
  return errors
}

export function validateOptionalSignupCredentials(
  enablePassword: boolean,
  password: string,
  enablePin: boolean,
  pin: string
): FieldErrors {
  const errors: FieldErrors = {}
  if (enablePassword) {
    const ePass = validatePassword(password)
    if (ePass) errors.password = ePass
  }
  if (enablePin) {
    const ePin = validatePin(pin)
    if (ePin) errors.pin = ePin
  }
  return errors
}

export function validateLoginForm(identifier: string, secret: string): FieldErrors {
  const errors: FieldErrors = {}
  const eId = validateIdentifier(identifier)
  if (eId) errors.identifier = eId
  if (!secret) errors.secret = 'Password or PIN is required'
  return errors
}

export function validateProfileForm(fields: { name: string; phone: string; address: string }): FieldErrors {
  const errors: FieldErrors = {}
  const eName = validateName(fields.name)
  if (eName) errors.name = eName
  const ePhone = validatePhone(fields.phone)
  if (ePhone) errors.phone = ePhone
  const eAddr = validateAddress(fields.address)
  if (eAddr) errors.address = eAddr
  return errors
}
