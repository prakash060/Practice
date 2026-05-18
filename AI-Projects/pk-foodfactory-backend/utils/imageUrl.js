/** Allowed HTTPS hosts for admin-provided gallery imageUrl values. */
const ALLOWED_HTTPS_HOSTS = new Set([
  'images.unsplash.com',
  'images.pexels.com',
  'plus.unsplash.com',
])

/**
 * Validates imageUrl from multipart body: null/empty clears; data: URLs allowed
 * (file uploads converted server-side); https only from allowlisted hosts.
 */
function parseImageUrlField(raw, errors, fieldLabel = 'imageUrl') {
  if (raw === null || raw === '' || raw === 'null') {
    return null
  }
  if (typeof raw !== 'string') {
    return undefined
  }
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }
  if (trimmed.startsWith('data:image/')) {
    return trimmed
  }
  if (trimmed.startsWith('https://')) {
    try {
      const host = new URL(trimmed).hostname
      if (!ALLOWED_HTTPS_HOSTS.has(host)) {
        errors.push(
          `${fieldLabel} must use a supported image host (${[...ALLOWED_HTTPS_HOSTS].join(', ')}) or upload a file`
        )
        return undefined
      }
      return trimmed
    } catch {
      errors.push(`${fieldLabel} is not a valid URL`)
      return undefined
    }
  }
  errors.push(`${fieldLabel} must be an https:// URL, a data:image URL, or empty`)
  return undefined
}

module.exports = { parseImageUrlField, ALLOWED_HTTPS_HOSTS }
