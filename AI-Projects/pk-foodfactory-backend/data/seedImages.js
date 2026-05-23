/**
 * Professional food imagery for demo seeding (adminSeed route only).
 * Curated Unsplash CDN URLs — stable, HTTPS, allowed by imageUrl validation.
 */

const UNSPLASH = (photoId, w = 800, h = 500) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** Verified Unsplash photo IDs (food & portraits). */
const PHOTOS = {
  biryani: 'photo-1563379091339-7ddb5a177f37',
  rice: 'photo-1512058564366-3149a7c702e3',
  curry: 'photo-1585931643504-8819f9fcdc2e',
  thali: 'photo-1546833999-b9f581a1996d',
  butterChicken: 'photo-1603894584371-5a1c3a3c5b5e',
  paneer: 'photo-1631451095760-6729d72c3c0e',
  fish: 'photo-1519708227418-c8fd9a32b1a4',
  pizza: 'photo-1565299624946-b28f40a0ae38',
  pizza2: 'photo-1574071318508-1cdbab1a3966',
  pasta: 'photo-1621996346565-e3dbc646d9a9',
  pasta2: 'photo-1551183053-bf053a5f9b3c',
  burger: 'photo-1568901347235-663d46d40462',
  burger2: 'photo-1550547660-d9450f859349',
  fries: 'photo-1573080496219-bb080dd4f877',
  street: 'photo-1601050691194-9029a8263000',
  wrap: 'photo-1626700051175-6813293a030f',
  dessert: 'photo-1551024506-0bccd828d307',
  cake: 'photo-1606313564200-e75d5e30476c',
  icecream: 'photo-1563805042-7684c019e1cb',
  drinks: 'photo-1546175165-ab582f44eafa',
  coffee: 'photo-1495474472287-4d716b1b0e0b',
  tea: 'photo-1571934811359-5049f0f2757b',
  salad: 'photo-1512620343977-1073a0c9a3e4',
  bowl: 'photo-1546069901-ba9599a7e63c',
  breakfast: 'photo-1525351484163-752f43c18677',
  dosa: 'photo-1665241855775-06d39e199b0e',
  bread: 'photo-1573140247632-f791fd8935b1',
  portrait1: 'photo-1507003211169-0b1df722b42d',
  portrait2: 'photo-1494790108377-be9c29b29330',
  portrait3: 'photo-1500648767791-00dcc994a43e',
  portrait4: 'photo-1438761681033-6461ffad8d80',
  portrait5: 'photo-1472099645785-5658abf4ff4e',
};

const TEMPLATE_GROUP = {
  'Biryani Bites': 'biryani-rice',
  'Curry Corner': 'curry-thali',
  'Pizza Palace': 'pizza-pasta',
  'Burger Bay': 'burger-fast',
  'Snack Street': 'snacks-street',
  'Sweet Spot': 'dessert',
  'Drinks Dock': 'beverage',
  'Salad Studio': 'salad-healthy',
  'Breakfast Bar': 'bread-breakfast',
};

const CATEGORY_IMAGES = {
  'biryani-rice': UNSPLASH(PHOTOS.biryani),
  'curry-thali': UNSPLASH(PHOTOS.thali),
  'pizza-pasta': UNSPLASH(PHOTOS.pizza),
  'burger-fast': UNSPLASH(PHOTOS.burger),
  'snacks-street': UNSPLASH(PHOTOS.street),
  dessert: UNSPLASH(PHOTOS.dessert),
  beverage: UNSPLASH(PHOTOS.drinks),
  'salad-healthy': UNSPLASH(PHOTOS.salad),
  'bread-breakfast': UNSPLASH(PHOTOS.breakfast),
};

