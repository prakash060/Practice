/** Mirrors backend pk-foodfactory-backend/utils/userValidation.js */

import {
  DEFAULT_COUNTRY_CODE,
  getPhoneLast10,
} from './phoneCountry'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const NAME_MIN = 2
export const NAME_MAX = 120
export const ADDRESS_MIN = 10
export const ADDRESS_MAX = 500
export const PASSWORD_MIN = 8

export type AuthType = 'password' | 'otp'

export { DEFAULT_COUNTRY_CODE, formatPhoneForApi, toLocalPhoneDigits, formatPhoneDisplay } from './phoneCountry'

export type FieldErrors = Partial<
  Record<
    | 'name'
    | 'email'
    | 'password'
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

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'Phone is required'
  const last10 = getPhoneLast10(phone.trim())
  if (!last10 || last10.length !== 10) {
    return `Enter a valid 10-digit mobile number (${DEFAULT_COUNTRY_CODE})`
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
  const last10 = getPhoneLast10(raw)
  if (last10 && last10.length === 10) return null
  return `Enter a valid email or 10-digit mobile (${DEFAULT_COUNTRY_CODE})`
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

export function validateCredentialForm(authType: AuthType, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (authType === 'otp') return errors
  const ePass = validatePassword(password)
  if (ePass) errors.password = ePass
  return errors
}

export function validateLoginForm(identifier: string, secret: string): FieldErrors {
  const errors: FieldErrors = {}
  const eId = validateIdentifier(identifier)
  if (eId) errors.identifier = eId
  if (!secret) errors.secret = 'Password is required'
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
