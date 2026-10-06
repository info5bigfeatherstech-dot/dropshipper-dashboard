import { create } from 'zustand';
import { Order, OrderItem, Product, OrderStatus, ToastMessage } from '../types';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'system' | 'approval';
}

interface StoreState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (val: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;

  // Data
  products: Product[];
  setProducts: (products: Product[]) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  totalOrdersCount: number;
  setTotalOrdersCount: (count: number) => void;
  fetchOrders: (silent?: boolean) => Promise<void>;

  // Navigation / Pre-selection
  activeOrderTab: 'all' | 'create';
  setActiveOrderTab: (tab: 'all' | 'create') => void;
  selectedProductForCreate: Product | null;
  setSelectedProductForCreate: (product: Product | null) => void;

  // Modals & Panels
  selectedOrderForDetail: Order | null;
  setSelectedOrderForDetail: (order: Order | null) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;

  // Notifications & Toasts
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Order Operations
  createOrder: (orderData: {
    product?: Product;
    quantity?: number;
    items?: { product: Product; quantity: number }[];
    customer: { name: string; email: string; phone: string };
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    shippingCharges?: number;
    shippingPaymentMode?: 'prepaid' | 'cod';
    estimatedDeliveryDays?: string;
    warehousePincode?: string;
    shippingProvider?: string;
    notes?: string;
  }, isDraft?: boolean) => Order;

  updateOrderStatus: (orderId: string, status: OrderStatus, adminNote?: string) => void;
}

