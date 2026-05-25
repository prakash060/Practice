const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;
const PIN_SALT_ROUNDS = 8;
const AUTH_TYPES = ['password', 'pin', 'otp'];
const PIN_RE = /^\d{4,6}$/;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
      minlength: 8,
    },
    pinHash: {
      type: String,
      required: false,
      select: false,
    },
    authType: {
      type: String,
      enum: AUTH_TYPES,
      default: 'otp',
    },
    lastLoginMethod: {
      type: String,
      enum: AUTH_TYPES,
      default: null,
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { unique: true });

userSchema.pre('save', async function hashCredentials() {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
  if (this.isModified('pinHash') && this.pinHash && !String(this.pinHash).startsWith('$2')) {
    this.pinHash = await bcrypt.hash(String(this.pinHash), PIN_SALT_ROUNDS);
  }
});

userSchema.methods.verifyPassword = async function verifyPassword(plain) {
  if (!this.password || !plain) return false;
  return bcrypt.compare(String(plain), this.password);
};

userSchema.methods.verifyPin = async function verifyPin(pin) {
  if (!this.pinHash || !pin) return false;
  return bcrypt.compare(String(pin), this.pinHash);
};

async function hashPin(pin) {
  return bcrypt.hash(String(pin), PIN_SALT_ROUNDS);
}

module.exports = mongoose.model('User', userSchema);
module.exports.AUTH_TYPES = AUTH_TYPES;
module.exports.PIN_RE = PIN_RE;
module.exports.hashPin = hashPin;
