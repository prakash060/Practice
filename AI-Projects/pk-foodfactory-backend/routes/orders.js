const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { initiateCheckout } = require('../services/checkoutOrder');

const router = express.Router();

const AGENT_PUBLIC_FIELDS = 'name phone photoUrl vehicleType vehicleNumber';

function shapeOrder(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const agent = obj.deliveryAgentId;
  if (agent && typeof agent === 'object' && agent._id) {
    obj.deliveryAgent = {
      id: agent._id.toString(),
      name: agent.name,
      phone: agent.phone,
      photoUrl: agent.photoUrl || null,
      vehicleType: agent.vehicleType || 'Bike',
      vehicleNumber: agent.vehicleNumber || '',
    };
    obj.deliveryAgentId = agent._id.toString();
  } else if (agent) {
    obj.deliveryAgentId = String(agent);
    obj.deliveryAgent = null;
  } else {
    obj.deliveryAgent = null;
  }
  return obj;
}

async function createCheckoutOrderForUser(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, currency, items, customerDetails: cd } = req.body;
    const customerDetails = {
      name: (cd && cd.name && String(cd.name).trim()) || user.name,
      email: (cd && cd.email && String(cd.email).trim()) || user.email,
      phone: (cd && cd.phone && String(cd.phone).trim()) || user.phone,
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

// Get all orders (admin endpoint)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'deliveryAgentId', select: AGENT_PUBLIC_FIELDS });
    res.json(orders.map(shapeOrder));
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate({ path: 'deliveryAgentId', select: AGENT_PUBLIC_FIELDS });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(shapeOrder(order));
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Update order status (admin endpoint)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { paymentStatus: status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;