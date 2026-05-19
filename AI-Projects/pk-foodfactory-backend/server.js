const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./swagger/openapi');
const {
  handleRazorpayWebhook,
  isPlaceholderKey,
  getRazorpayKeyMode,
} = require('./services/checkoutOrder');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';

(function logRazorpayKeyStatus() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (isPlaceholderKey(keyId) || isPlaceholderKey(keySecret)) {
    console.error(
      'Razorpay: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are missing or placeholder. Checkout will fail with 503 until they are set in the server environment.'
    );
    return;
  }
  const mode = getRazorpayKeyMode(keyId);
  if (mode === 'unknown') {
    console.error(
      `Razorpay: RAZORPAY_KEY_ID has an unexpected prefix (${String(keyId).trim().slice(0, 9)}…). It must start with rzp_test_ or rzp_live_.`
    );
    return;
  }
  console.log(`Razorpay: configured with ${mode}-mode key (${String(keyId).trim().slice(0, 12)}…).`);
})();

app.set('trust proxy', 1);

const defaultCorsOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://d1a7288bn24qfa.cloudfront.net',
  'https://www.svifoods.com',
  'https://svifoods.com',
];

function buildAllowedOrigins() {
  const fromEnv = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set([...defaultCorsOrigins, ...fromEnv])];
}

const allowedOrigins = buildAllowedOrigins();

function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (!origin) {
    return;
  }
  if (allowedOrigins.includes(origin) || !isProd) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
}

function handlePreflight(req, res) {
  applyCorsHeaders(req, res);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Auth-Token'
  );
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
}

// Swagger UI uses inline scripts/styles; relax CSP so the docs page works.
// COOP is omitted: on HTTP (common on EB before HTTPS) browsers ignore it and log a console warning.
// CORP must allow cross-origin reads: frontend (d1a7288…cloudfront.net) and API (d3cvs28…) are different origins.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return handlePreflight(req, res);
  }
  applyCorsHeaders(req, res);
  next();
});

app.use(
  cors({
    origin: isProd ? allowedOrigins : true,
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
  })
);
app.use(morgan('combined'));

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 45000,
  // Atlas SRV can resolve to IPv6; some AWS/EB networks only route IPv4. Prefer IPv4 to avoid false "whitelist" errors.
  family: 4
};

function resolveMongoUri() {
  const raw =
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URL ||
    '';
  const uri = typeof raw === 'string' ? raw.trim() : '';
  if (uri) return uri;
  if (isProd) {
    console.error(
      'WARN: No MongoDB URI (set MONGODB_URI, DATABASE_URL, or MONGO_URL in Elastic Beanstalk environment properties).'
    );
    return null;
  }
  return 'mongodb://localhost:27017/foodfactory';
}

const mongoUri = resolveMongoUri();
if (mongoUri) {
  mongoose
    .connect(mongoUri, MONGO_OPTIONS)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      console.error(
        'Atlas: Network Access must allow this host; URI password with special chars must be URL-encoded.'
      );
    });
}

/** Wait for the driver (or surface connection errors) instead of failing while still connecting. */
async function requireMongo(req, res, next) {
  try {
    if (!mongoUri) {
      return res.status(503).json({
        error:
          'Database URL is missing. In Elastic Beanstalk: Configuration → Software → Environment properties — add MONGODB_URI (or DATABASE_URL) with your Atlas connection string. If you deploy via GitHub Actions, also set the MONGODB_URI repository secret so updates apply it.'
      });
    }
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    await mongoose.connection.asPromise();
    return next();
  } catch (err) {
    console.error('requireMongo:', err);
    const hint = err.message ? ` (${err.message})` : '';
    return res.status(503).json({
      error: `Cannot connect to MongoDB${hint}. Check Atlas Network Access (0.0.0.0/0 for testing), MONGODB_URI in EB, and URL-encode special characters in the password.`
    });
  }
}

// Razorpay webhook must use raw body for signature verification (before express.json)
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  requireMongo,
  async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
      const result = await handleRazorpayWebhook(rawBody, signature);
      res.json(result);
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).send(error.message);
      }
      console.error('Webhook error:', error);
      res.status(500).send('Webhook processing failed');
    }
  }
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI (must use split mount: static assets + GET handler — see swagger-ui-express README)
const swaggerOptions = { customSiteTitle: 'Food Factory API' };
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(openapi, swaggerOptions));
app.get('/api-docs/', (req, res) => res.redirect(301, '/api-docs'));
app.get('/openapi.json', (req, res) => res.json(openapi));

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Liveness: register before /api rate limit so probes are never throttled; always 200 for ELB
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Rate limiting (only real API routes; avoids edge cases with /api-docs)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS'
});
app.use('/api/', limiter);

// Routes (DB-backed: fail fast with 503 + clear message instead of opaque 500)
app.use('/api/payment', requireMongo, require('./routes/payment'));
app.use('/api/orders', requireMongo, require('./routes/orders'));
app.use('/api/users', requireMongo, require('./routes/users'));
app.use('/api/categories', requireMongo, require('./routes/categories'));
app.use('/api/food-items', requireMongo, require('./routes/foodItems'));
app.use('/api/delivery-agents', requireMongo, require('./routes/deliveryAgents'));
app.use('/api/admin/reset', requireMongo, require('./routes/adminReset'));
app.use('/api/admin/seed', requireMongo, require('./routes/adminSeed'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  applyCorsHeaders(req, res);
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler (no path pattern — catches only unmatched requests)
app.use((req, res) => {
  applyCorsHeaders(req, res);
  res.status(404).json({ error: 'Route not found' });
});

// Bind all interfaces — required on Elastic Beanstalk so nginx can reach the app
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
