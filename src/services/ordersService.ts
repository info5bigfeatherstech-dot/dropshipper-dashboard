import { Order, OrderStatus, Customer, Address } from '../types';
import { mockOrders } from '../data/mockOrders';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface OrderFilterParams {
  search?: string;
  status?: OrderStatus | 'all';
  dateRange?: string; // 'all' | 'today' | '7days' | '30days'
}

export interface CreateOrderPayload {
  productId: string;
  quantity: number;
  customer: Customer;
  shippingAddress: Address;
  notes?: string;
}

export const ordersService = {
  /**
   * Fetch orders list with filters
   * In production: return fetch('/api/v1/orders?' + new URLSearchParams(params)).then(res => res.json());
   */
  async getOrders(params?: OrderFilterParams): Promise<Order[]> {
    await delay(350);
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

    if (params?.dateRange && params.dateRange !== 'all') {
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      if (params.dateRange === 'today') {
        results = results.filter(
          (o) => now - new Date(o.createdAt).getTime() <= oneDay
        );
      } else if (params.dateRange === '7days') {
        results = results.filter(
          (o) => now - new Date(o.createdAt).getTime() <= 7 * oneDay
        );
      } else if (params.dateRange === '30days') {
        results = results.filter(
          (o) => now - new Date(o.createdAt).getTime() <= 30 * oneDay
        );
      }
    }

    // Sort by latest created first
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Get single order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    await delay(200);
    const found = mockOrders.find((o) => o.id === id);
    return found ? { ...found } : null;
  }
};
