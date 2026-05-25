const mongoose = require('mongoose');

const PURPOSES = ['signup', 'login', 'reset_credentials', 'switch_auth_method'];
const LOGIN_CHANNELS = ['email', 'phone'];
const TARGET_AUTH_TYPES = ['password', 'pin'];

const otpChallengeSchema = new mongoose.Schema(
  {
    purpose: { type: String, enum: PURPOSES, required: true, index: true },
    sessionToken: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    loginChannel: { type: String, enum: LOGIN_CHANNELS, default: null },
    targetAuthType: { type: String, enum: TARGET_AUTH_TYPES, default: null },
    oldAuthVerified: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false },
    emailCodeHash: { type: String, default: null, select: false },
    phoneCodeHash: { type: String, default: null, select: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    signupPayload: {
      name: String,
      address: String,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpChallenge', otpChallengeSchema);
module.exports.PURPOSES = PURPOSES;
module.exports.LOGIN_CHANNELS = LOGIN_CHANNELS;
module.exports.TARGET_AUTH_TYPES = TARGET_AUTH_TYPES;
