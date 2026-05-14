const express = require('express');
const multer = require('multer');
const Category = require('../models/Category');
const { HEX_COLOR_RE } = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

const ALLOWED_IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file) return cb(null, true);
    if (!ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      return cb(new Error('Only PNG, JPEG, WebP, or GIF images are allowed'));
    }
    return cb(null, true);
  },
});

function bufferToDataUrl(file) {
  if (!file || !file.buffer || !file.buffer.length) return null;
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

function safeCategory(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    label: doc.label || doc.name,
    emoji: doc.emoji || '🍽️',
    accent: doc.accent || '#6b5ef7',
    imageUrl: doc.imageUrl || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function parseCategoryBody(body, file, { partial = false } = {}) {
  const out = {};
  const errors = [];

  if (body.name !== undefined || !partial) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      errors.push('Category name is required');
    } else if (name.length > 60) {
      errors.push('Category name must be 60 characters or fewer');
    } else {
      out.name = name;
    }
  }

  if (body.label !== undefined) {
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    if (label.length > 80) {
      errors.push('Label must be 80 characters or fewer');
    } else {
      out.label = label;
    }
  }

  if (body.emoji !== undefined) {
    const emoji = typeof body.emoji === 'string' ? body.emoji.trim() : '';
    if (emoji.length > 8) {
      errors.push('Emoji must be 8 characters or fewer');
    } else {
      out.emoji = emoji || '🍽️';
    }
  }

  if (body.accent !== undefined) {
    const accent = typeof body.accent === 'string' ? body.accent.trim() : '';
    if (accent && !HEX_COLOR_RE.test(accent)) {
      errors.push('Accent must be a hex color like #6b5ef7');
    } else {
      out.accent = accent || '#6b5ef7';
    }
  }

  if (file) {
    out.imageUrl = bufferToDataUrl(file);
  } else if (body.imageUrl !== undefined) {
    const raw = body.imageUrl;
    if (raw === null || raw === '' || raw === 'null') {
      out.imageUrl = null;
    } else if (typeof raw === 'string') {
      out.imageUrl = raw.trim() || null;
    }
  }

  return { values: out, errors };
}

// Public: list categories
router.get('/', async (req, res) => {
  try {
    const docs = await Category.find().sort({ name: 1 }).lean();
    return res.json(docs.map((d) => safeCategory(d)));
  } catch (err) {
    console.error('List categories error:', err);
    return res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Admin: create
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { values, errors } = parseCategoryBody(req.body || {}, req.file, { partial: false });
    if (errors.length) {
      return res.status(400).json({ error: errors[0] });
    }
    const created = await Category.create({ ...values, createdBy: req.userId });
    return res.status(201).json(safeCategory(created));
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }
    if (err && err.message && /Only PNG/.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors || {})[0];
      return res.status(400).json({ error: first?.message || 'Validation failed' });
    }
    console.error('Create category error:', err);
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// Admin: update
router.put('/:id', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { values, errors } = parseCategoryBody(req.body || {}, req.file, { partial: true });
    if (errors.length) {
      return res.status(400).json({ error: errors[0] });
    }

    // If renaming, propagate the change to FoodItem.category so existing items
    // stay attached. Done in two steps to keep this simple — atomic enough for
    // a small admin tool; for high concurrency wrap in a transaction.
    const oldName = existing.name;
    Object.assign(existing, values);
    const saved = await existing.save();
    if (values.name && values.name !== oldName) {
      await FoodItem.updateMany({ category: oldName }, { $set: { category: values.name } });
    }
    return res.json(safeCategory(saved));
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid category id' });
    }
    if (err && err.message && /Only PNG/.test(err.message)) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Update category error:', err);
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

// Admin: delete (cascade-deletes items in this category)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const itemsDeleted = await FoodItem.deleteMany({ category: category.name });
    await category.deleteOne();
    return res.json({
      success: true,
      id: category._id.toString(),
      itemsDeleted: itemsDeleted.deletedCount || 0,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid category id' });
    }
    console.error('Delete category error:', err);
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
