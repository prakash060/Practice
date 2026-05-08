const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pk-foodfactory')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));

const API_ROUTES = [
  {
    method: 'GET',
    path: '/api/health',
    description: 'Health check'
  },
  {
    method: 'POST',
    path: '/api/payment/create-order',
    description: 'Create payment order (creates DB order + Razorpay order)'
  },
  {
    method: 'POST',
    path: '/api/payment/verify',
    description: 'Verify Razorpay payment signature and mark order paid'
  },
  {
    method: 'POST',
    path: '/api/payment/webhook',
    description: 'Razorpay webhook handler'
  },
  {
    method: 'GET',
    path: '/api/payment/order/:orderId',
    description: 'Get payment/order status by PK orderId'
  },
  {
    method: 'GET',
    path: '/api/orders',
    description: 'List all orders'
  },
  {
    method: 'GET',
    path: '/api/orders/:orderId',
    description: 'Get order by PK orderId'
  },
  {
    method: 'PUT',
    path: '/api/orders/:orderId/status',
    description: 'Update order paymentStatus'
  }
];

function renderExplorerHtml() {
  const rows = API_ROUTES.map(r => {
    const href = r.method === 'GET'
      ? r.path.replace(':orderId', 'PK1234567890')
      : null;

    const link = href ? `<a href="${href}">${r.path}</a>` : r.path;

    return `
      <tr>
        <td><span class="badge ${r.method}">${r.method}</span></td>
        <td class="path">${link}</td>
        <td class="desc">${r.description}</td>
      </tr>
    `;
  }).join('');

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>PK Food Factory API</title>
      <style>
        :root { color-scheme: dark; }
        body { margin: 0; font-family: ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial; background: #0b1020; color: #e7eaf3; }
        header { padding: 20px 22px; border-bottom: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.02); }
        h1 { margin: 0; font-size: 18px; letter-spacing: .2px; }
        .sub { margin-top: 6px; color: rgba(231,234,243,.75); font-size: 13px; }
        main { padding: 18px 22px 28px; max-width: 980px; }
        .card { border: 1px solid rgba(255,255,255,.08); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,.02); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,.06); vertical-align: top; text-align: left; }
        th { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: rgba(231,234,243,.7); background: rgba(255,255,255,.03); }
        a { color: #a7c7ff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .path { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 13px; }
        .desc { color: rgba(231,234,243,.85); font-size: 13px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: .03em; }
        .GET { background: rgba(46, 204, 113, .18); color: #7ff0b6; border: 1px solid rgba(46, 204, 113, .25); }
        .POST { background: rgba(52, 152, 219, .18); color: #8fd0ff; border: 1px solid rgba(52, 152, 219, .25); }
        .PUT { background: rgba(241, 196, 15, .14); color: #ffe08a; border: 1px solid rgba(241, 196, 15, .22); }
        .note { margin-top: 14px; font-size: 13px; color: rgba(231,234,243,.75); line-height: 1.45; }
        code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 12px; background: rgba(255,255,255,.06); padding: 2px 6px; border-radius: 6px; }
      </style>
    </head>
    <body>
      <header>
        <h1>PK Food Factory API Explorer</h1>
        <div class="sub">Base URL: <code>${'http://localhost:' + PORT}</code> · JSON index: <a href="/api">/api</a></div>
      </header>
      <main>
        <div class="card">
          <table>
            <thead>
              <tr>
                <th style="width: 90px;">Method</th>
                <th>Path</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
        <div class="note">
          Tip: Only <b>GET</b> endpoints are clickable. For <b>POST/PUT</b>, call them using your frontend or a REST client.
        </div>
      </main>
    </body>
  </html>`;
}

// Explorer (human-friendly)
app.get('/', (req, res) => {
  res.type('html').send(renderExplorerHtml());
});

// Explorer (machine-friendly)
app.get('/api', (req, res) => {
  res.json({
    name: 'PK Food Factory API',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    routes: API_ROUTES
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});