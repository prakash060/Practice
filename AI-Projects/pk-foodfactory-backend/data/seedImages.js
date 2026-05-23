/**
 * Professional food imagery for demo seeding (adminSeed route only).
 * Every category and every item gets a unique Unsplash URL per seed run.
 */

const UNSPLASH = (photoId, w = 800, h = 500) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const PEXELS = (id, w = 800, h = 500) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

/** 120 unique image URLs (Unsplash + Pexels) — no duplicates. */
const PHOTOS = [
  'photo-1563379091339-7ddb5a177f37',
  'photo-1512058564366-3149a7c702e3',
  'photo-1585931643504-8819f9fcdc2e',
  'photo-1546833999-b9f581a1996d',
  'photo-1603894584371-5a1c3a3c5b5e',
  'photo-1631451095760-6729d72c3c0e',
  'photo-1519708227418-c8fd9a32b1a4',
  'photo-1565299624946-b28f40a0ae38',
  'photo-1574071318508-1cdbab1a3966',
  'photo-1621996346565-e3dbc646d9a9',
  'photo-1551183053-bf053a5f9b3c',
  'photo-1568901347235-663d46d40462',
  'photo-1550547660-d9450f859349',
  'photo-1573080496219-bb080dd4f877',
  'photo-1601050691194-9029a8263000',
  'photo-1626700051175-6813293a030f',
  'photo-1551024506-0bccd828d307',
  'photo-1606313564200-e75d5e30476c',
  'photo-1563805042-7684c019e1cb',
  'photo-1546175165-ab582f44eafa',
  'photo-1495474472287-4d716b1b0e0b',
  'photo-1571934811359-5049f0f2757b',
  'photo-1512620343977-1073a0c9a3e4',
  'photo-1546069901-ba9599a7e63c',
  'photo-1525351484163-752f43c18677',
  'photo-1665241855775-06d39e199b0e',
  'photo-1573140247632-f791fd8935b1',
  'photo-1596797038530-2c107229754b',
  'photo-1604908176997-431865558a1d',
  'photo-1589302168068-964664d93a0b',
  'photo-1626074353765-517a5e7a7019',
  'photo-1565958011703-bca9227c7836',
  'photo-1571091718767-18baa5777776',
  'photo-1567620905734-9251d34426a7',
  'photo-1610348728811-92b9b400383b',
  'photo-1488477181941-15db4c9a0b0b',
  'photo-1504674900247-0877df9cc836',
  'photo-1476124369491-e46749c3752a',
  'photo-1517248135467-4c7edcad34c4',
  'photo-1414235077428-338989a2e8c0',
  'photo-1555939594-58d7cb561ad1',
  'photo-1540189549336-e6e99c3679fe',
  'photo-1506084868930-c55a54526161',
  'photo-1565299503810-6e67021b4b0e',
  'photo-1598866598130-3bde950660ec',
  'photo-1600803907087-f26b430d5be7',
  'photo-1623642577868-a76c23c36ec9',
  'photo-1529006557810-274b9b2f0b0b',
  'photo-1606755962773-d324e0a8e5c1',
  'photo-1520072959219-c595d6a8d0b8',
  'photo-1612392062634-5b33021427c2',
  'photo-1513456852971-30c5cce24f8f',
  'photo-1582169296456-0de9dbb6e5c9',
  'photo-1563379926892-05048baf0ad0',
  'photo-1606491956689-2ea7e9a75076',
  'photo-1509440159596-d23508922341',
  'photo-1467003909585-2f8a47729952',
  'photo-1511690743698-d9d85fbd33d4',
  'photo-1551218808-94e2209d0853',
  'photo-1568605114967-8130f367a660',
  'photo-1551782450-17144efb9c50',
  'photo-1560717789-0ac7c58a32ad',
  'photo-1482049016688-2d437e1dd49e',
  'photo-1505253758473-96b7015bc40e',
  'photo-1533777857889-4be7c6861f50',
  'photo-1559056199-641a0ac8b55c',
  'photo-1574489449989-2d8c4b0e3c96',
  'photo-1585518419759-7a1987340719',
  'photo-1547592166-23ac45744acd',
  'photo-1571995019948-ee705886e968',
  'photo-1559339352-11d035aa6528',
  'photo-1600891964092-4316c2880322',
  'photo-1625937286074-9ca39b3ae2e9',
  // Pexels — extra unique slots for item images (also allowed by imageUrl validation)
  PEXELS(1640777),
  PEXELS(376464),
  PEXELS(1279330),
  PEXELS(958545),
  PEXELS(1431335),
  PEXELS(1893556),
  PEXELS(2097090),
  PEXELS(2233348),
  PEXELS(2291367),
  PEXELS(2471177),
  PEXELS(2641886),
  PEXELS(2772532),
  PEXELS(2983101),
  PEXELS(326278),
  PEXELS(3298683),
  PEXELS(3535383),
  PEXELS(361184),
  PEXELS(410648),
  PEXELS(4198370),
  PEXELS(449082),
  PEXELS(4518843),
  PEXELS(5317),
  PEXELS(5938),
  PEXELS(5939),
  PEXELS(594988),
  PEXELS(60616),
  PEXELS(6293300),
  PEXELS(6293315),
  PEXELS(6293322),
  PEXELS(6293330),
  PEXELS(6293357),
  PEXELS(6293375),
  PEXELS(6293390),
  PEXELS(6293406),
  PEXELS(6293417),
  PEXELS(6293430),
  PEXELS(6293446),
  PEXELS(6293458),
  PEXELS(6293472),
  PEXELS(6293485),
  PEXELS(6293498),
  PEXELS(6293510),
  PEXELS(6293523),
  PEXELS(6293536),
  PEXELS(6293549),
  PEXELS(6293562),
  PEXELS(6293575),
  PEXELS(70497),
  PEXELS(725991),
  PEXELS(842571),
  PEXELS(1024358),
  PEXELS(1126728),
  PEXELS(115740),
  PEXELS(1199957),
  PEXELS(1209025),
  PEXELS(1267320),
  PEXELS(1283219),
  PEXELS(1300975),
  PEXELS(1326948),
].map((entry) => (typeof entry === 'string' && entry.startsWith('http') ? entry : UNSPLASH(entry)));

