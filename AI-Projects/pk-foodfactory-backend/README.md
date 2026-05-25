# PK Food Factory Backend

Backend API for PK Food Factory with Razorpay payment integration.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Fill in your Razorpay credentials and other configuration

3. **MongoDB Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env`

4. **Razorpay Setup**
   - Sign up at https://razorpay.com
   - Get your API keys from the dashboard
   - Set up webhook endpoint: `https://yourdomain.com/api/payment/webhook`

5. **Start Server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Payment
- `POST /api/orders/checkout` - Initiate checkout (Razorpay order + checkout intent; requires auth)
- `POST /api/payment/create-order` - Legacy alias for checkout initiate (requires auth)
- `POST /api/payment/verify` - Verify payment signature and create order (requires auth)
- `POST /api/payment/webhook` - Handle Razorpay webhooks
- `GET /api/payment/order/:orderId` - Get order status

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId` - Get specific order
- `PUT /api/orders/:orderId/status` - Update order status

## Webhook Configuration

1. In Razorpay Dashboard, go to Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret to `.env` as `RAZORPAY_WEBHOOK_SECRET`

## Checkout flow

1. Client calls `POST /api/orders/checkout` with cart items and total (Bearer token).
2. Server creates a Razorpay order and a `CheckoutIntent` (no PK order yet).
3. Client opens Razorpay Checkout; on success, client calls `POST /api/payment/verify`.
4. Server verifies the signature, creates the `Order` with `paymentStatus: paid`, and assigns a delivery agent.
5. Razorpay webhooks (`payment.captured` / `payment.failed`) provide a backup path if the client verify call fails.

## OTP: Email and SMS setup (signup / password reset)

Signup and credential reset send a **6-digit code to email and SMS**. Configuration lives in `.env` (see `.env.example`).

On server start, logs show `Email OTP: …` and `SMS OTP: …` (configured vs dev-only). No secrets are printed.

### Email — Gmail SMTP (free, ~500/day)

Already supported via nodemailer in `services/emailService.js`.

1. Use a Gmail account with **2-Step Verification** enabled.
2. Create an **App Password**: [Google App Passwords](https://myaccount.google.com/apppasswords) (16 characters).
3. In `.env`:

   ```env
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_16_char_app_password
   EMAIL_FROM="SVI Foods <your_gmail@gmail.com>"
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   ```

4. Do **not** use placeholder values (`your_gmail`, `your_email`, `your_16_char_app_password`) — the server treats those as “not configured”.

### SMS — MSG91 (India, recommended)

Supported when `SMS_PROVIDER=msg91` in `services/smsService.js`.

1. Sign up at [msg91.com](https://msg91.com).
2. In the dashboard, create a **Flow / OTP** template with **one variable** for the code (often `##var##` in the template editor).
3. Example template text for approval:  
   `Your SVI Foods verification code is ##var##. Valid for 10 minutes.`
4. Copy **Auth Key** and **Template ID** into `.env`:

   ```env
   SMS_PROVIDER=msg91
   MSG91_AUTH_KEY=your_authkey
   MSG91_TEMPLATE_ID=your_template_id
   ```

5. **Production (India):** register on **DLT** (entity, sender ID, template). Without DLT approval, carriers may block transactional SMS. MSG91 dashboard guides this process.

6. Indian mobile numbers are sent as `91` + last 10 digits; enter 10-digit numbers in the app (e.g. `9886499444`).

### SMS — Twilio (optional, trial)

For quick tests outside MSG91, set `SMS_PROVIDER=twilio` and:

```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM=+1...
```

Trial accounts can usually SMS **verified** numbers only. Not ideal as primary India OTP.

### Development vs production

| Variable | Local dev | Production |
|----------|-----------|------------|
| `OTP_DEV_LOG` | `true` (fallback console + UI dev codes if send fails) | `false` |
| `NODE_ENV` | `development` (default) | `production` |

When both email and SMS send successfully, API responses omit `devOtp` and the signup UI hides the yellow dev banner.

### Troubleshooting

| Symptom | Check |
|---------|--------|
| Yellow “Local development” banner with codes | SMTP or MSG91 not configured, or send failed — fix `.env`, restart `npm start` |
| Email never arrives | App Password (not Gmail password), less secure apps not needed if using App Password |
| SMS never arrives | `SMS_PROVIDER=msg91`, valid `MSG91_*` keys, DLT/template approved, check server log for `MSG91 failed:` |
| “Invalid verification code” | Use latest codes; **Resend** invalidates previous codes; email and SMS codes differ in production |
| `409` on signup start | Email or phone already registered — sign in or use different details |

### Security

- Keep `.env` out of git (use `.env.example` only as a template).
- Rotate `MSG91_AUTH_KEY`, Gmail App Password, and `JWT_SECRET` if exposed.

### Manual setup checklist

1. `cp .env.example .env` (or merge new OTP variables into your existing `.env`).
2. Set Gmail App Password and MSG91 keys.
3. Set `SMS_PROVIDER=msg91`.
4. Restart the backend.
5. Complete signup with your email and Indian mobile; confirm inbox and SMS.

## Testing

Use Razorpay test keys for development:
- Key ID: `rzp_test_...`
- Key Secret: `...`

Test card details:
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: 123