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

function normalizeIndianPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(digits) ? digits : '';
}

function isEmailValid(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function gatewayError(err, fallback = 'Payment gateway error') {
  const description =
    err?.error?.description ||
    err?.error?.reason ||
    (typeof err?.error === 'string' ? err.error : null) ||
    err?.description ||
    err?.message ||
    fallback;
  const statusCode =
    err?.statusCode === 401 || err?.statusCode === 403 ? 503 : 502;
  const e = new Error(description);
  e.statusCode = statusCode;
  return e;
}

function sanitizeLineItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw badRequest('At least one cart item is required');
  }

  const sanitized = items.map((item, index) => {
    const foodId = String(item.foodId ?? item.id ?? '').trim();
    const name = String(item.name ?? `Item ${index + 1}`).trim();
    const price = Number(item.price);
    const quantity = Math.floor(Number(item.quantity));

    if (!foodId) {
      throw badRequest('Each cart item must have a valid food id');
    }
    if (!Number.isFinite(price) || price <= 0) {
      throw badRequest(`Invalid price for item "${name}"`);
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw badRequest(`Invalid quantity for item "${name}"`);
    }

    return { foodId, name, price, quantity };
  });

  return sanitized;
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
  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    throw badRequest('Invalid user session. Please log in again.');
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw badRequest('A valid order amount is required');
  }

  const lineItems = sanitizeLineItems(items);

  const cd = customerDetails || {};
  if (!isEmailValid(cd.email)) {
    throw badRequest('A valid email is required for payment');
  }
  const normalizedPhone = normalizeIndianPhone(cd.phone);
  if (!normalizedPhone) {
    throw badRequest('A valid 10-digit Indian mobile number is required for payment');
  }
  const sanitizedCustomerDetails = {
    name: cd.name,
    email: String(cd.email).trim(),
    phone: normalizedPhone,
    address: cd.address,
  };

  const { subtotal, deliveryFee, tax, totalAmount } = computeTotals(lineItems);

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw badRequest('Order total could not be calculated');
  }

  if (Math.abs(parsedAmount - totalAmount) > 1) {
    throw badRequest(
      `Amount mismatch: expected ₹${totalAmount}, received ₹${parsedAmount}`
    );
  }

  const amountPaise = Math.round(totalAmount * 100);
  if (amountPaise < 100) {
    throw badRequest('Minimum order amount for online payment is ₹1');
  }

  const options = {
    amount: amountPaise,
    currency: currency || 'INR',
    receipt: `pk_${Date.now()}`,
  };

  let razorpayOrder;
  try {
    razorpayOrder = await getRazorpay().orders.create(options);
  } catch (err) {
    console.error('Razorpay orders.create failed:', err);
    throw gatewayError(err, 'Could not create Razorpay order');
  }

  if (!razorpayOrder?.id) {
    throw gatewayError(
      { message: 'Razorpay did not return an order id' },
      'Could not create Razorpay order'
    );
  }

  const intent = new CheckoutIntent({
    razorpayOrderId: razorpayOrder.id,
    userId,
    items: lineItems,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    customerDetails: sanitizedCustomerDetails,
    status: 'awaiting_payment',
    expiresAt: new Date(Date.now() + INTENT_TTL_MS),
  });

  try {
    await intent.save();
  } catch (err) {
    console.error('CheckoutIntent save failed:', err);
    if (err.name === 'ValidationError') {
      throw badRequest(err.message || 'Invalid checkout data');
    }
    if (err.code === 11000) {
      throw badRequest('Checkout already in progress. Please wait a moment and retry.');
    }
    throw err;
  }

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
  normalizeIndianPhone,
  isEmailValid,
};