const ITEM_IMAGES = [
  { tags: ['biryani', 'chicken', 'hyderabadi', 'mutton', 'lucknowi'], groups: ['biryani-rice'], url: UNSPLASH(PHOTOS.biryani, 600, 400) },
  { tags: ['biryani', 'veg', 'paneer', 'kathal', 'pulao', 'pulav'], groups: ['biryani-rice'], url: UNSPLASH(PHOTOS.rice, 600, 400) },
  { tags: ['jeera', 'steamed', 'lemon', 'coconut', 'tomato', 'curd'], groups: ['biryani-rice'], url: UNSPLASH(PHOTOS.rice, 600, 400) },
  { tags: ['prawn', 'egg'], groups: ['biryani-rice'], url: UNSPLASH(PHOTOS.biryani, 600, 400) },
  { tags: ['butter', 'chicken', 'chicken', 'curry'], groups: ['curry-thali'], url: UNSPLASH(PHOTOS.butterChicken, 600, 400) },
  { tags: ['paneer', 'tikka', 'masala', 'kadai', 'palak', 'kofta', 'malai'], groups: ['curry-thali'], url: UNSPLASH(PHOTOS.paneer, 600, 400) },
  { tags: ['dal', 'rajma', 'chole', 'bhature'], groups: ['curry-thali', 'bread-breakfast'], url: UNSPLASH(PHOTOS.curry, 600, 400) },
  { tags: ['fish', 'mutton', 'rogan'], groups: ['curry-thali'], url: UNSPLASH(PHOTOS.fish, 600, 400) },
  { tags: ['egg', 'aloo', 'gobi', 'veg', 'kolhapuri', 'mixed'], groups: ['curry-thali'], url: UNSPLASH(PHOTOS.thali, 600, 400) },
  { tags: ['pizza', 'margherita', 'pepperoni', 'hawaiian', 'farmhouse', 'supreme'], groups: ['pizza-pasta'], url: UNSPLASH(PHOTOS.pizza, 600, 400) },
  { tags: ['pizza', 'bbq', 'cheese', 'paneer'], groups: ['pizza-pasta'], url: UNSPLASH(PHOTOS.pizza2, 600, 400) },
  { tags: ['spaghetti', 'penne', 'fettuccine', 'lasagna', 'pasta', 'mac', 'pesto'], groups: ['pizza-pasta'], url: UNSPLASH(PHOTOS.pasta, 600, 400) },
  { tags: ['arrabbiata', 'alfredo'], groups: ['pizza-pasta'], url: UNSPLASH(PHOTOS.pasta2, 600, 400) },
  { tags: ['garlic', 'bread', 'cheesy', 'sticks'], groups: ['pizza-pasta'], url: UNSPLASH(PHOTOS.bread, 600, 400) },
  { tags: ['burger', 'patty', 'cheeseburger', 'veggie', 'mushroom', 'bacon'], groups: ['burger-fast'], url: UNSPLASH(PHOTOS.burger, 600, 400) },
  { tags: ['burger', 'chicken', 'zinger', 'paneer'], groups: ['burger-fast'], url: UNSPLASH(PHOTOS.burger2, 600, 400) },
  { tags: ['fries', 'wedges', 'rings', 'peri'], groups: ['burger-fast', 'snacks-street'], url: UNSPLASH(PHOTOS.fries, 600, 400) },
  { tags: ['nuggets', 'hot', 'dog', 'nachos', 'wrap'], groups: ['burger-fast'], url: UNSPLASH(PHOTOS.burger, 600, 400) },
  { tags: ['samosa', 'tikki', 'pakora', 'puri', 'bhel', 'sev', 'dahi', 'chaat'], groups: ['snacks-street'], url: UNSPLASH(PHOTOS.street, 600, 400) },
  { tags: ['vada', 'pav'], groups: ['snacks-street'], url: UNSPLASH(PHOTOS.burger2, 600, 400) },
  { tags: ['spring', 'manchurian', 'chilli', 'honey', 'potato'], groups: ['snacks-street'], url: UNSPLASH(PHOTOS.wrap, 600, 400) },
  { tags: ['momo', 'dumpling'], groups: ['snacks-street'], url: UNSPLASH(PHOTOS.wrap, 600, 400) },
  { tags: ['tikka'], groups: ['snacks-street', 'curry-thali'], url: UNSPLASH(PHOTOS.butterChicken, 600, 400) },
  { tags: ['gulab', 'jamun', 'rasgulla', 'rasmalai', 'jalebi', 'kheer', 'halwa'], groups: ['dessert'], url: UNSPLASH(PHOTOS.dessert, 600, 400) },
  { tags: ['kulfi', 'ice', 'cream', 'sundae'], groups: ['dessert'], url: UNSPLASH(PHOTOS.icecream, 600, 400) },
  { tags: ['brownie', 'chocolate', 'lava', 'cake', 'cheesecake', 'tiramisu'], groups: ['dessert'], url: UNSPLASH(PHOTOS.cake, 600, 400) },
  { tags: ['donut', 'cupcake', 'pastry'], groups: ['dessert'], url: UNSPLASH(PHOTOS.dessert, 600, 400) },
  { tags: ['chai', 'tea', 'masala'], groups: ['beverage'], url: UNSPLASH(PHOTOS.tea, 600, 400) },
  { tags: ['coffee', 'cappuccino', 'filter', 'cold'], groups: ['beverage'], url: UNSPLASH(PHOTOS.coffee, 600, 400) },
  { tags: ['lassi', 'mango', 'sweet', 'salted'], groups: ['beverage'], url: UNSPLASH(PHOTOS.drinks, 600, 400) },
  { tags: ['juice', 'smoothie', 'lime', 'soda', 'watermelon', 'orange', 'coconut', 'iced'], groups: ['beverage'], url: UNSPLASH(PHOTOS.drinks, 600, 400) },
  { tags: ['milkshake', 'hot', 'chocolate', 'soft', 'mineral', 'water'], groups: ['beverage'], url: UNSPLASH(PHOTOS.coffee, 600, 400) },
  { tags: ['salad', 'caesar', 'greek', 'green', 'sprouts', 'tuna'], groups: ['salad-healthy'], url: UNSPLASH(PHOTOS.salad, 600, 400) },
  { tags: ['bowl', 'buddha', 'quinoa', 'falafel', 'mexican', 'bean'], groups: ['salad-healthy'], url: UNSPLASH(PHOTOS.bowl, 600, 400) },
  { tags: ['fruit'], groups: ['salad-healthy'], url: UNSPLASH(PHOTOS.salad, 600, 400) },
  { tags: ['avocado', 'toast', 'bagel', 'wrap', 'veggie', 'cottage', 'cheese'], groups: ['salad-healthy', 'bread-breakfast'], url: UNSPLASH(PHOTOS.bowl, 600, 400) },
  { tags: ['dosa', 'idli', 'vada', 'sambar'], groups: ['bread-breakfast'], url: UNSPLASH(PHOTOS.dosa, 600, 400) },
  { tags: ['poha', 'upma', 'paratha', 'chole'], groups: ['bread-breakfast'], url: UNSPLASH(PHOTOS.breakfast, 600, 400) },
  { tags: ['pancake', 'waffle', 'french', 'toast', 'egg', 'benedict', 'omelette', 'scrambled', 'granola', 'yogurt'], groups: ['bread-breakfast'], url: UNSPLASH(PHOTOS.breakfast, 600, 400) },
];

