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

/**
 * Find the next free name by appending " #2", " #3"… until the predicate
 * reports no collision. Used so we never fail on existing names (per the
 * "auto-suffix" duplicate policy).
 */
async function uniqueName(base, isTaken) {
  if (!(await isTaken(base))) return base;
  let n = 2;
  while (n < 1000) {
    const candidate = `${base} #${n}`;
    if (!(await isTaken(candidate))) return candidate;
    n += 1;
  }
  return `${base} #${Date.now()}`;
}

// POST /api/admin/seed/random
// Creates 5 random categories with 10–15 items each. Admin-only.
router.post('/random', requireAuth, requireAdmin, async (req, res) => {
  try {
    const templates = shuffle(CATEGORY_POOL).slice(0, NUM_CATEGORIES);

    const summary = [];
    let totalItemsCreated = 0;

    for (const tpl of templates) {
      const finalCategoryName = await uniqueName(
        tpl.name,
        async (candidate) => Boolean(await Category.findOne({ name: candidate }).lean())
      );

      const createdCategory = await Category.create({
        name: finalCategoryName,
        label: tpl.label || finalCategoryName,
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

      const itemsToInsert = [];
      for (const it of pickedItems) {
        const finalItemName = await uniqueName(it.name, async (candidate) =>
          Boolean(
            await FoodItem.findOne({
              category: createdCategory.name,
              name: candidate,
            }).lean()
          )
        );
        itemsToInsert.push({
          category: createdCategory.name,
          name: finalItemName,
          description: it.description || '',
          price: typeof it.price === 'number' ? it.price : 2,
          imageUrl: null,
          createdBy: req.userId,
        });
      }

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
