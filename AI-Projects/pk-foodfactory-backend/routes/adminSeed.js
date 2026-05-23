const express = require('express');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');
const { hashPasscode } = require('../models/DeliveryAgent');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { CATEGORY_POOL } = require('../data/seedPool');
const {
  AGENT_POOL,
  DEMO_AGENT_PASSCODE,
  NUM_AGENTS_TO_SEED,
} = require('../data/agentSeedPool');
const { createSeedImageAllocator, getAgentPhotoUrl } = require('../data/seedImages');

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

    const imageAllocator = createSeedImageAllocator();
    const summary = [];
    let totalItemsCreated = 0;

    for (const tpl of templates) {
      const categoryImageUrl = imageAllocator.assignCategoryImage(tpl);
      const createdCategory = await Category.create({
        name: tpl.name,
        label: tpl.label || tpl.name,
        emoji: tpl.emoji || '🍽️',
        accent: tpl.accent || '#6b5ef7',
        imageUrl: categoryImageUrl,
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
        imageUrl: imageAllocator.assignItemImage(it.name, tpl),
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

// POST /api/admin/seed/agents
// Wipes existing delivery agents, unassigns them from orders, then seeds 5 demo
// riders with a shared login passcode (1234). Admin-only.
router.post('/agents', requireAuth, requireAdmin, async (req, res) => {
  try {
    await DeliveryAgent.deleteMany({});
    await Order.updateMany(
      { deliveryAgentId: { $ne: null } },
      {
        $set: {
          deliveryAgentId: null,
          deliveryStatus: 'unassigned',
          deliveryNotes: '',
        },
      }
    );

    const templates = shuffle(AGENT_POOL).slice(0, NUM_AGENTS_TO_SEED);
    const passcodeHash = await hashPasscode(DEMO_AGENT_PASSCODE);

    const summary = [];
    for (let i = 0; i < templates.length; i += 1) {
      const tpl = templates[i];
      const created = await DeliveryAgent.create({
        name: tpl.name,
        phone: tpl.phone,
        email: tpl.email || '',
        vehicleType: tpl.vehicleType || 'Bike',
        vehicleNumber: tpl.vehicleNumber || '',
        licenseNumber: tpl.licenseNumber || '',
        address: tpl.address || '',
        photoUrl: getAgentPhotoUrl(i),
        status: 'active',
        notes: tpl.notes || '',
        passcodeHash,
        createdBy: req.userId,
      });
      summary.push({
        id: created._id.toString(),
        name: created.name,
        phone: created.phone,
        vehicleType: created.vehicleType,
      });
    }

    return res.json({
      success: true,
      agentsCreated: summary.length,
      demoPasscode: DEMO_AGENT_PASSCODE,
      agents: summary,
    });
  } catch (err) {
    console.error('Seed demo agents error:', err);
    return res.status(500).json({ error: 'Failed to generate demo delivery agents' });
  }
});

module.exports = router;
