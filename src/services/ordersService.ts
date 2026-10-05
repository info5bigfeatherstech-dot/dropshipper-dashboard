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

/** Payload for POST /orders/quote */
export interface OrderQuotePayload {
  items: Array<{ productCode: string; quantity: number }>;
  customerPincode: string;
  warehousePincode?: string;
}

/** Response from POST /orders/quote */
export interface OrderQuoteResponse {
  subtotal: number;
  deliveryCharges: number;
  amountPayable: number;
  tax: number;
  discount: number;
  currency: string;
  items: Array<{
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  shipping: {
    isDeliverable: boolean;
    deliveryCharges: number;
    estimatedDays: string;
    courierName: string;
    codAvailable: boolean;
    message: string;
  };
  package?: { weightKg: number; lengthCm: number; widthCm: number; heightCm: number };
}

/** Payload for POST /orders */
export interface CreateOrderPayload {
  items: Array<{
    productCode: string;  // required by backend (e.g. "2928-1")
    sku?: string;
    quantity: number;
  }>;
  customer: Customer;
  shippingAddress: Address;
  customerPincode: string;
  warehousePincode?: string;
  paymentMethod?: 'online' | 'cod';
  notes?: string;
}

/** Response from POST /orders */
export interface CreateOrderResponse {
  success: boolean;
  orderId: string;    // OWB-DS-######
  orderNumber?: string;
  razorpay?: {
    keyId: string;
    orderId: string;   // Razorpay rzp_order_id
    amount: number;    // in paise
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

/**
 * Normalises the flat backend OWB-DS-* order format into the local Order shape
 * so all UI components can render it without modification.
 */
export function normalizeBackendOrder(raw: any): Order {
  if (!raw) return {} as Order;

  // Build customer from dropshipMeta / addressSnapshot
  const meta = raw.dropshipMeta || {};
  const addr = raw.addressSnapshot || {};
  const customer: Customer = {
    name: meta.customerName || addr.fullName || 'Customer',
    email: meta.customerEmail || '',
    phone: meta.customerPhone || addr.phone || ''
  };

  const shippingAddress: Address = {
    line1: addr.line1 || addr.address || '',
    line2: addr.line2 || '',
    city: addr.city || '',
    state: addr.state || '',
    postalCode: addr.postalCode || '',
    country: addr.country || 'India'
  };

  // Map raw items → OrderItem[]
  const rawItems: any[] = Array.isArray(raw.items) ? raw.items : [];
  const snap = raw.shippingSnapshot || {};

  // Known SKU → product info mapping (from catalog; used as enrichment if info missing from backend)
  const SKU_META: Record<string, { name: string; image: string; price: number }> = {
    'SKU-2928-1': {
      name: 'Toothbrush Protector Cap Cover',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873047/products/zip-toothbrush-protector-cap-cover-2928-1-i0-1788873047623.webp',
      price: 40
    },
    'SKU-2929-1': {
      name: 'Color Naphthalene Balls',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873051/products/zip-color-naphthalene-balls-2929-1-i0-1788873050768.webp',
      price: 30
    },
    'SKU-398-1': {
      name: 'test',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      price: 120
    }
  };

  const orderItems = rawItems.map((ri: any) => {
    const sku = ri.sku || ri.productCode || 'SKU-INVENTORY';
    const priceSnap = ri.priceSnapshot || {};
    const knownMeta = SKU_META[sku] || {};
    return {
      productId: ri.productId || sku,
      productName: ri.productName || knownMeta.name || sku,
      sku,
      image: ri.image || ri.thumbnail || knownMeta.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: Number(priceSnap.sale ?? priceSnap.base ?? knownMeta.price ?? 0),
      quantity: Number(ri.quantity || 1),
      total: Number(priceSnap.total ?? ((priceSnap.sale ?? priceSnap.base ?? 0) * (ri.quantity || 1)))
    };
  });

  const primaryItem = orderItems[0] || {
    productId: 'unknown',
    productName: 'Product',
    sku: 'SKU-INVENTORY',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    dropshipPrice: 0,
    quantity: 1,
    total: 0
  };

  // Map backend orderStatus to local OrderStatus
  const statusMap: Record<string, OrderStatus> = {
    pending: 'pending',
    confirmed: 'approved',
    approved: 'approved',
    processing: 'approved',
    dispatched: 'shipped',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'rejected',
    rejected: 'rejected',
    failed: 'rejected'
  };

  const rawStatus = (raw.orderStatus || raw.status || 'pending').toLowerCase();
  const status: OrderStatus = statusMap[rawStatus] || 'pending';

  const orderId = raw.orderId || raw.id || raw._id || ('OWB-DS-' + Math.floor(Math.random() * 900000 + 100000));

  const timeline = Array.isArray(raw.timeline)
    ? raw.timeline
    : [
        { status: 'created', label: 'Order Placed', timestamp: raw.createdAt || new Date().toISOString() },
        { status, label: status === 'pending' ? 'Pending Approval' : 'Status Updated', timestamp: raw.updatedAt || new Date().toISOString() }
      ];

  return {
    id: orderId,
    orderNumber: orderId,
    customer,
    shippingAddress,
    item: primaryItem,
    items: orderItems,
    status,
    adminNote: raw.adminNote || raw.rejectionReason || undefined,
    rejectionReason: status === 'rejected' ? (raw.rejectionReason || raw.adminNote) : undefined,
    trackingNumber: raw.trackingNumber || snap.trackingNumber || undefined,
    shippingCarrier: snap.courierName || undefined,
    shippingCharges: Number(raw.deliveryCharges || 0),
    shippingPaymentMode: (raw.paymentMethod === 'cod' ? 'cod' : 'prepaid') as 'prepaid' | 'cod',
    estimatedDeliveryDays: snap.estimatedDays || undefined,
    warehousePincode: raw.warehousePincode || undefined,
    shippingProvider: snap.provider || snap.shippingProvider || 'shipmozo',
    notes: raw.notes || meta.notes || undefined,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    timeline
  };
}

export const ordersService = {
  /**
   * POST /api/dropshipper/orders/quote
   * Returns price + shipping preview for given items and pincodes
   */
  async getOrderQuote(payload: OrderQuotePayload): Promise<OrderQuoteResponse> {
    const res = await apiFetch('/api/dropshipper/orders/quote', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || 'Failed to calculate order quote');
    }
    const data = await res.json();
    // Backend wraps response: { success, quote: { ... } }
    return data.quote || data;
  },

  /**
   * POST /api/dropshipper/orders
   * Creates the real order on backend + returns Razorpay checkout info
   */
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const res = await apiFetch('/api/dropshipper/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      // backend: { success, order: { orderId, razorpay: { ... } } }
      const orderData = data.order || data;
      return {
        success: data.success ?? true,
        orderId: orderData.orderId || orderData.id || '',
        orderNumber: orderData.orderNumber || orderData.orderId,
        razorpay: orderData.razorpay || data.razorpay || undefined
      };
    }

    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Failed to create order on server');
  },

