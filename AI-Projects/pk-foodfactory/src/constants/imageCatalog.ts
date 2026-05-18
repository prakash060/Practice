/**
 * Bundled image catalog for the admin ImagePicker.
 *
 * Each entry is a beautiful gradient + emoji "image card" rendered as an inline
 * SVG data URL. This means every thumbnail renders instantly with zero network
 * dependency — no broken images, no CORS, no API key required. Admins still get
 * to upload their own real photographs via the "Upload your own" tab.
 */

export type ImageCatalogGroup =
  | 'biryani-rice'
  | 'curry-thali'
  | 'snacks-street'
  | 'dessert'
  | 'beverage'
  | 'pizza-pasta'
  | 'burger-fast'
  | 'salad-healthy'
  | 'bread-breakfast'
  | 'generic'

export type ImageCatalogAudience = 'category' | 'item' | 'both'

export interface ImageCatalogEntry {
  id: string
  label: string
  url: string
  tags: string[]
  group: ImageCatalogGroup
  audience: ImageCatalogAudience
}

/**
 * Builds a small, clean SVG poster (600x400) with a two-stop diagonal gradient,
 * a large emoji centerpiece, a soft accent ring, and the label centred below.
 * The resulting data URL is ~1KB and renders instantly in any <img>.
 */
function svgCard(
  emoji: string,
  from: string,
  to: string,
  label: string
): string {
  const safeLabel = label
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
      <radialGradient id="r" cx="50%" cy="42%" r="48%">
        <stop offset="0" stop-color="rgba(255,255,255,0.55)"/>
        <stop offset="1" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g)"/>
    <circle cx="300" cy="170" r="120" fill="url(#r)"/>
    <text x="300" y="220" text-anchor="middle" font-size="170" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
    <text x="300" y="340" text-anchor="middle" font-size="32" font-family="-apple-system, Segoe UI, Roboto, sans-serif" font-weight="600" fill="rgba(255,255,255,0.95)" letter-spacing="0.5">${safeLabel}</text>
  </svg>`
  // Percent-encode parens too — otherwise the literal `(` / `)` inside the SVG
  // gradient references like `url(#g)` and `rgba(...)` collide with CSS
  // `background-image: url(...)` parsing and break the entire tile.
  const encoded = encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29')
  return `data:image/svg+xml;utf8,${encoded}`
}

/* Themed gradient palettes — each food family gets its own warm/cool tones. */
const G = {
  biryani: ['#f59e0b', '#d97706'],
  rice: ['#fcd34d', '#f59e0b'],
  curry: ['#dc2626', '#991b1b'],
  thali: ['#ea580c', '#c2410c'],
  paneer: ['#fb923c', '#ea580c'],
  dal: ['#eab308', '#ca8a04'],
  fish: ['#0ea5e9', '#0369a1'],
  snack: ['#f97316', '#c2410c'],
  street: ['#e11d48', '#9f1239'],
  dessert: ['#ec4899', '#be185d'],
  cake: ['#f472b6', '#db2777'],
  icecream: ['#06b6d4', '#0891b2'],
  juice: ['#84cc16', '#65a30d'],
  lassi: ['#facc15', '#eab308'],
  coffee: ['#92400e', '#78350f'],
  tea: ['#a16207', '#854d0e'],
  soda: ['#7c3aed', '#5b21b6'],
  pizza: ['#dc2626', '#991b1b'],
  pasta: ['#eab308', '#a16207'],
  burger: ['#ea580c', '#9a3412'],
  fast: ['#f97316', '#c2410c'],
  salad: ['#22c55e', '#15803d'],
  healthy: ['#10b981', '#047857'],
  bread: ['#d4a574', '#a16207'],
  breakfast: ['#fbbf24', '#f59e0b'],
  pancake: ['#fde047', '#facc15'],
  generic1: ['#6366f1', '#4338ca'],
  generic2: ['#8b5cf6', '#6d28d9'],
  generic3: ['#a855f7', '#7e22ce'],
  generic4: ['#06b6d4', '#0e7490'],
  grill: ['#7c2d12', '#451a03'],
  soup: ['#f59e0b', '#b45309'],
  sandwich: ['#fbbf24', '#d97706'],
  seafood: ['#0284c7', '#075985'],
  taco: ['#facc15', '#a16207'],
  sushi: ['#10b981', '#065f46'],
  noodle: ['#f97316', '#7c2d12'],
  kebab: ['#b91c1c', '#7f1d1d'],
} as const

