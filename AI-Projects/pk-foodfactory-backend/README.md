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
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment
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

## Testing

Use Razorpay test keys for development:
- Key ID: `rzp_test_...`
- Key Secret: `...`

Test card details:
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: 123