export const useStore = create<StoreState>((set, get) => {
  // Ensure light theme
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('zenith_theme');
  }

  return {

    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
    mobileMenuOpen: false,
    setMobileMenuOpen: (val) => set({ mobileMenuOpen: val }),

    products: [],
    setProducts: (products) => set({ products }),
    orders: [],
    setOrders: (orders) => set({ orders }),
    totalOrdersCount: 0,
    setTotalOrdersCount: (count) => set({ totalOrdersCount: count }),
    fetchOrders: async () => {
      try {
        const { ordersService } = await import('../services/ordersService');
        const res = await ordersService.getOrders({ page: 1, limit: 50 });
        set({
          orders: res.orders,
          totalOrdersCount: res.total
        });
      } catch (err) {
        console.warn('Failed to fetch orders from server API:', err);
      }
    },

    activeOrderTab: 'all',
    setActiveOrderTab: (tab) => set({ activeOrderTab: tab }),

    selectedProductForCreate: null,
    setSelectedProductForCreate: (product) => set({ selectedProductForCreate: product }),

    selectedOrderForDetail: null,
    setSelectedOrderForDetail: (order) => set({ selectedOrderForDetail: order }),

    selectedProductForModal: null,
    setSelectedProductForModal: (product) => set({ selectedProductForModal: product }),

    notifications: [
      {
        id: 'notif-1',
        title: 'New Order Received',
        message: 'Order #ORD-94821 is waiting for admin verification.',
        time: '10m ago',
        read: false,
        type: 'order'
      },
      {
        id: 'notif-2',
        title: 'Supplier Restock Update',
        message: 'AeroPulse ANC inventory increased by +50 units.',
        time: '1h ago',
        read: false,
        type: 'system'
      },
      {
        id: 'notif-3',
        title: 'Order Delivered',
        message: 'Order #ORD-94814 signed & delivered in Chicago.',
        time: '3h ago',
        read: true,
        type: 'approval'
      }
    ],

    markNotificationAsRead: (id) =>
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      })),

    markAllNotificationsRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),

    toasts: [],
    addToast: (toast) => {
      const id = 'toast-' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { ...toast, id, duration: toast.duration || 4000 };
      set((state) => ({ toasts: [...state.toasts, newToast] }));

      // Auto dismiss
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    },

    removeToast: (id) =>
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      })),

    createOrder: (orderData, _isDraft = false) => {
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `ORD-${randomDigits}`;
      const now = new Date().toISOString();

      // Resolve items array (either provided as items list or single product)
      const orderItemsList: OrderItem[] = (orderData.items && orderData.items.length > 0)
        ? orderData.items.map((it) => ({
          productId: it.product.id,
          productName: it.product.name,
          sku: it.product.sku,
          image: it.product.thumbnail,
          dropshipPrice: it.product.dropshipPrice,
          quantity: it.quantity,
          total: +(it.product.dropshipPrice * it.quantity).toFixed(2)
        }))
        : orderData.product
          ? [
            {
              productId: orderData.product.id,
              productName: orderData.product.name,
              sku: orderData.product.sku,
              image: orderData.product.thumbnail,
              dropshipPrice: orderData.product.dropshipPrice,
              quantity: orderData.quantity || 1,
              total: +(orderData.product.dropshipPrice * (orderData.quantity || 1)).toFixed(2)
            }
          ]
          : [];

      const primaryItem = orderItemsList[0] || {
        productId: 'prod-unknown',
        productName: 'Custom Product',
        sku: 'SKU-CUSTOM',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        dropshipPrice: 0,
        quantity: 1,
        total: 0
      };

      const newOrder: Order = {
        id: 'ord-' + Date.now(),
        orderNumber,
        customer: orderData.customer,
        shippingAddress: orderData.shippingAddress,
        item: primaryItem,
        items: orderItemsList,
        shippingCharges: orderData.shippingCharges,
        shippingPaymentMode: orderData.shippingPaymentMode,
        estimatedDeliveryDays: orderData.estimatedDeliveryDays,
        warehousePincode: orderData.warehousePincode,
        shippingProvider: orderData.shippingProvider,
        status: 'pending',
        notes: orderData.notes,
        createdAt: now,
        updatedAt: now,
        timeline: [
          {
            status: 'created',
            label: 'Order Placed by Seller',
            timestamp: now,
            note: 'Order submitted to admin queue'
          },
          {
            status: 'pending',
            label: 'Waiting for Admin Approval',
            timestamp: now,
            note: 'Verification batch queued'
          }
        ]
      };

      set((state) => ({
        orders: [newOrder, ...state.orders]
      }));

      // Add notification
      const notifMsg = orderItemsList.length > 1
        ? `Awaiting admin approval for ${orderItemsList.length} products (${orderNumber}).`
        : `Awaiting admin approval for ${primaryItem.productName}.`;

      set((state) => ({
        notifications: [
          {
            id: 'notif-' + Date.now(),
            title: `Order Submitted (${orderNumber})`,
            message: notifMsg,
            time: 'Just now',
            read: false,
            type: 'order'
          },
          ...state.notifications
        ]
      }));

      // No local auto-approve. Status updates come from GET /orders after admin confirms.

      return newOrder;
    },

    updateOrderStatus: (orderId, status, adminNote) => {
      const now = new Date().toISOString();
      set((state) => ({
        orders: state.orders.map((o) => {
          if (o.id !== orderId) return o;
          const statusLabels: Record<OrderStatus, string> = {
            pending: 'Pending Admin Approval',
            approved: 'Approved by Admin',
            shipped: 'Shipped to Customer',
            delivered: 'Delivered',
            rejected: 'Rejected by Admin'
          };
          return {
            ...o,
            status,
            adminNote: adminNote || o.adminNote,
            rejectionReason: status === 'rejected' ? adminNote : o.rejectionReason,
            updatedAt: now,
            timeline: [
              ...o.timeline,
              {
                status,
                label: statusLabels[status],
                timestamp: now,
                note: adminNote
              }
            ]
          };
        }),
        // If currently open in detail modal, update that as well
        selectedOrderForDetail:
          state.selectedOrderForDetail?.id === orderId
            ? {
              ...state.selectedOrderForDetail,
              status,
              adminNote: adminNote || state.selectedOrderForDetail.adminNote,
              rejectionReason:
                status === 'rejected' ? adminNote : state.selectedOrderForDetail.rejectionReason,
              updatedAt: now,
              timeline: [
                ...state.selectedOrderForDetail.timeline,
                {
                  status,
                  label:
                    status === 'approved'
                      ? 'Approved by Admin'
                      : status === 'rejected'
                        ? 'Rejected by Admin'
                        : status,
                  timestamp: now,
                  note: adminNote
                }
              ]
            }
            : state.selectedOrderForDetail
      }));
    }
  };
});
