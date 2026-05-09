/** Mirrors backend [pk-foodfactory-backend/utils/userValidation.js](userValidation) */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const NAME_MIN = 2
export const NAME_MAX = 120
export const ADDRESS_MIN = 10
export const ADDRESS_MAX = 500
export const PASSWORD_MIN = 8

export function normalizePhoneDigits(value: string): string {
  return value.replace(/[\s\-().]/g, '')
}

const PHONE_RE = /^\+?[0-9]{10,15}$/

export type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'phone' | 'address', string>>

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

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters`
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

export function validateSignupForm(fields: {
  name: string
  email: string
  password: string
  phone: string
  address: string
}): FieldErrors {
  const errors: FieldErrors = {}
  const eName = validateName(fields.name)
  if (eName) errors.name = eName
  const eEmail = validateEmail(fields.email)
  if (eEmail) errors.email = eEmail
  const ePass = validatePassword(fields.password)
  if (ePass) errors.password = ePass
  const ePhone = validatePhone(fields.phone)
  if (ePhone) errors.phone = ePhone
  const eAddr = validateAddress(fields.address)
  if (eAddr) errors.address = eAddr
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
