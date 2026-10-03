import { Order, OrderStatus, Customer, Address } from '../types';
import { mockOrders } from '../data/mockOrders';
import { apiFetch } from '../lib/api';

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  ref?: string;
  search?: string;
  status?: OrderStatus | 'all';
  dateRange?: string;
}

export interface CreateOrderPayload {
  items: Array<{
    productId?: string;
    productCode?: string;
    variantId?: string;
    sku?: string;
    quantity: number;
  }>;
  customer: Customer;
  shippingAddress: Address;
  customerPincode: string;
  warehousePincode?: string;
  notes?: string;
}

export interface OrderQuoteResponse {
  success: boolean;
  itemTotal: number;
  shippingCharges: number;
  totalPayable: number;
  currency: string;
  items: Array<{
    sku: string;
    dropshipPrice: number;
    quantity: number;
    subtotal: number;
  }>;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string; // OWB-DS-######
  orderNumber: string;
  razorpay?: {
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
  };
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  orderId: string;
  status: string;
}

export const ordersService = {
  /**
   * POST /api/dropshipper/orders/quote
   * Price + shipping preview
   */
  async getOrderQuote(payload: any): Promise<OrderQuoteResponse> {
    const res = await apiFetch('/api/dropshipper/orders/quote', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to calculate order quote');
    }
    return await res.json();
  },

  /**
   * POST /api/dropshipper/orders
   * Create order + Razorpay start
   * Response: { razorpay: { keyId, orderId, amount, currency } }
   */
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const res = await apiFetch('/api/dropshipper/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return await res.json();
    }

    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to create order on server');
  },

  /**
   * POST /api/dropshipper/orders/verify-payment
   * Payment ke baad verify with Razorpay signature
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
    const res = await apiFetch('/api/dropshipper/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return await res.json();
    }

    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Payment verification failed');
  },

  /**
   * GET /api/dropshipper/orders?page&limit&ref
   * My orders list
   */
  async getOrders(params?: OrderFilterParams): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.ref) query.set('ref', params.ref);

    try {
      const response = await apiFetch(`/api/dropshipper/orders?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.orders || data.data || [];
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Backend orders API offline, using fallback mock list', e);
    }

    // Fallback filter on mock orders
    let results = [...mockOrders];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      results = results.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.item.productName.toLowerCase().includes(q) ||
          o.item.sku.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== 'all') {
      results = results.filter((o) => o.status === params.status);
    }

    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * GET /api/dropshipper/orders/:orderId
   * Order detail
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const res = await apiFetch(`/api/dropshipper/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        return data.order || data.data || data;
      }
    } catch (e) {
      console.warn('Backend order detail API error', e);
    }
    const found = mockOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    return found ? { ...found } : null;
  }
};
