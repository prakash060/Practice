/**
 * OpenAPI 3.0 spec for PK Food Factory API (Swagger UI).
 * Server URL '/' resolves to the site origin (Swagger UI: new URL('/', location.href)).
 */
const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'PK Food Factory API',
    version: '1.0.0',
    description:
      'Food ordering, Razorpay payments, orders, and user registration. Use **Try it out** to call endpoints.',
  },
  servers: [{ url: '/', description: 'Current server' }],
  tags: [
    { name: 'Health', description: 'Service health' },
    { name: 'Users', description: 'Registration, login, profile (JWT)' },
    { name: 'Payment', description: 'Razorpay payment flow' },
    { name: 'Orders', description: 'Orders CRUD' },
    { name: 'FoodItems', description: 'Menu items (public list; admin-only writes)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste a token from POST /api/users/login or register response',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      RegisterUserRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'phone', 'address'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120, example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', format: 'password', minLength: 8, example: 'password12' },
          phone: {
            type: 'string',
            description: '10–15 digits; spaces/dashes allowed',
            example: '9876543210',
          },
          address: {
            type: 'string',
            minLength: 10,
            maxLength: 500,
            example: '123 Main Street, Bengaluru, Karnataka 560001',
          },
        },
      },
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          address: { type: 'string' },
          isAdmin: {
            type: 'boolean',
            description: 'True when the user email matches the configured ADMIN_EMAIL',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      FoodItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          category: { type: 'string', enum: ['Biryani', 'Icecream', 'Chats', 'Pizza', 'Sweets'] },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          imageUrl: {
            type: 'string',
            nullable: true,
            description: 'HTTPS URL, base64 data URL, or null (UI shows category default).',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterResponse: {
        allOf: [
          { $ref: '#/components/schemas/UserPublic' },
          {
            type: 'object',
            required: ['token'],
            properties: { token: { type: 'string' } },
          },
        ],
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      LoginResponse: {
        type: 'object',
        required: ['user', 'token'],
        properties: {
          user: { $ref: '#/components/schemas/UserPublic' },
          token: { type: 'string' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        required: ['name', 'phone', 'address'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120 },
          phone: { type: 'string' },
          address: { type: 'string', minLength: 10, maxLength: 500 },
        },
      },
      OrderItem: {
        type: 'object',
        required: ['foodId', 'name', 'price', 'quantity'],
        properties: {
          foodId: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'integer', minimum: 1 },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['amount', 'items'],
        properties: {
          amount: {
            type: 'number',
            description: 'Total in INR (must match subtotal + delivery fee (0) + 5% tax)',
            example: 152,
          },
          currency: { type: 'string', example: 'INR' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          customerDetails: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
            },
          },
        },
      },
      CreateOrderResponse: {
        type: 'object',
        properties: {
          orderId: { type: 'string' },
          razorpayOrderId: { type: 'string' },
          amount: { type: 'number', description: 'Amount in paise' },
          currency: { type: 'string' },
          key: { type: 'string', description: 'Razorpay key id' },
          checkoutDummy: {
            type: 'boolean',
            description: 'True when DUMMY_PAYMENT_MODE is on (no live Razorpay order)',
          },
        },
      },
      VerifyPaymentRequest: {
        type: 'object',
        required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
        properties: {
          razorpay_order_id: { type: 'string' },
          razorpay_payment_id: { type: 'string' },
          razorpay_signature: { type: 'string' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'OK' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } },
          },
        },
      },
    },
    '/api/users/register': {
      post: {
        tags: ['Users'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterUserRequest' } } },
        },
        responses: {
          '201': {
            description: 'Created (includes JWT)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '409': { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users/login': {
      post: {
        tags: ['Users'],
        summary: 'Log in',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': {
            description: 'JWT + user',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPublic' } } },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update profile (name, phone, address)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } },
        },
        responses: {
          '200': {
            description: 'Updated profile',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPublic' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List all registered users',
        description: 'Requires Bearer token. Passwords are never returned.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/UserPublic' } },
              },
            },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/payment/create-order': {
      post: {
        tags: ['Payment'],
        summary: 'Create Razorpay order + DB order',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } },
        },
        responses: {
          '200': {
            description: 'Order created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderResponse' } } },
          },
          '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/payment/verify': {
      post: {
        tags: ['Payment'],
        summary: 'Verify payment signature',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyPaymentRequest' } } },
        },
        responses: {
          '200': { description: 'Verified' },
          '400': { description: 'Invalid signature', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/payment/webhook': {
      post: {
        tags: ['Payment'],
        summary: 'Razorpay webhook',
        description: 'Requires valid `x-razorpay-signature` header.',
        responses: {
          '200': { description: 'OK' },
          '400': { description: 'Invalid signature' },
          '500': { description: 'Server error' },
        },
      },
    },
    '/api/payment/order/{orderId}': {
      get: {
        tags: ['Payment'],
        summary: 'Get order payment status by PK orderId',
        parameters: [
          { name: 'orderId', in: 'path', required: true, schema: { type: 'string' }, example: 'PK1234567890' },
        ],
        responses: {
          '200': { description: 'Order status' },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/orders/checkout': {
      post: {
        tags: ['Orders'],
        summary: 'Create checkout order (Razorpay + DB)',
        description:
          'Requires Bearer token. Saves order linked to the current user; merges profile into customer details when form fields are empty. With DUMMY_PAYMENT_MODE, skips live Razorpay order creation.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } },
        },
        responses: {
          '200': {
            description: 'Order created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderResponse' } } },
          },
          '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List all orders',
        responses: {
          '200': { description: 'Array of orders' },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/orders/{orderId}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by PK orderId',
        parameters: [
          { name: 'orderId', in: 'path', required: true, schema: { type: 'string' }, example: 'PK1234567890' },
        ],
        responses: {
          '200': { description: 'Order document' },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/food-items': {
      get: {
        tags: ['FoodItems'],
        summary: 'List food items',
        parameters: [
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['Biryani', 'Icecream', 'Chats', 'Pizza', 'Sweets'] },
          },
        ],
        responses: {
          '200': {
            description: 'List of food items',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/FoodItem' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['FoodItems'],
        summary: 'Create a food item (admin only)',
        description:
          'Multipart form. Provide `image` file (optional) OR `imageUrl` string. Requires Bearer token whose email matches ADMIN_EMAIL.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['category', 'name'],
                properties: {
                  category: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  imageUrl: { type: 'string', nullable: true },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FoodItem' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Admin access required' },
        },
      },
    },
    '/api/food-items/{id}': {
      put: {
        tags: ['FoodItems'],
        summary: 'Update a food item (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  imageUrl: { type: 'string', nullable: true },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FoodItem' } } },
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Admin access required' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        tags: ['FoodItems'],
        summary: 'Delete a food item (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Deleted' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Admin access required' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/orders/{orderId}/status': {
      put: {
        tags: ['Orders'],
        summary: 'Update order payment status',
        parameters: [
          { name: 'orderId', in: 'path', required: true, schema: { type: 'string' }, example: 'PK1234567890' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', example: 'paid' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated order' },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};

module.exports = openapi;