const card = (e: string, c: readonly [string, string], l: string) =>
  svgCard(e, c[0], c[1], l)

/** Curated 70-entry food catalog — every thumbnail is a guaranteed-rendering SVG. */
export const IMAGE_CATALOG: ImageCatalogEntry[] = [
  // Biryani & rice
  { id: 'biryani-1', label: 'Chicken Biryani', url: card('🍛', G.biryani, 'Chicken Biryani'), tags: ['biryani', 'rice', 'chicken', 'indian', 'spicy'], group: 'biryani-rice', audience: 'both' },
  { id: 'biryani-2', label: 'Hyderabadi Biryani', url: card('🍚', G.biryani, 'Hyderabadi Biryani'), tags: ['biryani', 'rice', 'indian', 'hyderabadi'], group: 'biryani-rice', audience: 'both' },
  { id: 'biryani-3', label: 'Veg Biryani', url: card('🥘', G.biryani, 'Veg Biryani'), tags: ['biryani', 'vegetarian', 'rice', 'indian'], group: 'biryani-rice', audience: 'both' },
  { id: 'rice-1', label: 'Fried Rice', url: card('🍚', G.rice, 'Fried Rice'), tags: ['rice', 'fried', 'asian', 'bowl'], group: 'biryani-rice', audience: 'both' },
  { id: 'rice-2', label: 'Steamed Rice', url: card('🍚', G.rice, 'Steamed Rice'), tags: ['rice', 'plain', 'side', 'steamed'], group: 'biryani-rice', audience: 'item' },
  { id: 'pulao-1', label: 'Vegetable Pulao', url: card('🥘', G.rice, 'Vegetable Pulao'), tags: ['pulao', 'rice', 'vegetarian', 'indian'], group: 'biryani-rice', audience: 'both' },
  { id: 'rice-3', label: 'Jeera Rice', url: card('🍚', G.rice, 'Jeera Rice'), tags: ['jeera', 'rice', 'side', 'indian'], group: 'biryani-rice', audience: 'item' },

  // Curry & thali
  { id: 'curry-1', label: 'Butter Chicken', url: card('🍗', G.curry, 'Butter Chicken'), tags: ['curry', 'chicken', 'indian', 'butter', 'creamy'], group: 'curry-thali', audience: 'both' },
  { id: 'curry-2', label: 'Paneer Tikka Masala', url: card('🧀', G.paneer, 'Paneer Tikka'), tags: ['curry', 'paneer', 'vegetarian', 'indian'], group: 'curry-thali', audience: 'both' },
  { id: 'curry-3', label: 'Dal Tadka', url: card('🥣', G.dal, 'Dal Tadka'), tags: ['dal', 'lentil', 'curry', 'indian', 'vegetarian'], group: 'curry-thali', audience: 'both' },
  { id: 'thali-1', label: 'Indian Thali', url: card('🍱', G.thali, 'Indian Thali'), tags: ['thali', 'indian', 'platter', 'meal'], group: 'curry-thali', audience: 'category' },
  { id: 'thali-2', label: 'South Indian Thali', url: card('🍛', G.thali, 'South Indian Thali'), tags: ['thali', 'south', 'indian', 'banana-leaf'], group: 'curry-thali', audience: 'category' },
  { id: 'curry-4', label: 'Chicken Curry', url: card('🍲', G.curry, 'Chicken Curry'), tags: ['curry', 'chicken', 'spicy', 'indian'], group: 'curry-thali', audience: 'both' },
  { id: 'curry-5', label: 'Fish Curry', url: card('🐟', G.fish, 'Fish Curry'), tags: ['curry', 'fish', 'seafood', 'indian'], group: 'curry-thali', audience: 'both' },
  { id: 'curry-6', label: 'Chole Bhature', url: card('🥘', G.curry, 'Chole Bhature'), tags: ['chole', 'bhature', 'punjabi', 'indian'], group: 'curry-thali', audience: 'both' },
  { id: 'curry-7', label: 'Rajma Chawal', url: card('🥘', G.curry, 'Rajma Chawal'), tags: ['rajma', 'curry', 'punjabi', 'indian'], group: 'curry-thali', audience: 'both' },

  // Snacks & street
  { id: 'snack-1', label: 'Samosa', url: card('🥟', G.snack, 'Samosa'), tags: ['samosa', 'snack', 'street', 'fried', 'indian'], group: 'snacks-street', audience: 'both' },
  { id: 'snack-2', label: 'Pakora Platter', url: card('🫓', G.snack, 'Pakora Platter'), tags: ['pakora', 'snack', 'fried', 'indian'], group: 'snacks-street', audience: 'both' },
  { id: 'snack-3', label: 'Vada Pav', url: card('🍔', G.street, 'Vada Pav'), tags: ['vada', 'pav', 'street', 'mumbai', 'indian'], group: 'snacks-street', audience: 'both' },
  { id: 'snack-4', label: 'Pani Puri', url: card('🥟', G.street, 'Pani Puri'), tags: ['pani', 'puri', 'chaat', 'street', 'indian'], group: 'snacks-street', audience: 'both' },
  { id: 'snack-5', label: 'Spring Rolls', url: card('🌯', G.snack, 'Spring Rolls'), tags: ['spring', 'roll', 'snack', 'fried'], group: 'snacks-street', audience: 'both' },
  { id: 'snack-6', label: 'French Fries', url: card('🍟', G.fast, 'French Fries'), tags: ['fries', 'potato', 'snack', 'fast'], group: 'snacks-street', audience: 'both' },
  { id: 'snack-7', label: 'Nachos', url: card('🌮', G.snack, 'Nachos'), tags: ['nachos', 'snack', 'mexican'], group: 'snacks-street', audience: 'item' },
  { id: 'snack-8', label: 'Chaat', url: card('🥗', G.street, 'Chaat'), tags: ['chaat', 'snack', 'street', 'indian'], group: 'snacks-street', audience: 'both' },

  // Dessert
  { id: 'dessert-1', label: 'Gulab Jamun', url: card('🍡', G.dessert, 'Gulab Jamun'), tags: ['gulab', 'jamun', 'sweet', 'dessert', 'indian'], group: 'dessert', audience: 'both' },
  { id: 'dessert-2', label: 'Ice Cream', url: card('🍨', G.icecream, 'Ice Cream'), tags: ['ice', 'cream', 'dessert', 'cold'], group: 'dessert', audience: 'both' },
  { id: 'dessert-3', label: 'Chocolate Cake', url: card('🍰', G.cake, 'Chocolate Cake'), tags: ['cake', 'chocolate', 'dessert', 'bakery'], group: 'dessert', audience: 'both' },
  { id: 'dessert-4', label: 'Pastries', url: card('🧁', G.cake, 'Pastries'), tags: ['pastry', 'dessert', 'bakery', 'sweet'], group: 'dessert', audience: 'both' },
  { id: 'dessert-5', label: 'Kulfi', url: card('🍦', G.icecream, 'Kulfi'), tags: ['kulfi', 'ice', 'dessert', 'indian'], group: 'dessert', audience: 'both' },
  { id: 'dessert-6', label: 'Brownie', url: card('🍫', G.cake, 'Brownie'), tags: ['brownie', 'chocolate', 'dessert'], group: 'dessert', audience: 'item' },
  { id: 'dessert-7', label: 'Donuts', url: card('🍩', G.cake, 'Donuts'), tags: ['donut', 'dessert', 'sweet', 'bakery'], group: 'dessert', audience: 'both' },
  { id: 'dessert-8', label: 'Jalebi', url: card('🍥', G.dessert, 'Jalebi'), tags: ['jalebi', 'sweet', 'indian', 'dessert'], group: 'dessert', audience: 'both' },

  // Beverage
  { id: 'bev-1', label: 'Fresh Juice', url: card('🧃', G.juice, 'Fresh Juice'), tags: ['juice', 'drink', 'beverage', 'fresh'], group: 'beverage', audience: 'both' },
  { id: 'bev-2', label: 'Mango Lassi', url: card('🥭', G.lassi, 'Mango Lassi'), tags: ['lassi', 'mango', 'drink', 'indian', 'yogurt'], group: 'beverage', audience: 'both' },
  { id: 'bev-3', label: 'Coffee', url: card('☕', G.coffee, 'Coffee'), tags: ['coffee', 'cafe', 'beverage', 'hot'], group: 'beverage', audience: 'both' },
  { id: 'bev-4', label: 'Masala Chai', url: card('🍵', G.tea, 'Masala Chai'), tags: ['chai', 'tea', 'masala', 'indian', 'beverage'], group: 'beverage', audience: 'both' },
  { id: 'bev-5', label: 'Soft Drinks', url: card('🥤', G.soda, 'Soft Drinks'), tags: ['soda', 'cold', 'drink', 'beverage'], group: 'beverage', audience: 'both' },
  { id: 'bev-6', label: 'Smoothie', url: card('🧋', G.juice, 'Smoothie'), tags: ['smoothie', 'healthy', 'drink', 'bowl'], group: 'beverage', audience: 'item' },
  { id: 'bev-7', label: 'Milkshake', url: card('🥤', G.lassi, 'Milkshake'), tags: ['milkshake', 'cold', 'drink', 'beverage'], group: 'beverage', audience: 'both' },

  // Pizza & pasta
  { id: 'pizza-1', label: 'Margherita Pizza', url: card('🍕', G.pizza, 'Margherita'), tags: ['pizza', 'italian', 'cheese', 'margherita'], group: 'pizza-pasta', audience: 'both' },
  { id: 'pizza-2', label: 'Pepperoni Pizza', url: card('🍕', G.pizza, 'Pepperoni'), tags: ['pizza', 'pepperoni', 'italian'], group: 'pizza-pasta', audience: 'both' },
  { id: 'pizza-3', label: 'Veg Supreme', url: card('🍕', G.salad, 'Veg Supreme'), tags: ['pizza', 'vegetarian', 'italian'], group: 'pizza-pasta', audience: 'both' },
  { id: 'pasta-1', label: 'Spaghetti', url: card('🍝', G.pasta, 'Spaghetti'), tags: ['pasta', 'spaghetti', 'italian'], group: 'pizza-pasta', audience: 'both' },
  { id: 'pasta-2', label: 'Penne Arrabbiata', url: card('🍝', G.pasta, 'Penne Arrabbiata'), tags: ['pasta', 'penne', 'italian', 'tomato'], group: 'pizza-pasta', audience: 'both' },
  { id: 'pasta-3', label: 'Lasagna', url: card('🍝', G.pizza, 'Lasagna'), tags: ['pasta', 'lasagna', 'italian', 'cheese'], group: 'pizza-pasta', audience: 'both' },

  // Burger & fast food
  { id: 'burger-1', label: 'Classic Burger', url: card('🍔', G.burger, 'Classic Burger'), tags: ['burger', 'fast', 'beef', 'american'], group: 'burger-fast', audience: 'both' },
  { id: 'burger-2', label: 'Chicken Burger', url: card('🍔', G.fast, 'Chicken Burger'), tags: ['burger', 'chicken', 'fast'], group: 'burger-fast', audience: 'both' },
  { id: 'burger-3', label: 'Hot Dog', url: card('🌭', G.fast, 'Hot Dog'), tags: ['hotdog', 'fast', 'street'], group: 'burger-fast', audience: 'item' },
  { id: 'wrap-1', label: 'Shawarma Wrap', url: card('🌯', G.fast, 'Shawarma Wrap'), tags: ['wrap', 'shawarma', 'fast', 'middle-eastern'], group: 'burger-fast', audience: 'both' },
  { id: 'burger-4', label: 'Veggie Burger', url: card('🍔', G.salad, 'Veggie Burger'), tags: ['burger', 'vegetarian', 'fast'], group: 'burger-fast', audience: 'both' },

  // Salad & healthy
  { id: 'salad-1', label: 'Green Salad', url: card('🥗', G.salad, 'Green Salad'), tags: ['salad', 'healthy', 'vegetarian', 'green'], group: 'salad-healthy', audience: 'both' },
  { id: 'salad-2', label: 'Caesar Salad', url: card('🥗', G.healthy, 'Caesar Salad'), tags: ['salad', 'caesar', 'healthy'], group: 'salad-healthy', audience: 'both' },
  { id: 'salad-3', label: 'Buddha Bowl', url: card('🥗', G.healthy, 'Buddha Bowl'), tags: ['bowl', 'healthy', 'grain', 'vegetarian'], group: 'salad-healthy', audience: 'both' },
  { id: 'salad-4', label: 'Fruit Bowl', url: card('🥭', G.juice, 'Fruit Bowl'), tags: ['fruit', 'healthy', 'fresh'], group: 'salad-healthy', audience: 'both' },

  // Bread & breakfast
  { id: 'bread-1', label: 'Naan Bread', url: card('🫓', G.bread, 'Naan Bread'), tags: ['naan', 'bread', 'indian', 'tandoor'], group: 'bread-breakfast', audience: 'both' },
  { id: 'bread-2', label: 'Paratha', url: card('🫓', G.bread, 'Paratha'), tags: ['paratha', 'bread', 'indian', 'breakfast'], group: 'bread-breakfast', audience: 'both' },
  { id: 'breakfast-1', label: 'Idli Sambar', url: card('🍘', G.breakfast, 'Idli Sambar'), tags: ['idli', 'sambar', 'south', 'indian', 'breakfast'], group: 'bread-breakfast', audience: 'both' },
  { id: 'breakfast-2', label: 'Dosa', url: card('🥞', G.breakfast, 'Dosa'), tags: ['dosa', 'south', 'indian', 'breakfast'], group: 'bread-breakfast', audience: 'both' },
  { id: 'breakfast-3', label: 'Pancakes', url: card('🥞', G.pancake, 'Pancakes'), tags: ['pancake', 'breakfast', 'sweet'], group: 'bread-breakfast', audience: 'both' },
  { id: 'breakfast-4', label: 'Eggs & Toast', url: card('🍳', G.breakfast, 'Eggs & Toast'), tags: ['egg', 'toast', 'breakfast'], group: 'bread-breakfast', audience: 'item' },
  { id: 'breakfast-5', label: 'Poha', url: card('🍚', G.breakfast, 'Poha'), tags: ['poha', 'breakfast', 'indian'], group: 'bread-breakfast', audience: 'both' },

  // Generic / category heroes
  { id: 'gen-1', label: 'Restaurant Spread', url: card('🍽️', G.generic1, 'Restaurant'), tags: ['restaurant', 'dining', 'generic', 'food'], group: 'generic', audience: 'category' },
  { id: 'gen-2', label: 'Fine Dining', url: card('🍷', G.generic2, 'Fine Dining'), tags: ['restaurant', 'ambience', 'generic'], group: 'generic', audience: 'category' },
  { id: 'gen-3', label: 'Chef Special', url: card('👨‍🍳', G.generic3, 'Chef Special'), tags: ['chef', 'fine', 'dining', 'generic'], group: 'generic', audience: 'category' },
  { id: 'gen-4', label: 'Food Platter', url: card('🍱', G.generic4, 'Food Platter'), tags: ['variety', 'generic', 'food', 'platter'], group: 'generic', audience: 'category' },
  { id: 'gen-5', label: 'Grilled Platter', url: card('🍖', G.grill, 'Grilled Platter'), tags: ['grill', 'meat', 'generic', 'bbq'], group: 'generic', audience: 'both' },
  { id: 'gen-6', label: 'Soup Bowl', url: card('🍜', G.soup, 'Soup Bowl'), tags: ['soup', 'bowl', 'warm', 'generic'], group: 'generic', audience: 'item' },
  { id: 'gen-7', label: 'Sandwich', url: card('🥪', G.sandwich, 'Sandwich'), tags: ['sandwich', 'lunch', 'generic'], group: 'generic', audience: 'both' },
  { id: 'gen-8', label: 'Seafood Platter', url: card('🦐', G.seafood, 'Seafood Platter'), tags: ['seafood', 'fish', 'platter'], group: 'generic', audience: 'both' },
  { id: 'gen-9', label: 'Tacos', url: card('🌮', G.taco, 'Tacos'), tags: ['taco', 'mexican', 'street'], group: 'generic', audience: 'both' },
  { id: 'gen-10', label: 'Sushi Platter', url: card('🍣', G.sushi, 'Sushi Platter'), tags: ['sushi', 'japanese', 'seafood'], group: 'generic', audience: 'both' },
  { id: 'gen-11', label: 'Noodles', url: card('🍜', G.noodle, 'Noodles'), tags: ['noodles', 'asian', 'ramen', 'chinese'], group: 'generic', audience: 'both' },
  { id: 'gen-12', label: 'Kebab Skewers', url: card('🍢', G.kebab, 'Kebab Skewers'), tags: ['kebab', 'grill', 'middle-eastern'], group: 'generic', audience: 'both' },
  { id: 'gen-13', label: 'Dumplings', url: card('🥟', G.noodle, 'Dumplings'), tags: ['dumpling', 'momo', 'chinese', 'asian'], group: 'generic', audience: 'both' },
]

