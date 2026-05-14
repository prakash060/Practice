const mongoose = require('mongoose');

const ALLOWED_CATEGORIES = ['Biryani', 'Icecream', 'Chats', 'Pizza', 'Sweets'];

const foodItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ALLOWED_CATEGORIES,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    price: {
      type: Number,
      default: 2,
      min: 0,
    },
    // Stored as either an HTTPS URL, a data:image/... base64 URL, or null when
    // no image is configured (the UI then falls back to the category's default).
    imageUrl: {
      type: String,
      default: null,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

foodItemSchema.index({ category: 1, name: 1 });

module.exports = mongoose.model('FoodItem', foodItemSchema);
module.exports.ALLOWED_CATEGORIES = ALLOWED_CATEGORIES;
