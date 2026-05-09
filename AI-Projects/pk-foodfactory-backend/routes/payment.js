const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const { createCheckoutOrder, isDummyPaymentMode } = require('../services/checkoutOrder');

const router = express.Router();

// Create order (legacy path; same behavior as POST /api/orders without user linkage)
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, items, customerDetails } = req.body;
    const result = await createCheckoutOrder({
      amount,
      currency,
      items,
      customerDetails,
      userId: null,
    });
    res.json(result);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({ error: 'razorpay_order_id is required' });
    }

    /*
     * TEMPORARY: DUMMY_PAYMENT_MODE skips HMAC verification and marks the order paid.
     * Remove or set DUMMY_PAYMENT_MODE=false before production; restore real signature
     * checks only for live Razorpay payments.
     */
    if (isDummyPaymentMode()) {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id || 'dummy_payment_id',
          paymentStatus: 'paid',
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.json({
        success: true,
        orderId: order.orderId,
        paymentId: razorpay_payment_id || 'dummy_payment_id',
        message: 'Payment verified successfully (dummy mode)',
      });
    }

    // Production: verify Razorpay signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        paymentStatus: 'paid',
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      orderId: order.orderId,
      paymentId: razorpay_payment_id,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Webhook handler
router.post('/webhook', (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    console.log('Webhook received:', event);

    if (event === 'payment.captured') {
      // Payment was successfully captured
      Order.findOneAndUpdate(
        { razorpayOrderId: paymentEntity.order_id },
        {
          paymentId: paymentEntity.id,
          paymentStatus: 'paid',
          updatedAt: new Date()
        }
      ).exec();
    } else if (event === 'payment.failed') {
      // Payment failed
      Order.findOneAndUpdate(
        { razorpayOrderId: paymentEntity.order_id },
        {
          paymentStatus: 'failed',
          updatedAt: new Date()
        }
      ).exec();
    }

    res.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

// Get order status
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
      items: order.items
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

module.exports = router;