export const CATALOG_GROUPS: { id: ImageCatalogGroup; label: string }[] = [
  { id: 'biryani-rice', label: 'Biryani & rice' },
  { id: 'curry-thali', label: 'Curry & thali' },
  { id: 'snacks-street', label: 'Snacks & street food' },
  { id: 'dessert', label: 'Desserts' },
  { id: 'beverage', label: 'Drinks' },
  { id: 'pizza-pasta', label: 'Pizza & pasta' },
  { id: 'burger-fast', label: 'Burgers & fast food' },
  { id: 'salad-healthy', label: 'Salads & healthy' },
  { id: 'bread-breakfast', label: 'Bread & breakfast' },
  { id: 'generic', label: 'More options' },
]

const CATALOG_URL_SET = new Set(IMAGE_CATALOG.map((e) => e.url))

export function isCatalogImageUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return CATALOG_URL_SET.has(url)
}

function normalizeSearchText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
}

function scoreEntry(entry: ImageCatalogEntry, words: string[], mode: 'category' | 'item'): number {
  let score = 0
  if (entry.audience === 'both' || entry.audience === mode) {
    score += 1
  } else {
    score -= 2
  }

  const tagStr = entry.tags.join(' ')
  const labelLower = entry.label.toLowerCase()
  for (const word of words) {
    if (tagStr.includes(word)) score += 4
    if (labelLower.includes(word)) score += 3
    if (entry.group.includes(word)) score += 2
  }
  return score
}

