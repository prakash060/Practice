const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin, isAdminEmail } = require('../middleware/admin');
const { shapeOrder, AGENT_PUBLIC_FIELDS } = require('../utils/orderShape');
const {
  initiateCheckout,
  normalizeIndianPhone,
  isEmailValid,
} = require('../services/checkoutOrder');

const router = express.Router();

async function createCheckoutOrderForUser(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, currency, items, customerDetails: cd } = req.body;
    const email =
      (cd && cd.email && String(cd.email).trim()) || user.email || '';
    const phoneRaw =
      (cd && cd.phone && String(cd.phone).trim()) || user.phone || '';
    const phone = normalizeIndianPhone(phoneRaw);

    if (!isEmailValid(email)) {
      return res.status(400).json({
        error: 'A valid email is required. Update your profile and try again.',
      });
    }
    if (!phone) {
      return res.status(400).json({
        error:
          'A valid 10-digit Indian mobile number is required. Update your profile and try again.',
      });
    }

    const customerDetails = {
      name: (cd && cd.name && String(cd.name).trim()) || user.name,
      email,
      phone,
      address: (cd && cd.address && String(cd.address).trim()) || user.address,
    };

    const result = await initiateCheckout({
      amount,
      currency,
      items,
      customerDetails,
      userId: req.userId,
    });

    return res.json(result);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    if (error.statusCode === 502) {
      return res.status(502).json({ error: error.message });
    }
    if (error.statusCode === 503) {
      return res.status(503).json({ error: error.message });
    }
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Failed to initiate checkout' });
  }
}

// Explicit path avoids any hosting/proxy quirks with POST "/" on a sub-router.
// Create checkout order (Razorpay + DB); requires login — links order to user
router.post('/checkout', requireAuth, createCheckoutOrderForUser);

// Back-compat: some clients may still POST /api/orders
router.post('/', requireAuth, createCheckoutOrderForUser);

// My orders (current user)
router.get('/my', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate({ path: 'deliveryAgentId', select: AGENT_PUBLIC_FIELDS });
    return res.json(orders.map(shapeOrder));
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get order by ID (owner or admin)
router.get('/:orderId', requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate({ path: 'deliveryAgentId', select: AGENT_PUBLIC_FIELDS });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const user = await User.findById(req.userId).select('email');
    const isOwner =
      order.userId && String(order.userId) === String(req.userId);
    const isAdmin = user && isAdminEmail(user.email);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(shapeOrder(order));
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ error: 'Failed to get order' });
  }
});

// Update payment status (admin only; prefer PATCH /api/admin/orders/:id/delivery)
router.put('/:orderId/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'paid', 'failed', 'refunded'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${allowed.join(', ')}`,
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { paymentStatus: status, updatedAt: new Date() },
      { new: true }
    )
      .populate({ path: 'deliveryAgentId', select: AGENT_PUBLIC_FIELDS });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json(shapeOrder(order));
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;