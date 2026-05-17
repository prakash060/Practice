const express = require('express');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');
const {
  initiateCheckout,
  finalizeCheckoutPayment,
} = require('../services/checkoutOrder');

const router = express.Router();

// Legacy path — use POST /api/orders/checkout instead
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const { amount, currency, items, customerDetails } = req.body;
    const result = await initiateCheckout({
      amount,
      currency,
      items,
      customerDetails,
      userId: req.userId,
    });
    res.json(result);
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
    res.status(500).json({ error: 'Failed to initiate checkout' });
  }
});

router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const result = await finalizeCheckoutPayment({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      userId: req.userId,
    });

    res.json({
      success: true,
      orderId: result.orderId,
      paymentId: result.paymentId,
      message: result.message,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    if (error.statusCode === 403) {
      return res.status(403).json({ error: error.message });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    if (error.statusCode === 503) {
      return res.status(503).json({ error: error.message });
    }
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      items: order.items,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

module.exports = router;
