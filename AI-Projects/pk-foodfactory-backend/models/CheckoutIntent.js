const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const checkoutIntentSchema = new mongoose.Schema({
  // Discriminates Standard Checkout (Razorpay Order) flows from Dynamic UPI QR flows.
  kind: {
    type: String,
    enum: ['order', 'qr_code'],
    default: 'order',
    index: true,
  },
  // Razorpay Order id — set for kind='order' (UPI / Card / Net Banking via Standard Checkout).
  razorpayOrderId: { type: String, default: null },
  // Razorpay QR Code id — set for kind='qr_code' (Scan & Pay).
  razorpayQrCodeId: { type: String, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  customerDetails: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  status: {
    type: String,
    enum: ['awaiting_payment', 'completed', 'failed'],
    default: 'awaiting_payment',
    index: true,
  },
  orderId: { type: String, default: null },
  paymentId: { type: String, default: null },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Each Razorpay reference is unique only when present, so the same collection
// can hold both Order-based and QR-based intents without colliding on null keys.
checkoutIntentSchema.index(
  { razorpayOrderId: 1 },
  { unique: true, partialFilterExpression: { razorpayOrderId: { $type: 'string' } } }
);
checkoutIntentSchema.index(
  { razorpayQrCodeId: 1 },
  { unique: true, partialFilterExpression: { razorpayQrCodeId: { $type: 'string' } } }
);

checkoutIntentSchema.pre('validate', function (next) {
  const hasOrder = typeof this.razorpayOrderId === 'string' && this.razorpayOrderId.length > 0;
  const hasQr = typeof this.razorpayQrCodeId === 'string' && this.razorpayQrCodeId.length > 0;
  if (hasOrder === hasQr) {
    return next(
      new Error(
        'CheckoutIntent must reference exactly one of razorpayOrderId or razorpayQrCodeId'
      )
    );
  }
  if (hasOrder && this.kind !== 'order') this.kind = 'order';
  if (hasQr && this.kind !== 'qr_code') this.kind = 'qr_code';
  next();
});

checkoutIntentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CheckoutIntent', checkoutIntentSchema);
