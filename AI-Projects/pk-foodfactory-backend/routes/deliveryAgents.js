const express = require('express');
const multer = require('multer');
const DeliveryAgent = require('../models/DeliveryAgent');
const { VEHICLE_TYPES, STATUSES, PASSCODE_RE, hashPasscode } = require('../models/DeliveryAgent');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { signAgentToken, requireAgentAuth } = require('../middleware/agentAuth');
const { validatePhone, validateEmail, normalizePhoneDigits } = require('../utils/userValidation');

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

function safeAgent(doc, { includeHasPasscode = true } = {}) {
  const out = {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    email: doc.email || '',
    vehicleType: doc.vehicleType || 'Bike',
    vehicleNumber: doc.vehicleNumber || '',
    licenseNumber: doc.licenseNumber || '',
    address: doc.address || '',
    photoUrl: doc.photoUrl || null,
    status: doc.status || 'active',
    notes: doc.notes || '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
  if (includeHasPasscode) {
    out.hasPasscode = Boolean(doc.passcodeHash);
  }
  return out;
}

// Public snapshot shown to the customer alongside their order (no PII overshare).
function publicAgentSnapshot(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    photoUrl: doc.photoUrl || null,
    vehicleType: doc.vehicleType || 'Bike',
    vehicleNumber: doc.vehicleNumber || '',
  };
}

async function parseAgentBody(body, file, { partial = false } = {}) {
  const out = {};
  const errors = [];

  if (body.name !== undefined || !partial) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) errors.push('Name is required');
    else if (name.length < 2 || name.length > 120) errors.push('Name must be between 2 and 120 characters');
    else out.name = name;
  }

  if (body.phone !== undefined || !partial) {
    const phoneRes = validatePhone(body.phone);
    if (phoneRes.error) errors.push(phoneRes.error);
    else out.phone = phoneRes.value;
  }

  if (body.email !== undefined) {
    const raw = typeof body.email === 'string' ? body.email.trim() : '';
    if (raw) {
      const emailRes = validateEmail(raw);
      if (emailRes.error) errors.push(emailRes.error);
      else out.email = emailRes.value;
    } else {
      out.email = '';
    }
  }

  if (body.vehicleType !== undefined) {
    const vt = typeof body.vehicleType === 'string' ? body.vehicleType.trim() : '';
    if (vt && !VEHICLE_TYPES.includes(vt)) {
      errors.push(`Vehicle type must be one of: ${VEHICLE_TYPES.join(', ')}`);
    } else if (vt) {
      out.vehicleType = vt;
    }
  }

  if (body.vehicleNumber !== undefined) {
    const vn = typeof body.vehicleNumber === 'string' ? body.vehicleNumber.trim() : '';
    if (vn.length > 30) errors.push('Vehicle number must be 30 characters or fewer');
    else out.vehicleNumber = vn;
  }

  if (body.licenseNumber !== undefined) {
    const ln = typeof body.licenseNumber === 'string' ? body.licenseNumber.trim() : '';
    if (ln.length > 40) errors.push('License number must be 40 characters or fewer');
    else out.licenseNumber = ln;
  }

  if (body.address !== undefined) {
    const addr = typeof body.address === 'string' ? body.address.trim() : '';
    if (addr.length > 500) errors.push('Address must be 500 characters or fewer');
    else out.address = addr;
  }

  if (body.notes !== undefined) {
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
    if (notes.length > 500) errors.push('Notes must be 500 characters or fewer');
    else out.notes = notes;
  }

  if (body.status !== undefined) {
    const st = typeof body.status === 'string' ? body.status.trim() : '';
    if (st && !STATUSES.includes(st)) {
      errors.push(`Status must be one of: ${STATUSES.join(', ')}`);
    } else if (st) {
      out.status = st;
    }
  }

  // Passcode handling:
  //  - 'passcode' = 4–8 digit PIN → hashed
  //  - 'passcode' = '' or 'null' → clear
  //  - omitted → no change
  if (body.passcode !== undefined) {
    const raw = body.passcode === null ? '' : String(body.passcode).trim();
    if (raw === '' || raw === 'null') {
      out.passcodeHash = null;
    } else if (!PASSCODE_RE.test(raw)) {
      errors.push('Passcode must be 4 to 8 digits');
    } else {
      out.passcodeHash = await hashPasscode(raw);
    }
  }

  if (file) {
    out.photoUrl = bufferToDataUrl(file);
  } else if (body.photoUrl !== undefined) {
    const raw = body.photoUrl;
    if (raw === null || raw === '' || raw === 'null') {
      out.photoUrl = null;
    } else if (typeof raw === 'string') {
      out.photoUrl = raw.trim() || null;
    }
  }

  return { values: out, errors };
}

// ================================================================
// AGENT SELF-SERVICE (no admin required) - register BEFORE param routes
// so '/auth/login' isn't captured by '/:id'.
// ================================================================

