const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const DELIVERY_STATUSES = ['unassigned', 'assigned', 'out_for_delivery', 'delivered', 'not_delivered'];

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: { type: String },
  razorpayQrCodeId: { type: String },
  customerDetails: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  // ---- Delivery fields ----
  deliveryAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryAgent',
    default: null,
    index: true,
  },
  deliveryStatus: {
    type: String,
    enum: DELIVERY_STATUSES,
    default: 'unassigned',
    index: true,
  },
  deliveryNotes: { type: String, default: '', trim: true, maxlength: 500 },
  deliveryStatusUpdatedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
module.exports.DELIVERY_STATUSES = DELIVERY_STATUSES;
