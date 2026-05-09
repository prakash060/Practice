import axios from 'axios';
import { getStoredToken, triggerUnauthorized } from '../lib/authSession';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

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
  createdAt: string;
  updatedAt: string;
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

interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
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
  getAllOrders: async () => {
    const response = await api.get('/orders');
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

export default api;