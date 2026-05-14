/**
 * Categories are admin-managed (see `state/FoodContext`). This module only
 * provides defaults used when a category has no image/accent set yet, plus a
 * generic image fallback for items whose category has no image either.
 */
export const DEFAULT_CATEGORY_EMOJI = '🍽️'
export const DEFAULT_CATEGORY_ACCENT = '#6b5ef7'

/** Plain SVG so it works offline and never 404s. */
export const GENERIC_FOOD_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="%23f1eefb"/>' +
      '<stop offset="1" stop-color="%23e7e1fb"/>' +
      '</linearGradient></defs>' +
      '<rect width="240" height="160" fill="url(%23g)"/>' +
      '<text x="50%" y="58%" font-size="68" text-anchor="middle">🍽️</text>' +
      '</svg>'
  )
