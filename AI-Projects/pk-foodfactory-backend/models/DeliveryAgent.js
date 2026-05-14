const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VEHICLE_TYPES = ['Bike', 'Scooter', 'Bicycle', 'Car', 'Other'];
const STATUSES = ['active', 'inactive'];
const PASSCODE_RE = /^\d{4,8}$/;
const PASSCODE_SALT_ROUNDS = 8;

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
    photoUrl: { type: String, default: null },
    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
      index: true,
    },
    notes: { type: String, default: '', trim: true, maxlength: 500 },
    // Bcrypt-hashed login passcode. Never returned (select:false). Admin sets it during
    // onboarding; if absent the agent cannot sign in.
    passcodeHash: { type: String, default: null, select: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

deliveryAgentSchema.index({ phone: 1 }, { unique: true });

deliveryAgentSchema.methods.verifyPasscode = async function verifyPasscode(passcode) {
  if (!this.passcodeHash || !passcode) return false;
  return bcrypt.compare(String(passcode), this.passcodeHash);
};

async function hashPasscode(passcode) {
  return bcrypt.hash(String(passcode), PASSCODE_SALT_ROUNDS);
}

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;
module.exports.STATUSES = STATUSES;
module.exports.PASSCODE_RE = PASSCODE_RE;
module.exports.hashPasscode = hashPasscode;
