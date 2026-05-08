import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;