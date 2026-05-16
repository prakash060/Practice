const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const CheckoutIntent = require('../models/CheckoutIntent');
const { assignAgentToOrder } = require('./deliveryAssignment');

const INTENT_TTL_MS = 30 * 60 * 1000;

let razorpay = null;

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function notFound(message) {
  const err = new Error(message || 'Checkout session not found');
  err.statusCode = 404;
  return err;
}

function forbidden(message) {
  const err = new Error(message || 'Forbidden');
  err.statusCode = 403;
  return err;
}

function serviceUnavailable(message) {
  const err = new Error(message || 'Payment gateway is not configured');
  err.statusCode = 503;
  return err;
}

function isPlaceholderKey(value) {
  if (!value || typeof value !== 'string') return true;
  const v = value.trim().toLowerCase();
  return (
    v.length === 0 ||
    v.includes('your_razorpay') ||
    v === 'dummy_key_id'
  );
}

function assertRazorpayConfigured() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (isPlaceholderKey(keyId) || isPlaceholderKey(keySecret)) {
    throw serviceUnavailable(
      'Payment gateway is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
  }
}

function getRazorpay() {
  assertRazorpayConfigured();
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID.trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
    });
  }
  return razorpay;
}

function computeTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + deliveryFee + tax;
  return { subtotal, deliveryFee, tax, totalAmount };
}

function verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const sign = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET.trim())
    .update(sign)
    .digest('hex');
  return razorpaySignature === expectedSign;
}

async function createOrderFromIntent(intent, paymentId) {
  const orderPayload = {
    orderId: `PK${Date.now()}`,
    userId: intent.userId,
    items: intent.items,
    subtotal: intent.subtotal,
    deliveryFee: intent.deliveryFee,
    tax: intent.tax,
    totalAmount: intent.totalAmount,
    razorpayOrderId: intent.razorpayOrderId,
    paymentId,
    paymentStatus: 'paid',
    customerDetails: intent.customerDetails || {},
  };

  const order = new Order(orderPayload);
  await order.save();

  try {
    await assignAgentToOrder(order);
  } catch (assignErr) {
    console.error('Auto-assign delivery agent failed:', assignErr.message || assignErr);
  }

  intent.status = 'completed';
  intent.orderId = order.orderId;
  intent.paymentId = paymentId;
  await intent.save();

  return order;
}

/**
 * Validates cart, creates Razorpay order + CheckoutIntent (no Order until payment succeeds).
 */
async function initiateCheckout({
  amount,
  currency = 'INR',
  items,
  customerDetails,
  userId,
}) {
  if (!userId) {
    throw badRequest('User authentication is required for checkout');
  }
  if (!amount || !items || items.length === 0) {
    throw badRequest('Amount and items are required');
  }

  const { subtotal, deliveryFee, tax, totalAmount } = computeTotals(items);

  if (Math.abs(amount - totalAmount) > 1) {
    throw badRequest('Amount mismatch');
  }

  const options = {
    amount: Math.round(totalAmount * 100),
    currency,
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1,
  };

  const razorpayOrder = await getRazorpay().orders.create(options);

  const intent = new CheckoutIntent({
    razorpayOrderId: razorpayOrder.id,
    userId,
    items,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    customerDetails: customerDetails || {},
    status: 'awaiting_payment',
    expiresAt: new Date(Date.now() + INTENT_TTL_MS),
  });
  await intent.save();

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID.trim(),
  };
}

/**
 * Verifies Razorpay payment signature and creates Order on first success (idempotent).
 */
async function finalizeCheckoutPayment({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  userId,
}) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw badRequest('razorpay_order_id, razorpay_payment_id, and razorpay_signature are required');
  }

  assertRazorpayConfigured();

  if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    throw badRequest('Invalid signature');
  }

  const intent = await CheckoutIntent.findOne({ razorpayOrderId });
  if (!intent) {
    throw notFound('Checkout session not found');
  }

  if (String(intent.userId) !== String(userId)) {
    throw forbidden('This checkout session does not belong to the current user');
  }

  if (intent.status === 'completed' && intent.orderId) {
    return {
      orderId: intent.orderId,
      paymentId: intent.paymentId || razorpayPaymentId,
      message: 'Payment verified successfully',
    };
  }

  if (intent.status === 'failed') {
    throw badRequest('Payment failed for this checkout session');
  }

  if (intent.expiresAt && intent.expiresAt < new Date()) {
    throw badRequest('Checkout session has expired. Please start checkout again.');
  }

  const order = await createOrderFromIntent(intent, razorpayPaymentId);

  return {
    orderId: order.orderId,
    paymentId: razorpayPaymentId,
    message: 'Payment verified successfully',
  };
}

/**
 * Finalizes checkout from a trusted Razorpay webhook (signature verified on raw body).
 */
async function finalizeCheckoutPaymentFromWebhook(razorpayOrderId, razorpayPaymentId) {
  const intent = await CheckoutIntent.findOne({ razorpayOrderId });
  if (!intent) {
    console.warn('Webhook: no checkout intent for order', razorpayOrderId);
    return null;
  }

  if (intent.status === 'completed' && intent.orderId) {
    return { orderId: intent.orderId, paymentId: intent.paymentId || razorpayPaymentId };
  }

  if (intent.expiresAt && intent.expiresAt < new Date()) {
    console.warn('Webhook: checkout intent expired', razorpayOrderId);
    return null;
  }

  const order = await createOrderFromIntent(intent, razorpayPaymentId);
  return { orderId: order.orderId, paymentId: razorpayPaymentId };
}

async function markCheckoutIntentFailed(razorpayOrderId) {
  await CheckoutIntent.findOneAndUpdate(
    { razorpayOrderId, status: 'awaiting_payment' },
    { status: 'failed', updatedAt: new Date() }
  );
}

function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || secret.includes('your_webhook')) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
    return false;
  }
  const expectedSignature = crypto
    .createHmac('sha256', secret.trim())
    .update(rawBody)
    .digest('hex');
  return signature === expectedSignature;
}

async function handleRazorpayWebhook(rawBody, signatureHeader) {
  if (!verifyWebhookSignature(rawBody, signatureHeader)) {
    const err = new Error('Invalid signature');
    err.statusCode = 400;
    throw err;
  }

  const body = JSON.parse(rawBody.toString('utf8'));
  const event = body.event;
  const paymentEntity = body.payload?.payment?.entity;

  if (!paymentEntity?.order_id) {
    return { status: 'ignored' };
  }

  const razorpayOrderId = paymentEntity.order_id;

  if (event === 'payment.captured') {
    await finalizeCheckoutPaymentFromWebhook(razorpayOrderId, paymentEntity.id);
  } else if (event === 'payment.failed') {
    await markCheckoutIntentFailed(razorpayOrderId);
  }

  return { status: 'ok', event };
}

module.exports = {
  initiateCheckout,
  finalizeCheckoutPayment,
  handleRazorpayWebhook,
  assertRazorpayConfigured,
  isPlaceholderKey,
};
