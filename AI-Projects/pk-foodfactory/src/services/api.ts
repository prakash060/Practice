import axios from 'axios';
import { getStoredToken, triggerUnauthorized } from '../lib/authSession';

function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  if (trimmed) {
    return trimmed.replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '/api';
  }
  // Production static hosting (e.g. S3): localhost would mean "this phone/tablet", not your server.
  console.warn(
    'VITE_API_URL was not set at build time. Set GitHub secret VITE_API_URL to your API base (e.g. http://your-env.elasticbeanstalk.com/api) and rebuild.'
  );
  return '';
}

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? '');
    const isAuthRoute = url.includes('/users/login') || url.includes('/users/register');
    if (status === 401 && !isAuthRoute) {
      triggerUnauthorized();
    }
    return Promise.reject(error);
  }
);

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItemDoc {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryDoc {
  id: string;
  name: string;
  label: string;
  emoji: string;
  accent: string;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterResponse extends UserPublic {
  token: string;
}

export interface LoginResponse {
  user: UserPublic;
  token: string;
}

// Types
interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CreateOrderRequest {
  amount: number;
  currency?: string;
  items: OrderItem[];
  customerDetails?: CustomerDetails;
}

export interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
  /** When true, backend skipped Razorpay; complete flow by calling verify with any placeholder ids. */
  checkoutDummy?: boolean;
}

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  orderId: string;
  paymentId: string;
  message: string;
}

interface OrderStatusResponse {
  orderId: string;
  paymentStatus: string;
  totalAmount: number;
  items: OrderItem[];
}

export type OrderDoc = {
  orderId: string;
  userId?: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  paymentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  customerDetails?: CustomerDetails;
  createdAt: string;
  updatedAt: string;
};

// Payment API calls
export const paymentAPI = {
  createOrder: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await api.post('/payment/create-order', orderData);
    return response.data;
  },

  verifyPayment: async (paymentData: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
    const response = await api.post('/payment/verify', paymentData);
    return response.data;
  },

  getOrderStatus: async (orderId: string): Promise<OrderStatusResponse> => {
    const response = await api.get(`/payment/order/${orderId}`);
    return response.data;
  },
};

// Orders API calls
export const ordersAPI = {
  /** Creates Razorpay order + DB row (requires auth; order linked to user). */
  createCheckoutOrder: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await api.post<CreateOrderResponse>('/orders/checkout', orderData);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getMyOrders: async (): Promise<OrderDoc[]> => {
    const response = await api.get<OrderDoc[]>('/orders/my');
    return response.data;
  },

  getOrder: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export const authAPI = {
  register: async (body: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/users/register', body);
    return response.data;
  },

  login: async (body: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/users/login', body);
    return response.data;
  },

  getMe: async (): Promise<UserPublic> => {
    const response = await api.get<UserPublic>('/users/me');
    return response.data;
  },

  updateMe: async (body: { name: string; phone: string; address: string }): Promise<UserPublic> => {
    const response = await api.put<UserPublic>('/users/me', body);
    return response.data;
  },
};

export interface FoodItemInput {
  category: string;
  name: string;
  description?: string;
  price?: number;
  /** Optional image file. If omitted, `imageUrl` is used (or null = use default). */
  image?: File | null;
  /** Optional URL fallback when no file is provided. Pass null to clear. */
  imageUrl?: string | null;
}

function buildFoodItemForm(body: FoodItemInput): FormData {
  const fd = new FormData();
  fd.append('category', body.category);
  fd.append('name', body.name);
  if (body.description !== undefined) fd.append('description', body.description);
  if (body.price !== undefined) fd.append('price', String(body.price));
  if (body.image) {
    fd.append('image', body.image);
  } else if (body.imageUrl !== undefined) {
    fd.append('imageUrl', body.imageUrl === null ? '' : body.imageUrl);
  }
  return fd;
}

// Letting axios/browser set Content-Type itself adds the multipart boundary.
// We can't pre-set 'multipart/form-data' or the request body becomes unparseable.
const multipartConfig = {
  headers: { 'Content-Type': undefined as unknown as string },
};

export const foodItemsAPI = {
  list: async (category?: string): Promise<FoodItemDoc[]> => {
    const response = await api.get<FoodItemDoc[]>('/food-items', {
      params: category ? { category } : undefined,
    });
    return response.data;
  },

  create: async (body: FoodItemInput): Promise<FoodItemDoc> => {
    const response = await api.post<FoodItemDoc>(
      '/food-items',
      buildFoodItemForm(body),
      multipartConfig
    );
    return response.data;
  },

  update: async (id: string, body: Partial<FoodItemInput>): Promise<FoodItemDoc> => {
    const response = await api.put<FoodItemDoc>(
      `/food-items/${id}`,
      buildFoodItemForm(body as FoodItemInput),
      multipartConfig
    );
    return response.data;
  },

  remove: async (id: string): Promise<{ success: boolean; id: string }> => {
    const response = await api.delete<{ success: boolean; id: string }>(`/food-items/${id}`);
    return response.data;
  },
};

export interface CategoryInput {
  name: string;
  label?: string;
  emoji?: string;
  accent?: string;
  image?: File | null;
  imageUrl?: string | null;
}

function buildCategoryForm(body: CategoryInput): FormData {
  const fd = new FormData();
  fd.append('name', body.name);
  if (body.label !== undefined) fd.append('label', body.label);
  if (body.emoji !== undefined) fd.append('emoji', body.emoji);
  if (body.accent !== undefined) fd.append('accent', body.accent);
  if (body.image) {
    fd.append('image', body.image);
  } else if (body.imageUrl !== undefined) {
    fd.append('imageUrl', body.imageUrl === null ? '' : body.imageUrl);
  }
  return fd;
}

export const categoriesAPI = {
  list: async (): Promise<CategoryDoc[]> => {
    const response = await api.get<CategoryDoc[]>('/categories');
    return response.data;
  },

  create: async (body: CategoryInput): Promise<CategoryDoc> => {
    const response = await api.post<CategoryDoc>(
      '/categories',
      buildCategoryForm(body),
      multipartConfig
    );
    return response.data;
  },

  update: async (id: string, body: Partial<CategoryInput>): Promise<CategoryDoc> => {
    const response = await api.put<CategoryDoc>(
      `/categories/${id}`,
      buildCategoryForm(body as CategoryInput),
      multipartConfig
    );
    return response.data;
  },

  remove: async (id: string): Promise<{ success: boolean; id: string; itemsDeleted: number }> => {
    const response = await api.delete<{ success: boolean; id: string; itemsDeleted: number }>(
      `/categories/${id}`
    );
    return response.data;
  },
};

export default api;