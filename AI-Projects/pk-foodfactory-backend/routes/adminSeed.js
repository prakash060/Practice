const express = require('express');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { CATEGORY_POOL } = require('../data/seedPool');

const router = express.Router();

const NUM_CATEGORIES = 5;
const MIN_ITEMS_PER_CATEGORY = 10;
const MAX_ITEMS_PER_CATEGORY = 15;
const MIN_ITEM_PRICE = 1;
const MAX_ITEM_PRICE = 2;

function shuffle(arr) {
  // Fisher–Yates; mutates a copy, leaves the source pool untouched.
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random price in [MIN_ITEM_PRICE, MAX_ITEM_PRICE] rounded to 2 decimals. */
function randomPrice() {
  const raw = MIN_ITEM_PRICE + Math.random() * (MAX_ITEM_PRICE - MIN_ITEM_PRICE);
  return Math.round(raw * 100) / 100;
}

// POST /api/admin/seed/random
// Wipes existing categories + food items (admin owns the menu data either way)
// and reseeds with 5 random categories of 10–15 items each. Items are priced
// in [1, 2] (₹) with 2-decimal precision. Admin-only.
router.post('/random', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Step 1: wipe existing menu data so we always start from a clean slate.
    // Items must be removed before/with categories so the UI never tries to
    // render orphaned items.
    await FoodItem.deleteMany({});
    await Category.deleteMany({});

    // Step 2: pick 5 random category templates.
    const templates = shuffle(CATEGORY_POOL).slice(0, NUM_CATEGORIES);

    const summary = [];
    let totalItemsCreated = 0;

    for (const tpl of templates) {
      const createdCategory = await Category.create({
        name: tpl.name,
        label: tpl.label || tpl.name,
        emoji: tpl.emoji || '🍽️',
        accent: tpl.accent || '#6b5ef7',
        imageUrl: null,
        createdBy: req.userId,
      });

      const desiredItemCount = Math.min(
        randomIntInclusive(MIN_ITEMS_PER_CATEGORY, MAX_ITEMS_PER_CATEGORY),
        tpl.items.length
      );
      const pickedItems = shuffle(tpl.items).slice(0, desiredItemCount);

      const itemsToInsert = pickedItems.map((it) => ({
        category: createdCategory.name,
        name: it.name,
        description: it.description || '',
        price: randomPrice(),
        imageUrl: null,
        createdBy: req.userId,
      }));

      if (itemsToInsert.length) {
        await FoodItem.insertMany(itemsToInsert);
      }

      totalItemsCreated += itemsToInsert.length;
      summary.push({ name: createdCategory.name, itemCount: itemsToInsert.length });
    }

    return res.json({
      success: true,
      categoriesCreated: summary.length,
      itemsCreated: totalItemsCreated,
      categories: summary,
    });
  } catch (err) {
    console.error('Seed random data error:', err);
    return res.status(500).json({ error: 'Failed to generate random demo data' });
  }
});

module.exports = router;
