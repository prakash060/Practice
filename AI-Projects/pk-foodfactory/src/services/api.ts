import axios from 'axios';
import { getStoredToken, triggerUnauthorized } from '../lib/authSession';
import { getStoredAgentToken, triggerAgentUnauthorized } from '../lib/agentSession';

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
    'VITE_API_URL was not set at build time. Set GitHub secret VITE_API_URL to your HTTPS API CloudFront base (e.g. https://your-api.cloudfront.net/api) and rebuild.'
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

export type AuthType = 'password' | 'pin' | 'otp';

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  authType?: AuthType;
  emailVerified?: boolean;
  phoneVerified?: boolean;
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

export type DeliveryVehicleType = 'Bike' | 'Scooter' | 'Bicycle' | 'Car' | 'Other';
export type DeliveryAgentStatus = 'active' | 'inactive';

export interface DeliveryAgentDoc {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: DeliveryVehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  address: string;
  photoUrl: string | null;
  status: DeliveryAgentStatus;
  notes: string;
  /** True when an admin has set a login passcode for this agent (admin views only). */
  hasPasscode?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryAgentPublic {
  id: string;
  name: string;
  phone: string;
  photoUrl: string | null;
  vehicleType: DeliveryVehicleType;
  vehicleNumber: string;
}

export type DeliveryStatus =
  | 'unassigned'
  | 'assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'not_delivered';

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
  deliveryAgentId?: string | null;
  deliveryAgent?: DeliveryAgentPublic | null;
  deliveryStatus?: DeliveryStatus;
  deliveryNotes?: string;
  deliveryStatusUpdatedAt?: string | null;
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
  /** Initiates Razorpay checkout; PK order is created after payment verify. */
  createCheckoutOrder: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await api.post<CreateOrderResponse>('/orders/checkout', orderData);
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

export interface DevOtpHint {
  email?: string;
  phone?: string;
  channel?: 'email' | 'phone';
  code?: string;
}

export interface OtpSessionResponse {
  sessionToken: string;
  message: string;
  channel?: 'email' | 'phone';
  devOtp?: DevOtpHint;
}

export interface LoginStartResponse {
  message: string;
  sessionToken?: string;
  channel?: 'email' | 'phone';
  devOtp?: DevOtpHint;
}

export interface OtpResendResponse {
  message: string;
  channel?: 'email' | 'phone';
  devOtp?: DevOtpHint;
}

export const authAPI = {
  signupStart: async (body: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }): Promise<OtpSessionResponse> => {
    const response = await api.post<OtpSessionResponse>('/auth/signup/start', body);
    return response.data;
  },

  signupSendOtp: async (sessionToken: string): Promise<OtpResendResponse> => {
    const response = await api.post<OtpResendResponse>('/auth/signup/send-otp', {
      sessionToken,
    });
    return response.data;
  },

  signupVerifyOtp: async (
    sessionToken: string,
    emailOtp: string,
    phoneOtp: string
  ): Promise<{ verified: boolean }> => {
    const response = await api.post<{ verified: boolean }>('/auth/signup/verify-otp', {
      sessionToken,
      emailOtp,
      phoneOtp,
    });
    return response.data;
  },

  signupComplete: async (body: {
    sessionToken: string;
    authType?: AuthType;
    password?: string;
    pin?: string;
  }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/signup/complete', body);
    return response.data;
  },

  loginStart: async (identifier: string): Promise<LoginStartResponse> => {
    const response = await api.post<LoginStartResponse>('/auth/login/start', { identifier });
    return response.data;
  },

  loginSendOtp: async (sessionToken: string): Promise<OtpResendResponse> => {
    const response = await api.post<OtpResendResponse>('/auth/login/send-otp', { sessionToken });
    return response.data;
  },