  /**
   * POST /api/dropshipper/orders/verify-payment
   * Verifies Razorpay signature after successful payment
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
   * Returns paginated order list normalised into local Order[]
   */
  async getOrders(params?: OrderFilterParams): Promise<{ orders: Order[]; total: number; totalPages: number; page: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.ref) query.set('ref', params.ref);

    try {
      const response = await apiFetch(`/api/dropshipper/orders?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const rawList = Array.isArray(data) ? data : (data.orders || data.data || []);
        const normalized = rawList.map(normalizeBackendOrder);
        return {
          orders: normalized,
          total: data.total ?? normalized.length,
          totalPages: data.totalPages ?? 1,
          page: data.page ?? (params?.page || 1)
        };
      }
    } catch (e) {
      console.warn('Backend orders API error, falling back to mock data:', e);
    }

    // Fallback to mockOrders with client-side filtering
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

    results = results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);

    return {
      orders: paginated,
      total: results.length,
      totalPages: Math.ceil(results.length / limit) || 1,
      page
    };
  },

  /**
   * GET /api/dropshipper/orders/:orderId
   * Returns a single order by ID, normalised to local Order type
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const res = await apiFetch(`/api/dropshipper/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        const raw = data.order || data.data || data;
        if (raw && (raw.orderId || raw.id)) {
          return normalizeBackendOrder(raw);
        }
      }
    } catch (e) {
      console.warn('Backend order detail API error:', e);
    }

    // Fallback: search local mock orders or store
    const found = mockOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    return found ? { ...found } : null;
  }
};
