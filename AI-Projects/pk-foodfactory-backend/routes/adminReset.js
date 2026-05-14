const express = require('express');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');
const DeliveryAgent = require('../models/DeliveryAgent');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin, getAdminEmail } = require('../middleware/admin');

const router = express.Router();

/**
 * Returns a Mongo filter that targets every user record EXCEPT the configured
 * admin account and the currently signed-in admin (preserving login access).
 */
function deletableUsersFilter(currentUserId) {
  const adminEmail = (getAdminEmail() || '').toLowerCase();
  const filter = {};
  if (currentUserId) filter._id = { $ne: currentUserId };
  if (adminEmail) filter.email = { $ne: adminEmail };
  return filter;
}

async function clearUsers(currentUserId) {
  const r = await User.deleteMany(deletableUsersFilter(currentUserId));
  return { users: r.deletedCount || 0 };
}

async function clearDeliveryAgents() {
  const r = await DeliveryAgent.deleteMany({});
  return { deliveryAgents: r.deletedCount || 0 };
}

async function clearCategoriesAndItems() {
  // Items must be removed alongside categories so the UI doesn't try to render
  // items whose category was just deleted.
  const items = await FoodItem.deleteMany({});
  const cats = await Category.deleteMany({});
  return { categories: cats.deletedCount || 0, foodItems: items.deletedCount || 0 };
}

async function clearFoodItems() {
  const r = await FoodItem.deleteMany({});
  return { foodItems: r.deletedCount || 0 };
}

async function clearOrders() {
  const r = await Order.deleteMany({});
  return { orders: r.deletedCount || 0 };
}

// GET /api/admin/reset/summary  -> counts before resetting (so the UI can warn)
router.get('/summary', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [categories, foodItems, orders, deliveryAgents, users] = await Promise.all([
      Category.countDocuments({}),
      FoodItem.countDocuments({}),
      Order.countDocuments({}),
      DeliveryAgent.countDocuments({}),
      User.countDocuments(deletableUsersFilter(req.userId)),
    ]);
    return res.json({ categories, foodItems, orders, deliveryAgents, users });
  } catch (err) {
    console.error('Reset summary error:', err);
    return res.status(500).json({ error: 'Failed to load reset summary' });
  }
});

router.post('/delivery-agents', requireAuth, requireAdmin, async (req, res) => {
  try {
    const counts = await clearDeliveryAgents();
    return res.json({ success: true, scope: 'delivery-agents', ...counts });
  } catch (err) {
    console.error('Reset delivery agents error:', err);
    return res.status(500).json({ error: 'Failed to reset delivery agents' });
  }
});

router.post('/categories', requireAuth, requireAdmin, async (req, res) => {
  try {
    const counts = await clearCategoriesAndItems();
    return res.json({ success: true, scope: 'categories', ...counts });
  } catch (err) {
    console.error('Reset categories error:', err);
    return res.status(500).json({ error: 'Failed to reset categories' });
  }
});

router.post('/food-items', requireAuth, requireAdmin, async (req, res) => {
  try {
    const counts = await clearFoodItems();
    return res.json({ success: true, scope: 'food-items', ...counts });
  } catch (err) {
    console.error('Reset food items error:', err);
    return res.status(500).json({ error: 'Failed to reset food items' });
  }
});

router.post('/orders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const counts = await clearOrders();
    return res.json({ success: true, scope: 'orders', ...counts });
  } catch (err) {
    console.error('Reset orders error:', err);
    return res.status(500).json({ error: 'Failed to reset orders' });
  }
});

router.post('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const counts = await clearUsers(req.userId);
    return res.json({ success: true, scope: 'users', ...counts });
  } catch (err) {
    console.error('Reset users error:', err);
    return res.status(500).json({ error: 'Failed to reset users' });
  }
});

router.post('/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Require an explicit confirmation phrase so this destructive endpoint can't
    // be triggered by a stray click on a stale tab.
    const confirm = String(req.body?.confirm || '').trim().toUpperCase();
    if (confirm !== 'RESET') {
      return res.status(400).json({
        error: 'Confirmation required. Send { "confirm": "RESET" } in the request body.',
      });
    }
    const a = await clearDeliveryAgents();
    const b = await clearCategoriesAndItems();
    const c = await clearOrders();
    const d = await clearUsers(req.userId);
    return res.json({ success: true, scope: 'all', ...a, ...b, ...c, ...d });
  } catch (err) {
    console.error('Reset all error:', err);
    return res.status(500).json({ error: 'Failed to reset everything' });
  }
});

module.exports = router;