  loginVerifyOtp: async (sessionToken: string, otp: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login/verify-otp', {
      sessionToken,
      otp,
    });
    return response.data;
  },

  resetCredentialsStart: async (body: {
    email: string;
    phone: string;
  }): Promise<OtpSessionResponse> => {
    const response = await api.post<OtpSessionResponse>('/auth/credentials/reset/start', body);
    return response.data;
  },

  resetSendOtp: async (sessionToken: string): Promise<OtpResendResponse> => {
    const response = await api.post<OtpResendResponse>('/auth/credentials/reset/send-otp', {
      sessionToken,
    });
    return response.data;
  },

  resetVerifyOtp: async (
    sessionToken: string,
    emailOtp: string,
    phoneOtp: string
  ): Promise<{ verified: boolean }> => {
    const response = await api.post<{ verified: boolean }>(
      '/auth/credentials/reset/verify-otp',
      { sessionToken, emailOtp, phoneOtp }
    );
    return response.data;
  },

  resetComplete: async (body: {
    sessionToken: string;
    authType: AuthType;
    password?: string;
    pin?: string;
  }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/credentials/reset/complete', body);
    return response.data;
  },

  login: async (body: {
    identifier: string;
    secret: string;
    loginMode: 'password' | 'pin';
  }): Promise<LoginResponse> => {
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

function buildFoodItemForm(body: Partial<FoodItemInput>): FormData {
  const fd = new FormData();
  if (body.category !== undefined) fd.append('category', body.category);
  if (body.name !== undefined) fd.append('name', body.name);
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
      buildFoodItemForm(body),
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

function buildCategoryForm(body: Partial<CategoryInput>): FormData {
  const fd = new FormData();
  if (body.name !== undefined) fd.append('name', body.name);
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
      buildCategoryForm(body),
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

export interface DeliveryAgentInput {
  name: string;
  phone: string;
  email?: string;
  vehicleType?: DeliveryVehicleType;
  vehicleNumber?: string;
  licenseNumber?: string;
  address?: string;
  notes?: string;
  status?: DeliveryAgentStatus;
  /** 4–8 digit login PIN. Pass '' (empty string) to clear an existing passcode. */
  passcode?: string;
  photo?: File | null;
  photoUrl?: string | null;
}

function buildDeliveryAgentForm(body: Partial<DeliveryAgentInput>): FormData {
  const fd = new FormData();
  if (body.name !== undefined) fd.append('name', body.name);
  if (body.phone !== undefined) fd.append('phone', body.phone);
  if (body.email !== undefined) fd.append('email', body.email);
  if (body.vehicleType !== undefined) fd.append('vehicleType', body.vehicleType);
  if (body.vehicleNumber !== undefined) fd.append('vehicleNumber', body.vehicleNumber);
  if (body.licenseNumber !== undefined) fd.append('licenseNumber', body.licenseNumber);
  if (body.address !== undefined) fd.append('address', body.address);
  if (body.notes !== undefined) fd.append('notes', body.notes);
  if (body.status !== undefined) fd.append('status', body.status);
  if (body.passcode !== undefined) fd.append('passcode', body.passcode);
  if (body.photo) {
    fd.append('photo', body.photo);
  } else if (body.photoUrl !== undefined) {
    fd.append('photoUrl', body.photoUrl === null ? '' : body.photoUrl);
  }
  return fd;
}

export const deliveryAgentsAPI = {
  list: async (status?: DeliveryAgentStatus): Promise<DeliveryAgentDoc[]> => {
    const response = await api.get<DeliveryAgentDoc[]>('/delivery-agents', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  get: async (id: string): Promise<DeliveryAgentDoc> => {
    const response = await api.get<DeliveryAgentDoc>(`/delivery-agents/${id}`);
    return response.data;
  },

  create: async (body: DeliveryAgentInput): Promise<DeliveryAgentDoc> => {
    const response = await api.post<DeliveryAgentDoc>(
      '/delivery-agents',
      buildDeliveryAgentForm(body),
      multipartConfig
    );
    return response.data;
  },

  update: async (id: string, body: Partial<DeliveryAgentInput>): Promise<DeliveryAgentDoc> => {
    const response = await api.put<DeliveryAgentDoc>(
      `/delivery-agents/${id}`,
      buildDeliveryAgentForm(body),
      multipartConfig
    );
    return response.data;
  },

  remove: async (id: string): Promise<{ success: boolean; id: string }> => {
    const response = await api.delete<{ success: boolean; id: string }>(`/delivery-agents/${id}`);
    return response.data;
  },
};

// =============================================================
// Admin orders (list + delivery / payment updates)
// =============================================================

export interface AdminOrderDeliveryUpdate {
  deliveryStatus?: DeliveryStatus;
  deliveryAgentId?: string | null;
  deliveryNotes?: string;
  paymentStatus?: OrderDoc['paymentStatus'];
  autoAssign?: boolean;
}

export const adminOrdersAPI = {
  list: async (): Promise<OrderDoc[]> => {
    const response = await api.get<OrderDoc[]>('/admin/orders');
    return response.data;
  },

  updateDelivery: async (
    orderId: string,
    body: AdminOrderDeliveryUpdate
  ): Promise<OrderDoc> => {
    const response = await api.patch<OrderDoc>(`/admin/orders/${orderId}/delivery`, body);
    return response.data;
  },
};

// =============================================================
// Admin reset (destructive bulk-clear, admin only)
// =============================================================

export interface ResetSummary {
  categories: number;
  foodItems: number;
  orders: number;
  deliveryAgents: number;
  /** Count of deletable user accounts (excludes signed-in admin + ADMIN_EMAIL). */
  users: number;
}

export interface ResetResponse {
  success: boolean;
  scope: 'delivery-agents' | 'categories' | 'food-items' | 'orders' | 'users' | 'all';
  categories?: number;
  foodItems?: number;
  orders?: number;
  deliveryAgents?: number;
  users?: number;
}

export const adminResetAPI = {
  summary: async (): Promise<ResetSummary> => {
    const response = await api.get<ResetSummary>('/admin/reset/summary');
    return response.data;
  },

  deliveryAgents: async (): Promise<ResetResponse> => {
    const response = await api.post<ResetResponse>('/admin/reset/delivery-agents');
    return response.data;
  },

  categories: async (): Promise<ResetResponse> => {
    const response = await api.post<ResetResponse>('/admin/reset/categories');
    return response.data;
  },

  foodItems: async (): Promise<ResetResponse> => {
    const response = await api.post<ResetResponse>('/admin/reset/food-items');
    return response.data;
  },

  orders: async (): Promise<ResetResponse> => {
    const response = await api.post<ResetResponse>('/admin/reset/orders');
    return response.data;
  },

  users: async (): Promise<ResetResponse> => {
    const response = await api.post<ResetResponse>('/admin/reset/users');
    return response.data;
  },

  all: async (confirm: string): Promise<ResetResponse> => {
    const response = await api.post<ResetResponse>('/admin/reset/all', { confirm });
    return response.data;
  },
};

// =============================================================
// Admin seed (isolated, removable demo-data generator, admin only)
// =============================================================

export interface SeedRandomResponse {
  success: boolean;
  categoriesCreated: number;
  itemsCreated: number;
  categories: { name: string; itemCount: number }[];
}

export interface SeedAgentsResponse {
  success: boolean;
  agentsCreated: number;
  demoPasscode: string;
  agents: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
  }[];
}

export const adminSeedAPI = {
  random: async (): Promise<SeedRandomResponse> => {
    const response = await api.post<SeedRandomResponse>('/admin/seed/random');
    return response.data;
  },

  agents: async (): Promise<SeedAgentsResponse> => {
    const response = await api.post<SeedAgentsResponse>('/admin/seed/agents');
    return response.data;
  },
};

// =============================================================
// Delivery agent self-service (separate token, separate axios client)
// =============================================================

const agentApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

agentApi.interceptors.request.use((config) => {
  const token = getStoredAgentToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

agentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? '');
    const isAuthRoute = url.includes('/delivery-agents/auth/login');
    if (status === 401 && !isAuthRoute) {
      triggerAgentUnauthorized();
    }
    return Promise.reject(error);
  }
);

export interface AgentLoginResponse {
  token: string;
  agent: DeliveryAgentDoc;
}

export const agentAuthAPI = {
  login: async (body: { phone: string; passcode: string }): Promise<AgentLoginResponse> => {
    const response = await agentApi.post<AgentLoginResponse>('/delivery-agents/auth/login', body);
    return response.data;
  },

  me: async (): Promise<DeliveryAgentDoc> => {
    const response = await agentApi.get<DeliveryAgentDoc>('/delivery-agents/me');
    return response.data;
  },
};

export const agentOrdersAPI = {
  list: async (): Promise<OrderDoc[]> => {
    const response = await agentApi.get<OrderDoc[]>('/delivery-agents/me/orders');
    return response.data;
  },

  updateStatus: async (
    orderId: string,
    body: { status: DeliveryStatus; notes?: string }
  ): Promise<{
    orderId: string;
    deliveryStatus: DeliveryStatus;
    deliveryNotes: string;
    deliveryStatusUpdatedAt: string;
  }> => {
    const response = await agentApi.post(`/delivery-agents/me/orders/${orderId}/status`, body);
    return response.data;
  },
};

export default api;