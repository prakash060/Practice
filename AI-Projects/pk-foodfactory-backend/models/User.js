const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;
const AUTH_TYPES = ['password', 'otp'];

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
});

userSchema.methods.verifyPassword = async function verifyPassword(plain) {
  if (!this.password || !plain) return false;
  const stored = String(this.password);
  if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
    return bcrypt.compare(String(plain), stored);
  }
  // Legacy plain-text passwords (e.g. set via findByIdAndUpdate before hashing fix)
  return String(plain) === stored;
};

userSchema.methods.passwordNeedsRehash = function passwordNeedsRehash() {
  if (!this.password) return false;
  const stored = String(this.password);
  return !stored.startsWith('$2a$') && !stored.startsWith('$2b$') && !stored.startsWith('$2y$');
};

async function hashPassword(plain) {
  return bcrypt.hash(String(plain), SALT_ROUNDS);
}

module.exports = mongoose.model('User', userSchema);
module.exports.AUTH_TYPES = AUTH_TYPES;
module.exports.hashPassword = hashPassword;
