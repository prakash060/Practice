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
const PORT = process.env.PORT || 5000;

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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pk-foodfactory')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Swagger UI (must use split mount: static assets + GET handler — see swagger-ui-express README)
const swaggerOptions = { customSiteTitle: 'PK Food Factory API' };
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
