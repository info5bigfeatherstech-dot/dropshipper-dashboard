import { Order } from '../types';

export const mockOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-94821',
    customer: {
      name: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      phone: '+1 (415) 890-2341'
    },
    shippingAddress: {
      line1: '742 Evergreen Terrace',
      line2: 'Apt 4B',
      city: 'Springfield',
      state: 'OR',
      postalCode: '97477',
      country: 'United States'
    },
    item: {
      productId: 'prod-001',
      productName: 'AeroPulse ANC Wireless Headphones',
      sku: 'AP-ANC-BLK-01',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 42.50,
      quantity: 2,
      total: 85.00
    },
    status: 'pending',
    adminNote: 'Awaiting supplier stock verification batch #882',
    notes: 'Please wrap carefully, gift delivery',
    createdAt: '2026-09-30T09:15:00Z',
    updatedAt: '2026-09-30T09:15:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed by Seller',
        timestamp: '2026-09-30T09:15:00Z',
        note: 'Order submitted to admin queue'
      },
      {
        status: 'pending',
        label: 'Pending Admin Verification',
        timestamp: '2026-09-30T09:15:30Z',
        note: 'Queued for automated inventory hold'
      }
    ]
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-94820',
    customer: {
      name: 'Marcus Chen',
      email: 'm.chen.arch@gmail.com',
      phone: '+1 (206) 555-0199'
    },
    shippingAddress: {
      line1: '1201 3rd Avenue',
      line2: 'Suite 1800',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States'
    },
    item: {
      productId: 'prod-002',
      productName: 'Lumivolt Magnetic 3-in-1 Fast Charger',
      sku: 'LV-M3-SLV-02',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 19.80,
      quantity: 1,
      total: 19.80
    },
    status: 'approved',
    adminNote: 'Approved automatically via Dallas fulfillment hub',
    trackingNumber: '',
    createdAt: '2026-09-29T18:40:00Z',
    updatedAt: '2026-09-29T19:00:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-29T18:40:00Z'
      },
      {
        status: 'pending',
        label: 'Pending Approval',
        timestamp: '2026-09-29T18:41:00Z'
      },
      {
        status: 'approved',
        label: 'Admin Approved',
        timestamp: '2026-09-29T19:00:00Z',
        note: 'Fulfillment dispatched to warehouse routing system'
      }
    ]
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-94819',
    customer: {
      name: 'Sophia Rodriguez',
      email: 'sophia.rodriguez@outlook.com',
      phone: '+1 (305) 441-9872'
    },
    shippingAddress: {
      line1: '88 Ocean Drive',
      city: 'Miami Beach',
      state: 'FL',
      postalCode: '33139',
      country: 'United States'
    },
    item: {
      productId: 'prod-004',
      productName: 'HyperGlow Ergonomic Mechanical Keyboard',
      sku: 'HG-KB-RGB-04',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 38.00,
      quantity: 1,
      total: 38.00
    },
    status: 'shipped',
    adminNote: 'Dispatched via FedEx Express priority routing',
    trackingNumber: 'FDX-9982415129',
    shippingCarrier: 'FedEx Express',
    createdAt: '2026-09-28T14:20:00Z',
    updatedAt: '2026-09-29T08:30:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-28T14:20:00Z'
      },
      {
        status: 'approved',
        label: 'Approved by Admin',
        timestamp: '2026-09-28T14:45:00Z'
      },
      {
        status: 'shipped',
        label: 'Package Dispatched',
        timestamp: '2026-09-29T08:30:00Z',
        note: 'Tracking #FDX-9982415129 generated'
      }
    ]
  },
  {
    id: 'ord-1004',
    orderNumber: 'ORD-94818',
    customer: {
      name: 'Liam Henderson',
      email: 'liam.henderson@techcorp.io',
      phone: '+1 (617) 502-8812'
    },
    shippingAddress: {
      line1: '45 Harvard Square',
      city: 'Cambridge',
      state: 'MA',
      postalCode: '02138',
      country: 'United States'
    },
    item: {
      productId: 'prod-007',
      productName: 'Nomad Water-Resistant Modular Backpack 28L',
      sku: 'NM-BP-28L-07',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 34.00,
      quantity: 1,
      total: 34.00
    },
    status: 'delivered',
    adminNote: 'Successfully delivered to front desk mailroom',
    trackingNumber: 'UPS-1Z9999999999999999',
    shippingCarrier: 'UPS Ground',
    createdAt: '2026-09-26T11:00:00Z',
    updatedAt: '2026-09-29T16:15:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-26T11:00:00Z'
      },
      {
        status: 'approved',
        label: 'Approved',
        timestamp: '2026-09-26T12:00:00Z'
      },
      {
        status: 'shipped',
        label: 'Shipped via UPS',
        timestamp: '2026-09-27T09:00:00Z'
      },
      {
        status: 'delivered',
        label: 'Delivered',
        timestamp: '2026-09-29T16:15:00Z',
        note: 'Left at front desk, signed by building manager'
      }
    ]
  },
  {
    id: 'ord-1005',
    orderNumber: 'ORD-94817',
    customer: {
      name: 'Clara Oswald',
      email: 'clara.oswald@cardiff.co.uk',
      phone: '+44 7700 900451'
    },
    shippingAddress: {
      line1: '14 St. John Lane',
      city: 'Cardiff',
      state: 'Wales',
      postalCode: 'CF10 1AA',
      country: 'United Kingdom'
    },
    item: {
      productId: 'prod-009',
      productName: 'Solace Organic Linen Weighted Blanket',
      sku: 'SL-WB-15L-09',
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 48.00,
      quantity: 1,
      total: 48.00
    },
    status: 'rejected',
    adminNote: 'Item temporarily out of stock across European & US fulfillment warehouses. Refund credited.',
    rejectionReason: 'Supplier stock exhausted during flash intake. Expected restock in 7 days.',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-09-28T10:30:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-28T09:00:00Z'
      },
      {
        status: 'pending',
        label: 'Pending Verification',
        timestamp: '2026-09-28T09:05:00Z'
      },
      {
        status: 'rejected',
        label: 'Rejected by Admin',
        timestamp: '2026-09-28T10:30:00Z',
        note: 'Inventory zero allocation: Supplier SKU out of stock'
      }
    ]
  },
  {
    id: 'ord-1006',
    orderNumber: 'ORD-94816',
    customer: {
      name: 'Jameson Blake',
      email: 'j.blake@mountainstudio.net',
      phone: '+1 (303) 712-4490'
    },
    shippingAddress: {
      line1: '810 Boulder Canyon Dr',
      city: 'Boulder',
      state: 'CO',
      postalCode: '80302',
      country: 'United States'
    },
    item: {
      productId: 'prod-006',
      productName: 'Nordic Ceramic Matte Pour-Over Coffee Set',
      sku: 'NC-CF-MTE-06',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 22.00,
      quantity: 2,
      total: 44.00
    },
    status: 'approved',
    adminNote: 'Stock verified at Oregon facility. Packaging in progress.',
    createdAt: '2026-09-29T15:20:00Z',
    updatedAt: '2026-09-29T16:00:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-29T15:20:00Z'
      },
      {
        status: 'approved',
        label: 'Approved by Admin',
        timestamp: '2026-09-29T16:00:00Z',
        note: 'Verified with Fujian Artisan import batch'
      }
    ]
  },
  {
    id: 'ord-1007',
    orderNumber: 'ORD-94815',
    customer: {
      name: 'Hannah Abbott',
      email: 'hannah.abbott@botanicals.org',
      phone: '+1 (503) 221-8765'
    },
    shippingAddress: {
      line1: '320 NW 11th Ave',
      city: 'Portland',
      state: 'OR',
      postalCode: '97209',
      country: 'United States'
    },
    item: {
      productId: 'prod-005',
      productName: 'Zenith Smart Ultrasonic Essential Oil Diffuser',
      sku: 'ZN-DF-OAK-05',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 16.50,
      quantity: 3,
      total: 49.50
    },
    status: 'shipped',
    adminNote: 'Tracking active. Carrier: DHL eCommerce Express',
    trackingNumber: 'DHL-8874102941',
    shippingCarrier: 'DHL eCommerce',
    createdAt: '2026-09-27T10:15:00Z',
    updatedAt: '2026-09-28T11:45:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-27T10:15:00Z'
      },
      {
        status: 'approved',
        label: 'Approved',
        timestamp: '2026-09-27T11:00:00Z'
      },
      {
        status: 'shipped',
        label: 'Shipped via DHL',
        timestamp: '2026-09-28T11:45:00Z',
        note: 'In transit to distribution hub'
      }
    ]
  },
  {
    id: 'ord-1008',
    orderNumber: 'ORD-94814',
    customer: {
      name: 'Victor Vance',
      email: 'vvance@skyline-group.com',
      phone: '+1 (312) 808-1122'
    },
    shippingAddress: {
      line1: '233 S Wacker Dr',
      line2: 'Suite 4400',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60606',
      country: 'United States'
    },
    item: {
      productId: 'prod-003',
      productName: 'Verve Minimalist Titanium Automatic Watch',
      sku: 'VV-TI-BLK-03',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 68.00,
      quantity: 1,
      total: 68.00
    },
    status: 'delivered',
    adminNote: 'Insured luxury parcel delivered and signature obtained',
    trackingNumber: 'FDX-7718290314',
    shippingCarrier: 'FedEx Priority',
    createdAt: '2026-09-25T08:00:00Z',
    updatedAt: '2026-09-27T14:30:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-25T08:00:00Z'
      },
      {
        status: 'approved',
        label: 'Approved',
        timestamp: '2026-09-25T08:30:00Z'
      },
      {
        status: 'shipped',
        label: 'Shipped',
        timestamp: '2026-09-26T07:15:00Z'
      },
      {
        status: 'delivered',
        label: 'Delivered',
        timestamp: '2026-09-27T14:30:00Z',
        note: 'Direct signature by customer on file'
      }
    ]
  },
  {
    id: 'ord-1009',
    orderNumber: 'ORD-94813',
    customer: {
      name: 'Natalie Portman',
      email: 'natalie.p@austin-creative.org',
      phone: '+1 (512) 690-3321'
    },
    shippingAddress: {
      line1: '1600 Congress Ave',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'United States'
    },
    item: {
      productId: 'prod-010',
      productName: 'Prism 4K Ultra-Wide Streaming Webcam',
      sku: 'PR-CAM-4K-10',
      image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 32.00,
      quantity: 2,
      total: 64.00
    },
    status: 'pending',
    adminNote: 'Pending high-definition optical certification check',
    createdAt: '2026-09-30T07:30:00Z',
    updatedAt: '2026-09-30T07:30:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-30T07:30:00Z'
      },
      {
        status: 'pending',
        label: 'Pending Approval',
        timestamp: '2026-09-30T07:31:00Z'
      }
    ]
  },
  {
    id: 'ord-1010',
    orderNumber: 'ORD-94812',
    customer: {
      name: 'Oliver Queen',
      email: 'oliver.q@starcity.com',
      phone: '+1 (213) 440-9988'
    },
    shippingAddress: {
      line1: '1000 Grand Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90015',
      country: 'United States'
    },
    item: {
      productId: 'prod-012',
      productName: 'Vessel Insulated Titanium Travel Flask 500ml',
      sku: 'VS-TF-500-12',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 26.00,
      quantity: 1,
      total: 26.00
    },
    status: 'delivered',
    adminNote: 'Delivered safely to concierge desk',
    trackingNumber: 'USPS-9400100000000000',
    shippingCarrier: 'USPS Priority',
    createdAt: '2026-09-24T12:00:00Z',
    updatedAt: '2026-09-26T17:00:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-24T12:00:00Z'
      },
      {
        status: 'approved',
        label: 'Approved',
        timestamp: '2026-09-24T13:00:00Z'
      },
      {
        status: 'shipped',
        label: 'Shipped',
        timestamp: '2026-09-25T08:00:00Z'
      },
      {
        status: 'delivered',
        label: 'Delivered',
        timestamp: '2026-09-26T17:00:00Z'
      }
    ]
  },
  {
    id: 'ord-1011',
    orderNumber: 'ORD-94811',
    customer: {
      name: 'Maya Lin',
      email: 'maya.design@studio-lin.org',
      phone: '+1 (415) 309-8812'
    },
    shippingAddress: {
      line1: '500 Sansome St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94111',
      country: 'United States'
    },
    item: {
      productId: 'prod-013',
      productName: 'Onyx Leather Magnetic Desk Mat & Cable Guide',
      sku: 'OX-DM-XL-13',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 18.00,
      quantity: 1,
      total: 18.00
    },
    status: 'approved',
    adminNote: 'Packaging initiated at Oakland logistics center',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-29T11:00:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed',
        timestamp: '2026-09-29T10:00:00Z'
      },
      {
        status: 'approved',
        label: 'Approved by Admin',
        timestamp: '2026-09-29T11:00:00Z'
      }
    ]
  }
];
