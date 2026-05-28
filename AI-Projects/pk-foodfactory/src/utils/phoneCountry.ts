/** India-first default; mirrors backend userValidation phone helpers. */

export const DEFAULT_COUNTRY_CODE = '+91'
export const DEFAULT_COUNTRY_DIAL = '91'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizePhoneDigits(value: string): string {
  return value.replace(/[\s\-().]/g, '')
}

/** Last 10 digits — canonical local mobile (India). */
export function getPhoneLast10(phone: string): string | null {
  const digits = normalizePhoneDigits(phone).replace(/\D/g, '')
  if (digits.length < 10) return null
  return digits.slice(-10)
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

/** Local digits → value for API (10-digit canonical form backend expects). */
export function formatPhoneForApi(localDigits: string): string {
  const last10 = getPhoneLast10(localDigits)
  return last10 ?? sanitizeLocalPhoneInput(localDigits)
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

export function shouldShowPhoneCountryPrefix(value: string): boolean {
  const v = value.trim()
  if (!v) return true
  if (v.includes('@')) return false
  if (/[a-zA-Z]/.test(v)) return false
  return /^[\d+\s\-().]+$/.test(v)
}

export function sanitizeIdentifierInput(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)) {
    return trimmed
  }
  if (shouldShowPhoneCountryPrefix(trimmed)) {
    const local = sanitizeLocalPhoneInput(trimmed)
    return local
  }
  return trimmed
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