if (new Set(PHOTOS).size !== PHOTOS.length) {
  throw new Error('seedImages: PHOTOS must not contain duplicate image URLs');
}

const CATEGORY_SLOTS = 8;
const GROUP_ORDER = [
  'biryani-rice',
  'curry-thali',
  'pizza-pasta',
  'burger-fast',
  'snacks-street',
  'dessert',
  'beverage',
  'salad-healthy',
  'bread-breakfast',
];

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

const CATEGORY_INDEX_BY_GROUP = Object.fromEntries(
  GROUP_ORDER.map((group, groupIndex) => [
    group,
    Array.from({ length: CATEGORY_SLOTS }, (_, i) => groupIndex * CATEGORY_SLOTS + i),
  ])
);

const ITEM_ROW_DEFS = [
  { groups: ['biryani-rice'], tags: ['biryani', 'chicken', 'hyderabadi'] },
  { groups: ['biryani-rice'], tags: ['biryani', 'mutton', 'lucknowi'] },
  { groups: ['biryani-rice'], tags: ['biryani', 'veg', 'paneer', 'kathal'] },
  { groups: ['biryani-rice'], tags: ['pulao', 'pulav', 'rice'] },
  { groups: ['biryani-rice'], tags: ['jeera', 'steamed', 'rice'] },
  { groups: ['biryani-rice'], tags: ['egg', 'prawn', 'biryani'] },
  { groups: ['biryani-rice'], tags: ['lemon', 'coconut', 'tomato', 'curd'] },
  { groups: ['biryani-rice'], tags: ['kashmiri', 'mushroom', 'tawa'] },
  { groups: ['curry-thali'], tags: ['butter', 'chicken'] },
  { groups: ['curry-thali'], tags: ['paneer', 'tikka', 'masala', 'kadai'] },
  { groups: ['curry-thali'], tags: ['dal', 'tadka', 'makhani'] },
  { groups: ['curry-thali'], tags: ['rajma', 'chole', 'bhature'] },
  { groups: ['curry-thali'], tags: ['fish', 'mutton', 'rogan'] },
  { groups: ['curry-thali'], tags: ['palak', 'kofta', 'malai'] },
  { groups: ['curry-thali'], tags: ['egg', 'aloo', 'gobi', 'kolhapuri', 'mixed'] },
  { groups: ['pizza-pasta'], tags: ['pizza', 'margherita'] },
  { groups: ['pizza-pasta'], tags: ['pizza', 'pepperoni', 'hawaiian'] },
  { groups: ['pizza-pasta'], tags: ['pizza', 'bbq', 'farmhouse', 'supreme', 'cheese'] },
  { groups: ['pizza-pasta'], tags: ['pizza', 'paneer'] },
  { groups: ['pizza-pasta'], tags: ['spaghetti', 'bolognese', 'lasagna'] },
  { groups: ['pizza-pasta'], tags: ['penne', 'arrabbiata', 'fettuccine', 'alfredo'] },
  { groups: ['pizza-pasta'], tags: ['mac', 'cheese', 'pesto'] },
  { groups: ['pizza-pasta'], tags: ['garlic', 'bread', 'sticks'] },
  { groups: ['burger-fast'], tags: ['burger', 'cheeseburger', 'patty', 'double'] },
  { groups: ['burger-fast'], tags: ['burger', 'chicken', 'zinger'] },
  { groups: ['burger-fast'], tags: ['burger', 'veggie', 'paneer'] },
  { groups: ['burger-fast'], tags: ['burger', 'mushroom', 'bacon', 'bbq'] },
  { groups: ['burger-fast'], tags: ['fries', 'wedges', 'rings', 'peri'] },
  { groups: ['burger-fast'], tags: ['nuggets', 'chicken'] },
  { groups: ['burger-fast'], tags: ['hot', 'dog'] },
  { groups: ['burger-fast'], tags: ['nachos', 'wrap', 'chicken'] },
  { groups: ['snacks-street'], tags: ['samosa', 'tikki', 'pakora'] },
  { groups: ['snacks-street'], tags: ['pani', 'puri', 'bhel', 'sev', 'dahi', 'chaat'] },
  { groups: ['snacks-street'], tags: ['vada', 'pav'] },
  { groups: ['snacks-street'], tags: ['spring', 'roll', 'manchurian'] },
  { groups: ['snacks-street'], tags: ['chilli', 'honey', 'potato'] },
  { groups: ['snacks-street'], tags: ['momo', 'dumpling'] },
  { groups: ['snacks-street'], tags: ['tikka', 'paneer', 'chicken'] },
  { groups: ['dessert'], tags: ['gulab', 'jamun', 'rasgulla', 'jalebi'] },
  { groups: ['dessert'], tags: ['rasmalai', 'kheer', 'halwa', 'gajar', 'moong'] },
  { groups: ['dessert'], tags: ['kulfi', 'ice', 'cream', 'sundae'] },
  { groups: ['dessert'], tags: ['brownie', 'chocolate', 'lava', 'cake'] },
  { groups: ['dessert'], tags: ['cheesecake', 'tiramisu', 'cupcake', 'donut', 'pastry'] },
  { groups: ['beverage'], tags: ['chai', 'tea', 'masala', 'filter'] },
  { groups: ['beverage'], tags: ['coffee', 'cappuccino', 'cold'] },
  { groups: ['beverage'], tags: ['lassi', 'mango', 'sweet', 'salted'] },
  { groups: ['beverage'], tags: ['juice', 'smoothie', 'watermelon', 'orange'] },
  { groups: ['beverage'], tags: ['lime', 'soda', 'coconut', 'iced'] },
  { groups: ['beverage'], tags: ['milkshake', 'chocolate', 'hot', 'mineral', 'water', 'soft'] },
  { groups: ['salad-healthy'], tags: ['salad', 'caesar', 'greek', 'green'] },
  { groups: ['salad-healthy'], tags: ['bowl', 'buddha', 'quinoa', 'falafel'] },
  { groups: ['salad-healthy'], tags: ['fruit', 'mexican', 'bean', 'sprouts', 'tuna'] },
  { groups: ['salad-healthy'], tags: ['avocado', 'toast', 'cottage', 'wrap', 'veggie'] },
  { groups: ['bread-breakfast'], tags: ['dosa', 'idli', 'vada', 'sambar'] },
  { groups: ['bread-breakfast'], tags: ['poha', 'upma', 'paratha'] },
  { groups: ['bread-breakfast'], tags: ['pancake', 'waffle', 'french', 'toast'] },
  { groups: ['bread-breakfast'], tags: ['egg', 'benedict', 'omelette', 'scrambled'] },
  { groups: ['bread-breakfast'], tags: ['granola', 'yogurt', 'bagel', 'avocado', 'chole'] },
];

