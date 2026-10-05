export type OrderStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'rejected';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductSpecs {
  weight: string;
  dimensions: string;
  material: string;
  origin: string;
  fulfillmentTime: string;
  warranty: string;
}

export interface Product {
  id: string;
  _id?: string;
  slug?: string;
  name: string;
  sku: string;
  category: string;
  categoryId?: string;
  dropshipPrice: number;       // The admin-approved price
  suggestedRetailPrice: number; // MSRP
  costEstimate?: number;
  stock: number;
  stockStatus: StockStatus;
  images: string[];
  thumbnail: string;
  description: string;
  features: string[];
  specs: ProductSpecs;
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  dropshipPrice: number;
  quantity: number;
  total: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus | 'created';
  label: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  shippingAddress: Address;
  item: OrderItem;
  items?: OrderItem[];
  status: OrderStatus;
  adminNote?: string;
  rejectionReason?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  shippingCharges?: number;
  shippingPaymentMode?: 'prepaid' | 'cod';
  estimatedDeliveryDays?: string;
  warehousePincode?: string;
  shippingProvider?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'margin_desc' | 'name_asc';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export * from './dropshipper';