export function getCatalogForContext(options: {
  mode: 'category' | 'item'
  searchText?: string
  query?: string
  groupFilter?: ImageCatalogGroup | 'all'
}): ImageCatalogEntry[] {
  const { mode, searchText = '', query = '', groupFilter = 'all' } = options
  const words = normalizeSearchText(`${searchText} ${query}`)

  let list = IMAGE_CATALOG.filter((e) => {
    if (groupFilter !== 'all' && e.group !== groupFilter) return false
    return true
  })

  if (query.trim()) {
    const q = query.toLowerCase()
    list = list.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.tags.some((t) => t.includes(q)) ||
        e.group.includes(q)
    )
  }

  if (words.length === 0) {
    return [...list].sort((a, b) => {
      const ga = a.group === 'generic' ? 1 : 0
      const gb = b.group === 'generic' ? 1 : 0
      return ga - gb
    })
  }

  return [...list]
    .map((entry) => ({ entry, score: scoreEntry(entry, words, mode) }))
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry)
}

/** Strip the encoding portion so older saved values still resolve to a catalog entry. */
function dataUrlBody(url: string): string {
  const idx = url.indexOf(',')
  return idx >= 0 ? url.slice(idx + 1) : url
}

export function findCatalogEntryByUrl(url: string | null | undefined): ImageCatalogEntry | undefined {
  if (!url) return undefined
  if (!url.startsWith('data:image/svg')) {
    return IMAGE_CATALOG.find((e) => e.url === url)
  }
  const body = dataUrlBody(url)
  return IMAGE_CATALOG.find((e) => dataUrlBody(e.url) === body)
}
