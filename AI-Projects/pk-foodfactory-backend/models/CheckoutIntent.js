const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const checkoutIntentSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
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

checkoutIntentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CheckoutIntent', checkoutIntentSchema);