const AGENT_PHOTOS = [
  UNSPLASH(PHOTOS.portrait1, 400, 400),
  UNSPLASH(PHOTOS.portrait2, 400, 400),
  UNSPLASH(PHOTOS.portrait3, 400, 400),
  UNSPLASH(PHOTOS.portrait4, 400, 400),
  UNSPLASH(PHOTOS.portrait5, 400, 400),
];

function normalizeWords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function getGroupForTemplate(template) {
  return TEMPLATE_GROUP[template.name] || 'biryani-rice';
}

function getCategoryImageUrl(template) {
  const group = getGroupForTemplate(template);
  return CATEGORY_IMAGES[group] || CATEGORY_IMAGES['biryani-rice'];
}

function scoreItemEntry(entry, words, group) {
  let score = 0;
  if (entry.groups?.includes(group)) score += 2;
  const tagStr = entry.tags.join(' ');
  for (const word of words) {
    if (tagStr.includes(word)) score += 4;
  }
  for (const tag of entry.tags) {
    if (words.some((w) => w.includes(tag) || tag.includes(w))) score += 2;
  }
  return score;
}

function getItemImageUrl(itemName, template, categoryImageUrl) {
  const group = getGroupForTemplate(template);
  const words = normalizeWords(itemName);
  let best = { score: 0, url: null };
  for (const entry of ITEM_IMAGES) {
    const score = scoreItemEntry(entry, words, group);
    if (score > best.score) best = { score, url: entry.url };
  }
  if (best.score > 0 && best.url) return best.url;
  return categoryImageUrl;
}

function getAgentPhotoUrl(index) {
  return AGENT_PHOTOS[index % AGENT_PHOTOS.length];
}

module.exports = {
  getCategoryImageUrl,
  getItemImageUrl,
  getAgentPhotoUrl,
};
