const mongoose = require('mongoose');

// Hex color shorthand (#abc) or 6-digit (#aabbcc). Falls back to a default if blank.
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const categorySchema = new mongoose.Schema(
  {
    // Stable identifier used on FoodItem.category. Unique, trimmed, case-preserved.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 60,
    },
    // Display label shown in the UI; defaults to `name` when empty.
    label: { type: String, default: '', trim: true, maxlength: 80 },
    emoji: { type: String, default: '🍽️', trim: true, maxlength: 8 },
    accent: {
      type: String,
      default: '#6b5ef7',
      trim: true,
      validate: {
        validator: (v) => !v || HEX_COLOR_RE.test(v),
        message: 'Accent must be a hex color like #6b5ef7',
      },
    },
    // HTTPS URL, data:image/...;base64,... URL, or null (UI uses a generic fallback).
    imageUrl: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
module.exports.HEX_COLOR_RE = HEX_COLOR_RE;