// Agent login (public): phone + passcode → JWT
router.post('/auth/login', async (req, res) => {
  try {
    const phone = typeof req.body?.phone === 'string' ? req.body.phone : '';
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode : '';
    if (!phone || !passcode) {
      return res.status(400).json({ error: 'Phone and passcode are required' });
    }
    const phoneNorm = normalizePhoneDigits(phone.trim());
    const agent = await DeliveryAgent.findOne({ phone: phoneNorm }).select('+passcodeHash');
    if (!agent || !agent.passcodeHash) {
      return res.status(401).json({ error: 'Invalid phone or passcode' });
    }
    if (agent.status !== 'active') {
      return res.status(403).json({ error: 'This delivery account is inactive' });
    }
    const ok = await agent.verifyPasscode(passcode);
    if (!ok) return res.status(401).json({ error: 'Invalid phone or passcode' });

    let token;
    try {
      token = signAgentToken(agent._id);
    } catch (e) {
      console.error('Agent token signing failed:', e);
      return res.status(500).json({ error: 'Token signing failed' });
    }
    return res.json({ token, agent: safeAgent(agent, { includeHasPasscode: false }) });
  } catch (err) {
    console.error('Agent login error:', err);
    return res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Logged-in agent profile
router.get('/me', requireAgentAuth, async (req, res) => {
  return res.json(safeAgent(req.agent, { includeHasPasscode: false }));
});

// Logged-in agent's assigned orders
router.get('/me/orders', requireAgentAuth, async (req, res) => {
  try {
    const docs = await Order.find({ deliveryAgentId: req.agent._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(docs);
  } catch (err) {
    console.error('Agent orders error:', err);
    return res.status(500).json({ error: 'Failed to load assigned orders' });
  }
});

// Logged-in agent updates a status
router.post('/me/orders/:orderId/status', requireAgentAuth, async (req, res) => {
  try {
    const { status, notes } = req.body || {};
    const allowed = new Set(['out_for_delivery', 'delivered', 'not_delivered']);
    if (!allowed.has(status)) {
      return res.status(400).json({ error: `Status must be one of: ${Array.from(allowed).join(', ')}` });
    }
    const order = await Order.findOne({
      orderId: req.params.orderId,
      deliveryAgentId: req.agent._id,
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found or not assigned to you' });
    }
    if (order.deliveryStatus === 'delivered' || order.deliveryStatus === 'not_delivered') {
      return res.status(409).json({ error: `Order is already ${order.deliveryStatus}` });
    }
    order.deliveryStatus = status;
    order.deliveryStatusUpdatedAt = new Date();
    if (typeof notes === 'string') {
      order.deliveryNotes = notes.trim().slice(0, 500);
    }
    await order.save();
    return res.json({
      orderId: order.orderId,
      deliveryStatus: order.deliveryStatus,
      deliveryNotes: order.deliveryNotes,
      deliveryStatusUpdatedAt: order.deliveryStatusUpdatedAt,
    });
  } catch (err) {
    console.error('Agent update status error:', err);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

// ================================================================
// ADMIN CRUD
// ================================================================

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const docs = await DeliveryAgent.find(filter).sort({ createdAt: -1 });
    return res.json(docs.map((d) => safeAgent(d)));
  } catch (err) {
    console.error('List delivery agents error:', err);
    return res.status(500).json({ error: 'Failed to load delivery agents' });
  }
});

router.get('/meta', requireAuth, requireAdmin, (req, res) => {
  res.json({ vehicleTypes: VEHICLE_TYPES, statuses: STATUSES });
});

router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const doc = await DeliveryAgent.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Delivery agent not found' });
    return res.json(safeAgent(doc));
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
    console.error('Get delivery agent error:', err);
    return res.status(500).json({ error: 'Failed to load delivery agent' });
  }
});

router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.single('photo'),
  async (req, res) => {
    try {
      const { values, errors } = await parseAgentBody(req.body || {}, req.file, { partial: false });
      if (errors.length) return res.status(400).json({ error: errors[0] });
      const created = await DeliveryAgent.create({ ...values, createdBy: req.userId });
      return res.status(201).json(safeAgent(created));
    } catch (err) {
      if (err && err.code === 11000) return res.status(409).json({ error: 'A delivery agent with this phone already exists' });
      if (err && err.message && /Only PNG/.test(err.message)) return res.status(400).json({ error: err.message });
      if (err.name === 'ValidationError') {
        const first = Object.values(err.errors || {})[0];
        return res.status(400).json({ error: first?.message || 'Validation failed' });
      }
      console.error('Create delivery agent error:', err);
      return res.status(500).json({ error: 'Failed to create delivery agent' });
    }
  }
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  upload.single('photo'),
  async (req, res) => {
    try {
      const { values, errors } = await parseAgentBody(req.body || {}, req.file, { partial: true });
      if (errors.length) return res.status(400).json({ error: errors[0] });
      const updated = await DeliveryAgent.findByIdAndUpdate(req.params.id, values, {
        new: true,
        runValidators: true,
      });
      if (!updated) return res.status(404).json({ error: 'Delivery agent not found' });
      return res.json(safeAgent(updated));
    } catch (err) {
      if (err && err.code === 11000) return res.status(409).json({ error: 'A delivery agent with this phone already exists' });
      if (err && err.message && /Only PNG/.test(err.message)) return res.status(400).json({ error: err.message });
      if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
      console.error('Update delivery agent error:', err);
      return res.status(500).json({ error: 'Failed to update delivery agent' });
    }
  }
);

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await DeliveryAgent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Delivery agent not found' });
    return res.json({ success: true, id: deleted._id.toString() });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
    console.error('Delete delivery agent error:', err);
    return res.status(500).json({ error: 'Failed to delete delivery agent' });
  }
});

module.exports = router;
module.exports.publicAgentSnapshot = publicAgentSnapshot;
