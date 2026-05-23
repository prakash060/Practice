const express = require('express');
const Order = require('../models/Order');
const DeliveryAgent = require('../models/DeliveryAgent');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { shapeOrder, AGENT_PUBLIC_FIELDS } = require('../utils/orderShape');
const { assignAgentToOrder } = require('../services/deliveryAssignment');

const router = express.Router();

const DELIVERY_STATUSES = [
  'unassigned',
  'assigned',
  'out_for_delivery',
  'delivered',
  'not_delivered',
];

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

router.use(requireAuth, requireAdmin);

// GET /api/admin/orders — all orders for admin dashboard
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'deliveryAgentId', select: AGENT_PUBLIC_FIELDS });
    return res.json(orders.map(shapeOrder));
  } catch (error) {
    console.error('Admin list orders error:', error);
    return res.status(500).json({ error: 'Failed to get orders' });
  }
});

// PATCH /api/admin/orders/:orderId/delivery — update payment + delivery fields
router.patch('/:orderId/delivery', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const {
      deliveryStatus,
      deliveryAgentId,
      deliveryNotes,
      paymentStatus,
      autoAssign,
    } = req.body || {};

    if (typeof paymentStatus === 'string') {
      const ps = paymentStatus.trim();
      if (!PAYMENT_STATUSES.includes(ps)) {
        return res.status(400).json({
          error: `paymentStatus must be one of: ${PAYMENT_STATUSES.join(', ')}`,
        });
      }
      order.paymentStatus = ps;
    }

    if (autoAssign === true) {
      await assignAgentToOrder(order);
    }

    if (deliveryAgentId !== undefined) {
      if (deliveryAgentId === null || deliveryAgentId === '') {
        order.deliveryAgentId = null;
      } else {
        const agent = await DeliveryAgent.findById(deliveryAgentId);
        if (!agent) {
          return res.status(400).json({ error: 'Delivery agent not found' });
        }
        order.deliveryAgentId = agent._id;
        if (
          deliveryStatus === undefined &&
          order.deliveryStatus === 'unassigned'
        ) {
          order.deliveryStatus = 'assigned';
          order.deliveryStatusUpdatedAt = new Date();
        }
      }
    }

    if (typeof deliveryStatus === 'string') {
      const ds = deliveryStatus.trim();
      if (!DELIVERY_STATUSES.includes(ds)) {
        return res.status(400).json({
          error: `deliveryStatus must be one of: ${DELIVERY_STATUSES.join(', ')}`,
        });
      }

      if (ds === 'unassigned') {
        order.deliveryAgentId = null;
        order.deliveryStatus = ds;
        order.deliveryStatusUpdatedAt = new Date();
      } else if (
        (ds === 'assigned' || ds === 'out_for_delivery') &&
        !order.deliveryAgentId
      ) {
        await assignAgentToOrder(order);
        if (!order.deliveryAgentId) {
          return res.status(409).json({
            error: 'No active delivery agents available. Onboard a rider first.',
          });
        }
        order.deliveryStatus = ds;
        order.deliveryStatusUpdatedAt = new Date();
      } else {
        order.deliveryStatus = ds;
        order.deliveryStatusUpdatedAt = new Date();
      }
    }

    if (typeof deliveryNotes === 'string') {
      order.deliveryNotes = deliveryNotes.trim().slice(0, 500);
    }

    await order.save();
    await order.populate({ path: 'deliveryAgentId', select: AGENT_PUBLIC_FIELDS });
    return res.json(shapeOrder(order));
  } catch (error) {
    console.error('Admin update order delivery error:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
