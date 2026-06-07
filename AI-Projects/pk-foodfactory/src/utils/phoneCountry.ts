/** India-first default; mirrors backend userValidation phone helpers. */

export const DEFAULT_COUNTRY_CODE = '+91'
export const DEFAULT_COUNTRY_DIAL = '91'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizePhoneDigits(value: string): string {
  return value.replace(/[\s\-().+]/g, '')
}

const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/

/** Last 10 digits — canonical local mobile (India). */
export function getPhoneLast10(phone: string): string | null {
  const digits = normalizePhoneDigits(phone).replace(/\D/g, '')
  if (digits.length < 10) return null

  let local: string
  if (digits.length >= DEFAULT_COUNTRY_DIAL.length + 10 && digits.startsWith(DEFAULT_COUNTRY_DIAL)) {
    local = digits.slice(DEFAULT_COUNTRY_DIAL.length)
    if (local.length > 10) local = local.slice(-10)
  } else if (digits.length === 11 && digits.startsWith('0')) {
    local = digits.slice(1)
  } else {
    local = digits.slice(-10)
  }

  if (local.length !== 10 || !INDIAN_MOBILE_RE.test(local)) return null
  return local
}

/** Strip country code and keep up to 10 local digits for controlled inputs. */
export function sanitizeLocalPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith(DEFAULT_COUNTRY_DIAL) && digits.length > 10) {
    digits = digits.slice(DEFAULT_COUNTRY_DIAL.length)
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 10)
}

/** DB/API value (10 digits or legacy +91…) → local digits for PhoneInput. */
export function toLocalPhoneDigits(stored?: string | null): string {
  if (!stored) return ''
  return getPhoneLast10(stored) ?? sanitizeLocalPhoneInput(stored)
}

/** Local digits → value for API (international format without +, e.g. 919876543210). */
export function formatPhoneForApi(localDigits: string): string {
  const last10 = getPhoneLast10(localDigits)
  if (!last10) return sanitizeLocalPhoneInput(localDigits)
  return `${DEFAULT_COUNTRY_DIAL}${last10}`
}

/** Display label e.g. +91 98864 99444 */
export function formatPhoneDisplay(stored?: string | null): string {
  const local = toLocalPhoneDigits(stored)
  if (!local) return ''
  if (local.length === 10) {
    return `${DEFAULT_COUNTRY_CODE} ${local.slice(0, 5)} ${local.slice(5)}`
  }
  return `${DEFAULT_COUNTRY_CODE} ${local}`
}

/** True when the value looks like a phone number (show +91 prefix). */
export function shouldShowPhoneCountryPrefix(value: string): boolean {
  const v = value.trimStart()
  // Empty must stay in plain text mode so mobile browsers allow typing letters.
  if (!v.trim()) return false
  if (v.includes('@')) return false
  if (/[a-zA-Z]/.test(v)) return false
  return /^[\d+\s\-().]+$/.test(v)
}

export function sanitizeIdentifierInput(raw: string): string {
  // Keep raw value while typing — trimming on each keystroke breaks mobile IME/cursor.
  if (raw.includes('@') || /[a-zA-Z]/.test(raw)) {
    return raw
  }
  if (shouldShowPhoneCountryPrefix(raw)) {
    return sanitizeLocalPhoneInput(raw)
  }
  return raw
}

/** Email as-is; phone → last 10 digits for backend lookup. */
export function normalizeIdentifierForApi(identifier: string): string {
  const raw = identifier.trim()
  if (EMAIL_RE.test(raw)) return raw.toLowerCase()
  const last10 = getPhoneLast10(raw)
  if (last10) return last10
  return raw
}

/** Razorpay / payment — 10-digit Indian mobile starting 6–9. */
export function normalizeIndianPhone(raw?: string): string {
  const last10 = getPhoneLast10(raw ?? '')
  if (!last10) return ''
  return /^[6-9]\d{9}$/.test(last10) ? last10 : ''
}
