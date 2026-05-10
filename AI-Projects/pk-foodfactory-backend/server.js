const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./swagger/openapi');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

// Swagger UI uses inline scripts/styles; relax CSP so the docs page works.
// COOP is omitted: on HTTP (common on EB before HTTPS) browsers ignore it and log a console warning.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false
}));

app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

function resolveMongoUri() {
  const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();
  if (uri) return uri;
  if (isProd) {
    console.error(
      'WARN: MONGODB_URI is not set — set it in Elastic Beanstalk environment properties. API routes that use the DB will fail until then.'
    );
    return null;
  }
  return 'mongodb://localhost:27017/foodfactory';
}

const mongoUri = resolveMongoUri();
if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      console.error(
        'Atlas: allow EB IPs in Network Access; ensure MONGODB_URI password is URL-encoded if it has special characters.'
      );
    });
}

// Swagger UI (must use split mount: static assets + GET handler — see swagger-ui-express README)
const swaggerOptions = { customSiteTitle: 'Food Factory API' };
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(openapi, swaggerOptions));
app.get('/api-docs/', (req, res) => res.redirect(301, '/api-docs'));
app.get('/openapi.json', (req, res) => res.json(openapi));

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Rate limiting (only real API routes; avoids edge cases with /api-docs)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Liveness: always 200 so Elastic Beanstalk / nginx health checks do not drain the pool
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

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
