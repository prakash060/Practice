const express = require('express');
const multer = require('multer');
const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { parseImageUrlField } = require('../utils/imageUrl');

const router = express.Router();

// Images are stored as base64 data URLs directly on the document.
// Small (< 2MB) and avoids needing a separate file host on EB.
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

function safeItem(doc) {
  return {
    id: doc._id.toString(),
    category: doc.category,
    name: doc.name,
    description: doc.description || '',
    price: doc.price,
    imageUrl: doc.imageUrl || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function bufferToDataUrl(file) {
  if (!file || !file.buffer || !file.buffer.length) return null;
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

function parseItemBody(body, file, { partial = false } = {}) {
  const out = {};
  const errors = [];

  if (body.category !== undefined || !partial) {
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    if (!category) {
      errors.push('Category is required');
    } else {
      out.category = category;
    }
  }

  if (body.name !== undefined || !partial) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      errors.push('Name is required');
    } else if (name.length > 120) {
      errors.push('Name must be 120 characters or fewer');
    } else {
      out.name = name;
    }
  }

  if (body.description !== undefined) {
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (description.length > 500) {
      errors.push('Description must be 500 characters or fewer');
    } else {
      out.description = description;
    }
  }

  if (body.price !== undefined) {
    const priceNum = Number(body.price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      errors.push('Price must be a non-negative number');
    } else {
      out.price = priceNum;
    }
  }

  if (file) {
    out.imageUrl = bufferToDataUrl(file);
  } else if (body.imageUrl !== undefined) {
    const parsed = parseImageUrlField(body.imageUrl, errors, 'Item image URL');
    if (parsed !== undefined) {
      out.imageUrl = parsed;
    }
  }

  return { values: out, errors };
}

// Public: list items (optionally filter by category)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = String(req.query.category).trim();
    }
    const docs = await FoodItem.find(filter).sort({ category: 1, name: 1 }).lean();
    return res.json(docs.map((d) => ({
      id: d._id.toString(),
      category: d.category,
      name: d.name,
      description: d.description || '',
      price: d.price,
      imageUrl: d.imageUrl || null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })));
  } catch (err) {
    console.error('List food items error:', err);
    return res.status(500).json({ error: 'Failed to load food items' });
  }
});

// Admin: create
router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      const { values, errors } = parseItemBody(req.body || {}, req.file, { partial: false });
      if (errors.length) {
        return res.status(400).json({ error: errors[0] });
      }
      const knownCategory = await Category.findOne({ name: values.category });
      if (!knownCategory) {
        return res.status(400).json({
          error: `Unknown category "${values.category}". Create the category first.`,
        });
      }
      const created = await FoodItem.create({
        ...values,
        createdBy: req.userId,
      });
      return res.status(201).json(safeItem(created));
    } catch (err) {
      if (err && err.message && /Only PNG/.test(err.message)) {
        return res.status(400).json({ error: err.message });
      }
      console.error('Create food item error:', err);
      return res.status(500).json({ error: 'Failed to create food item' });
    }
  }
);

// Admin: update
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      const { values, errors } = parseItemBody(req.body || {}, req.file, { partial: true });
      if (errors.length) {
        return res.status(400).json({ error: errors[0] });
      }
      if (values.category) {
        const knownCategory = await Category.findOne({ name: values.category });
        if (!knownCategory) {
          return res.status(400).json({
            error: `Unknown category "${values.category}". Create the category first.`,
          });
        }
      }
      const updated = await FoodItem.findByIdAndUpdate(req.params.id, values, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        return res.status(404).json({ error: 'Food item not found' });
      }
      return res.json(safeItem(updated));
    } catch (err) {
      if (err && err.message && /Only PNG/.test(err.message)) {
        return res.status(400).json({ error: err.message });
      }
      if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid food item id' });
      }
      console.error('Update food item error:', err);
      return res.status(500).json({ error: 'Failed to update food item' });
    }
  }
);

// Admin: delete
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await FoodItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    return res.json({ success: true, id: deleted._id.toString() });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid food item id' });
    }
    console.error('Delete food item error:', err);
    return res.status(500).json({ error: 'Failed to delete food item' });
  }
});

module.exports = router;
