const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const CheckoutIntent = require('../models/CheckoutIntent');
const { assignAgentToOrder } = require('./deliveryAssignment');

const INTENT_TTL_MS = 30 * 60 * 1000;
const QR_TTL_MS = 15 * 60 * 1000;

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

function getRazorpayKeyMode(keyId) {
  const v = (keyId || '').trim();
  if (v.startsWith('rzp_test_')) return 'test';
  if (v.startsWith('rzp_live_')) return 'live';
  return 'unknown';
}

function assertRazorpayConfigured() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (isPlaceholderKey(keyId) || isPlaceholderKey(keySecret)) {
    throw serviceUnavailable(
      'Payment gateway is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the server environment.'
    );
  }
  if (getRazorpayKeyMode(keyId) === 'unknown') {
    throw serviceUnavailable(
      'RAZORPAY_KEY_ID has an unexpected format. It must start with "rzp_test_" or "rzp_live_". Re-copy it from the Razorpay Dashboard.'
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
  const rawDescription =
    (err && err.error && err.error.description) ||
    (err && err.error && err.error.reason) ||
    (err && typeof err.error === 'string' ? err.error : null) ||
    (err && err.description) ||
    (err && err.message) ||
    fallback;

  const upstreamStatus = err && err.statusCode;
  const isAuthFailure =
    upstreamStatus === 401 ||
    upstreamStatus === 403 ||
    /authentication failed/i.test(String(rawDescription));

  let message = rawDescription;
  if (isAuthFailure) {
    const mode = getRazorpayKeyMode(process.env.RAZORPAY_KEY_ID);
    const modeHint =
      mode === 'unknown'
        ? 'The RAZORPAY_KEY_ID does not start with rzp_test_ or rzp_live_.'
        : `Server is configured with a ${mode}-mode key.`;
    message =
      `Razorpay authentication failed. ${modeHint} Verify that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET ` +
      `belong to the same Razorpay account and the same mode (both test, or both live), ` +
      `re-copy them from Razorpay Dashboard → Account & Settings → API Keys, and update them in the server environment.`;
  }

  const statusCode = isAuthFailure ? 503 : 502;
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

function sanitizeLineItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw badRequest('At least one cart item is required');
  }

  return items.map((item, index) => {
    const foodId = String((item && (item.foodId || item.id)) || '').trim();
    const name = String((item && item.name) || `Item ${index + 1}`).trim();
    const price = Number(item && item.price);
    const quantity = Math.floor(Number(item && item.quantity));

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
    razorpayOrderId: intent.razorpayOrderId || undefined,
    razorpayQrCodeId: intent.razorpayQrCodeId || undefined,
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
      `Amount mismatch: expected INR ${totalAmount}, received INR ${parsedAmount}`
    );
  }

  const amountPaise = Math.round(totalAmount * 100);
  if (amountPaise < 100) {
    throw badRequest('Minimum order amount for online payment is INR 1');
  }

  const orderOptions = {
    amount: amountPaise,
    currency: currency || 'INR',
    receipt: `pk_${Date.now()}`,
  };

  let razorpayOrder;
  try {
    razorpayOrder = await getRazorpay().orders.create(orderOptions);
  } catch (err) {
    console.error('Razorpay orders.create failed:', err && (err.error || err.message || err));
    throw gatewayError(err, 'Could not create Razorpay order');
  }

  if (!razorpayOrder || !razorpayOrder.id) {
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
    if (err && err.name === 'ValidationError') {
      throw badRequest(err.message || 'Invalid checkout data');
    }
    if (err && err.code === 11000) {
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

async function markQrCheckoutIntentFailed(razorpayQrCodeId) {
  await CheckoutIntent.findOneAndUpdate(
    { razorpayQrCodeId, status: 'awaiting_payment' },
    { status: 'failed', updatedAt: new Date() }
  );
}

/**
 * Validates cart, mints a Dynamic UPI QR code on Razorpay, persists a CheckoutIntent
 * (kind='qr_code'). Order is created later when payment is captured (webhook or polling).
 */
async function initiateUpiQrCheckout({
  amount,
  items,
  customerDetails,
  userId,
}) {
  if (!userId) {
    throw badRequest('User authentication is required for checkout');
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
      `Amount mismatch: expected INR ${totalAmount}, received INR ${parsedAmount}`
    );
  }

  const amountPaise = Math.round(totalAmount * 100);
  if (amountPaise < 100) {
    throw badRequest('Minimum order amount for online payment is INR 1');
  }

  const expiresAt = new Date(Date.now() + QR_TTL_MS);
  const closeBy = Math.floor(expiresAt.getTime() / 1000);

  let qrCode;
  try {
    qrCode = await getRazorpay().qrCode.create({
      type: 'upi_qr',
      name: 'PK Food Factory',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: amountPaise,
      description: `PK order for ${sanitizedCustomerDetails.email}`,
      close_by: closeBy,
      notes: {
        userEmail: sanitizedCustomerDetails.email,
        userId: String(userId),
      },
    });
  } catch (err) {
    console.error('Razorpay qrCode.create failed:', err && (err.error || err.message || err));
    throw gatewayError(err, 'Could not create UPI QR code');
  }

  if (!qrCode || !qrCode.id || !qrCode.image_url) {
    throw gatewayError(
      { message: 'Razorpay did not return a QR code id / image_url' },
      'Could not create UPI QR code'
    );
  }

  const intent = new CheckoutIntent({
    kind: 'qr_code',
    razorpayQrCodeId: qrCode.id,
    userId,
    items: lineItems,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    customerDetails: sanitizedCustomerDetails,
    status: 'awaiting_payment',
    expiresAt,
  });

  try {
    await intent.save();
  } catch (err) {
    console.error('CheckoutIntent (qr) save failed:', err);
    if (err && err.name === 'ValidationError') {
      throw badRequest(err.message || 'Invalid checkout data');
    }
    if (err && err.code === 11000) {
      throw badRequest('Checkout already in progress. Please wait a moment and retry.');
    }
    throw err;
  }

  return {
    qrCodeId: qrCode.id,
    imageUrl: qrCode.image_url,
    amount: amountPaise,
    currency: 'INR',
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Finalizes a QR-based checkout from a verified Razorpay webhook (qr_code.credited).
 * Idempotent.
 */
async function finalizeQrCheckoutFromWebhook(razorpayQrCodeId, paymentId) {
  const intent = await CheckoutIntent.findOne({ razorpayQrCodeId, kind: 'qr_code' });
  if (!intent) {
    console.warn('Webhook: no checkout intent for qr_code', razorpayQrCodeId);
    return null;
  }

  if (intent.status === 'completed' && intent.orderId) {
    return { orderId: intent.orderId, paymentId: intent.paymentId || paymentId };
  }

  if (intent.expiresAt && intent.expiresAt < new Date() && intent.status !== 'completed') {
    // Late capture after our TTL — still create the order to honour the customer's payment.
    console.warn('Webhook: qr_code intent past TTL, finalizing anyway', razorpayQrCodeId);
  }

  const order = await createOrderFromIntent(intent, paymentId);
  return { orderId: order.orderId, paymentId };
}

/**
 * Returns the live status of a QR-based checkout for the given user. Reconciles via
 * Razorpay if the local intent is still pending (covers webhook delays / drops).
 */
async function getUpiQrCheckoutStatus({ qrCodeId, userId }) {
  if (!qrCodeId) {
    throw badRequest('qrCodeId is required');
  }

  const intent = await CheckoutIntent.findOne({ razorpayQrCodeId: qrCodeId, kind: 'qr_code' });
  if (!intent) {
    throw notFound('Checkout session not found');
  }
  if (String(intent.userId) !== String(userId)) {
    throw forbidden('This checkout session does not belong to the current user');
  }

  if (intent.status === 'completed' && intent.orderId) {
    return {
      status: 'completed',
      orderId: intent.orderId,
      paymentId: intent.paymentId,
    };
  }
  if (intent.status === 'failed') {
    return { status: 'failed' };
  }

  // Reconcile with Razorpay so a successful payment lands even if the webhook is delayed.
  let qrLive;
  try {
    qrLive = await getRazorpay().qrCode.fetch(qrCodeId);
  } catch (err) {
    console.error('Razorpay qrCode.fetch failed:', err && (err.error || err.message || err));
    if (intent.expiresAt && intent.expiresAt < new Date()) {
      await markQrCheckoutIntentFailed(qrCodeId);
      return { status: 'failed' };
    }
    return { status: 'pending', expiresAt: intent.expiresAt && intent.expiresAt.toISOString() };
  }

  const received = Number(qrLive && qrLive.payments_amount_received) || 0;
  const expected = Number(qrLive && qrLive.payment_amount) || 0;
  const fullyPaid = received > 0 && expected > 0 && received >= expected;

  if (fullyPaid) {
    let paymentId = null;
    try {
      const payments = await getRazorpay().qrCode.fetchAllPayments(qrCodeId);
      const list = (payments && payments.items) || [];
      const captured = list.find((p) => p && p.status === 'captured') || list[0];
      paymentId = captured && captured.id;
    } catch (err) {
      console.error(
        'Razorpay qrCode.fetchAllPayments failed:',
        err && (err.error || err.message || err)
      );
    }

    if (!paymentId) {
      // Razorpay says paid but we cannot resolve a payment id — surface as still pending
      // so the next poll retries; webhook will likely arrive shortly.
      return { status: 'pending', expiresAt: intent.expiresAt && intent.expiresAt.toISOString() };
    }

    const order = await createOrderFromIntent(intent, paymentId);
    return { status: 'completed', orderId: order.orderId, paymentId };
  }

  if (qrLive && qrLive.status === 'closed' && !fullyPaid) {
    await markQrCheckoutIntentFailed(qrCodeId);
    return { status: 'failed' };
  }

  if (intent.expiresAt && intent.expiresAt < new Date()) {
    await markQrCheckoutIntentFailed(qrCodeId);
    return { status: 'failed' };
  }

  return { status: 'pending', expiresAt: intent.expiresAt && intent.expiresAt.toISOString() };
}

/**
 * Closes the QR code at Razorpay (so a late scanner cannot pay) and marks the
 * intent failed locally. Callable by the QR's owning user.
 */
async function cancelUpiQrCheckout({ qrCodeId, userId }) {
  if (!qrCodeId) {
    throw badRequest('qrCodeId is required');
  }

  const intent = await CheckoutIntent.findOne({ razorpayQrCodeId: qrCodeId, kind: 'qr_code' });
  if (!intent) {
    throw notFound('Checkout session not found');
  }
  if (String(intent.userId) !== String(userId)) {
    throw forbidden('This checkout session does not belong to the current user');
  }
  if (intent.status === 'completed') {
    return { ok: true, alreadyCompleted: true };
  }

  try {
    await getRazorpay().qrCode.close(qrCodeId);
  } catch (err) {
    // Already closed at Razorpay is fine; only log other failures.
    const status = err && err.statusCode;
    if (status !== 400 && status !== 404) {
      console.error('Razorpay qrCode.close failed:', err && (err.error || err.message || err));
    }
  }

  await markQrCheckoutIntentFailed(qrCodeId);
  return { ok: true };
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
  const qrEntity = body.payload?.qr_code?.entity;

  // QR Code events arrive with both qr_code.entity and payment.entity in the payload.
  if (event === 'qr_code.credited') {
    if (qrEntity?.id && paymentEntity?.id) {
      await finalizeQrCheckoutFromWebhook(qrEntity.id, paymentEntity.id);
      return { status: 'ok', event };
    }
    return { status: 'ignored', event };
  }

  if (event === 'qr_code.closed') {
    if (qrEntity?.id) {
      await markQrCheckoutIntentFailed(qrEntity.id);
      return { status: 'ok', event };
    }
    return { status: 'ignored', event };
  }

  // Standard Checkout (Order-based) events.
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

async function probeRazorpayCredentials() {
  assertRazorpayConfigured();
  try {
    const probeOrder = await getRazorpay().orders.create({
      amount: 100,
      currency: 'INR',
      receipt: `probe_${Date.now()}`,
    });
    return {
      ok: true,
      mode: getRazorpayKeyMode(process.env.RAZORPAY_KEY_ID),
      orderId: probeOrder && probeOrder.id ? probeOrder.id : null,
    };
  } catch (err) {
    const wrapped = gatewayError(err, 'Razorpay probe failed');
    return {
      ok: false,
      mode: getRazorpayKeyMode(process.env.RAZORPAY_KEY_ID),
      statusCode: wrapped.statusCode,
      error: wrapped.message,
    };
  }
}

module.exports = {
  initiateCheckout,
  finalizeCheckoutPayment,
  initiateUpiQrCheckout,
  getUpiQrCheckoutStatus,
  cancelUpiQrCheckout,
  handleRazorpayWebhook,
  assertRazorpayConfigured,
  isPlaceholderKey,
  getRazorpayKeyMode,
  probeRazorpayCredentials,
  normalizeIndianPhone,
  isEmailValid,
};
