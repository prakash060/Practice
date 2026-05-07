const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', items, customerDetails } = req.body;

    // Validate required fields
    if (!amount || !items || items.length === 0) {
      return res.status(400).json({ error: 'Amount and items are required' });
    }

    // Calculate amounts
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50;
    const tax = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + deliveryFee + tax;

    // Verify amount matches calculation
    if (Math.abs(amount - totalAmount) > 1) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create order in database
    const order = new Order({
      orderId: `PK${Date.now()}`,
      items,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      customerDetails,
      paymentStatus: 'pending'
    });

    await order.save();

    res.json({
      orderId: order.orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update order status
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        paymentStatus: 'paid',
        updatedAt: new Date()
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
      message: 'Payment verified successfully'
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