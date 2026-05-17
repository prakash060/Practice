const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./swagger/openapi');
const { handleRazorpayWebhook, isPlaceholderKey } = require('./services/checkoutOrder');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  if (
    isPlaceholderKey(process.env.RAZORPAY_KEY_ID) ||
    isPlaceholderKey(process.env.RAZORPAY_KEY_SECRET)
  ) {
    console.error(
      'WARN: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are missing or placeholder in production.'
    );
  }
}

app.set('trust proxy', 1);

// Swagger UI uses inline scripts/styles; relax CSP so the docs page works.
// COOP is omitted: on HTTP (common on EB before HTTPS) browsers ignore it and log a console warning.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false
}));

app.use(
  cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token', 'x-auth-token'],
    exposedHeaders: ['Authorization'],
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler (no path pattern — catches only unmatched requests)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Bind all interfaces — required on Elastic Beanstalk so nginx can reach the app
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
