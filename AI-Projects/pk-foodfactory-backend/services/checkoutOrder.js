const Razorpay = require('razorpay');
const Order = require('../models/Order');

/**
 * TEMPORARY / DEV: when true, skips real Razorpay API and signature verification so orders
 * can be completed without dashboard keys. Set DUMMY_PAYMENT_MODE=false (or remove) before
 * taking real payments in production.
 */
function isDummyPaymentMode() {
  const v = process.env.DUMMY_PAYMENT_MODE;
  return v === 'true' || v === '1';
}

let razorpay = null;
function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

/**
 * Validates totals, creates a Razorpay order (unless DUMMY_PAYMENT_MODE), persists Order in MongoDB.
 * @param {object} params
 * @param {number} params.amount - Total in INR (subtotal + delivery + tax)
 * @param {string} [params.currency]
 * @param {Array} params.items
 * @param {object} [params.customerDetails]
 * @param {string|null} [params.userId] - Mongo user id when logged in
 */
async function createCheckoutOrder({
  amount,
  currency = 'INR',
  items,
  customerDetails,
  userId,
}) {
  if (!amount || !items || items.length === 0) {
    throw badRequest('Amount and items are required');
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + deliveryFee + tax;

  if (Math.abs(amount - totalAmount) > 1) {
    throw badRequest('Amount mismatch');
  }

  const dummy = isDummyPaymentMode();
  let razorpayOrderId;
  let razorpayAmountPaise;
  let razorpayCurrency;

  if (dummy) {
    razorpayOrderId = `rz_dummy_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    razorpayAmountPaise = Math.round(amount * 100);
    razorpayCurrency = currency;
  } else {
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };
    const razorpayOrder = await getRazorpay().orders.create(options);
    razorpayOrderId = razorpayOrder.id;
    razorpayAmountPaise = razorpayOrder.amount;
    razorpayCurrency = razorpayOrder.currency;
  }

  const orderPayload = {
    orderId: `PK${Date.now()}`,
    items,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    razorpayOrderId,
    customerDetails: customerDetails || {},
    paymentStatus: 'pending',
  };

  if (userId) {
    orderPayload.userId = userId;
  }

  const order = new Order(orderPayload);
  await order.save();

  return {
    orderId: order.orderId,
    razorpayOrderId,
    amount: razorpayAmountPaise,
    currency: razorpayCurrency,
    key: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    checkoutDummy: dummy,
  };
}

module.exports = { createCheckoutOrder, isDummyPaymentMode };
