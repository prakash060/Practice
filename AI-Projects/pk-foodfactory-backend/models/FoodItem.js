const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    // Free string that must match an existing Category.name. The route layer
    // enforces that — the schema purposefully has no enum so admins can add
    // and remove categories at runtime without code/schema changes.
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
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
    // HTTPS URL, data:image/...;base64,... URL, or null (UI falls back to the
    // category default, then to a generic placeholder).
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
