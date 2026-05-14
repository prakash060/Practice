const mongoose = require('mongoose');

const VEHICLE_TYPES = ['Bike', 'Scooter', 'Bicycle', 'Car', 'Other'];
const STATUSES = ['active', 'inactive'];

const deliveryAgentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    vehicleType: {
      type: String,
      default: 'Bike',
      enum: VEHICLE_TYPES,
    },
    vehicleNumber: { type: String, default: '', trim: true, maxlength: 30, uppercase: true },
    licenseNumber: { type: String, default: '', trim: true, maxlength: 40, uppercase: true },
    address: { type: String, default: '', trim: true, maxlength: 500 },
    // Stored as HTTPS URL, data:image/...;base64, or null when not set.
    photoUrl: { type: String, default: null },
    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
      index: true,
    },
    notes: { type: String, default: '', trim: true, maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

deliveryAgentSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;
module.exports.STATUSES = STATUSES;