const ITEM_SLOT_START = GROUP_ORDER.length * CATEGORY_SLOTS;
const ITEM_IMAGE_ROWS = ITEM_ROW_DEFS.map((row, i) => ({
  ...row,
  photoIndex: ITEM_SLOT_START + i,
}));

if (ITEM_SLOT_START + ITEM_IMAGE_ROWS.length > PHOTOS.length) {
  throw new Error('seedImages: not enough PHOTOS for category + item slots');
}

function urlAt(index, w = 800, h = 500) {
  const url = PHOTOS[index];
  if (!url) return null;
  return url.replace(/\bw=\d+/, `w=${w}`).replace(/\bh=\d+/, `h=${h}`);
}

const AGENT_PHOTO_IDS = [
  'photo-1507003211169-0b1df722b42d',
  'photo-1494790108377-be9c29b29330',
  'photo-1500648767791-00dcc994a43e',
  'photo-1438761681033-6461ffad8d80',
  'photo-1472099645785-5658abf4ff4e',
  'photo-1534528741775-53994a69daeb',
  'photo-1506794778202-cad84cf45f1d',
  'photo-1544005313-94ddf0286df2',
  'photo-1517841905240-472988babdf9',
  'photo-1539571696357-5a49c00a0b0b',
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

function scoreRow(row, words, group) {
  let score = 0;
  if (row.groups.includes(group)) score += 3;
  const tagStr = row.tags.join(' ');
  for (const word of words) {
    if (tagStr.includes(word)) score += 5;
  }
  for (const tag of row.tags) {
    if (words.some((w) => w.includes(tag) || tag.includes(w))) score += 2;
  }
  return score;
}

function shuffleCopy(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function allPhotoIndices() {
  return Array.from({ length: PHOTOS.length }, (_, i) => i);
}

function createSeedImageAllocator() {
  const usedIndices = new Set();

  function claimIndex(index, w, h) {
    if (index < 0 || index >= PHOTOS.length || usedIndices.has(index)) return null;
    usedIndices.add(index);
    return urlAt(index, w, h);
  }

  function claimFromIndices(indices, w, h) {
    for (const idx of shuffleCopy(indices)) {
      const url = claimIndex(idx, w, h);
      if (url) return url;
    }
    return null;
  }

  function claimAny(w, h) {
    const free = allPhotoIndices().filter((i) => !usedIndices.has(i));
    return claimFromIndices(free, w, h);
  }

  return {
    assignCategoryImage(template) {
      const group = getGroupForTemplate(template);
      const preferred = CATEGORY_INDEX_BY_GROUP[group] || [0, 1, 2];
      return claimFromIndices(preferred, 800, 500) || claimAny(800, 500);
    },

    assignItemImage(itemName, template) {
      const group = getGroupForTemplate(template);
      const words = normalizeWords(itemName);

      const ranked = ITEM_IMAGE_ROWS.map((row) => ({
        row,
        score: scoreRow(row, words, group),
      }))
        .filter((r) => !usedIndices.has(r.row.photoIndex))
        .sort((a, b) => b.score - a.score);

      for (const { row, score } of ranked) {
        if (score <= 0) break;
        const url = claimIndex(row.photoIndex, 600, 400);
        if (url) return url;
      }

      const groupPreferred = ITEM_IMAGE_ROWS.filter((r) => r.groups.includes(group)).map(
        (r) => r.photoIndex
      );
      const fromGroup = claimFromIndices(groupPreferred, 600, 400);
      if (fromGroup) return fromGroup;

      return claimAny(600, 400);
    },
  };
}

function getAgentPhotoUrl(index) {
  return UNSPLASH(AGENT_PHOTO_IDS[index % AGENT_PHOTO_IDS.length], 400, 400);
}

module.exports = {
  createSeedImageAllocator,
  getAgentPhotoUrl,
};
