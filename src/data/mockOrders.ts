import { Order } from '../types';

export const mockOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-94821',
    customer: {
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@example.in',
      phone: '+91 98201 23456'
    },
    shippingAddress: {
      line1: '104 Silver Heights',
      line2: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400053',
      country: 'India'
    },
    item: {
      productId: '6aa0095a01838c99c3ddc1f2',
      productName: 'Toothbrush Protector Cap Cover',
      sku: 'SKU-2928-1',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873047/products/zip-toothbrush-protector-cap-cover-2928-1-i0-1788873047623.webp',
      dropshipPrice: 40.00,
      quantity: 2,
      total: 80.00
    },
    status: 'pending',
    adminNote: 'Awaiting supplier stock confirmation for batch #2928',
    notes: 'Please verify packaging before dispatch',
    createdAt: '2026-09-30T09:15:00Z',
    updatedAt: '2026-09-30T09:15:00Z',
    timeline: [
      {
        status: 'created',
        label: 'Order Placed by Seller',
        timestamp: '2026-09-30T09:15:00Z',
        note: 'Order submitted to dropship admin queue'
      },
      {
        status: 'pending',
        label: 'Pending Admin Verification',
        timestamp: '2026-09-30T09:15:30Z',
        note: 'Queued for automated inventory verification'
      }
    ]
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-94820',
    customer: {
      name: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      phone: '+91 98795 44120'
    },
    shippingAddress: {
      line1: '402 Galaxy Apartments',
      line2: 'Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380054',
      country: 'India'
    },
    item: {
      productId: '6aa0095c01838c99c3ddc1f9',
      productName: 'Color Naphthalene Balls',
      sku: 'SKU-2929-1',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873051/products/zip-color-naphthalene-balls-2929-1-i0-1788873050768.webp',
      dropshipPrice: 30.00,
      quantity: 2,
      total: 60.00
    },
    status: 'approved',
    adminNote: 'Approved automatically via central fulfillment hub',
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
      name: 'Amit Verma',
      email: 'amit.verma@outlook.in',
      phone: '+91 98112 34567'
    },
    shippingAddress: {
      line1: 'B-42 Defence Colony',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110024',
      country: 'India'
    },
    item: {
      productId: '6aa0095a01838c99c3ddc1f2',
      productName: 'Toothbrush Protector Cap Cover',
      sku: 'SKU-2928-1',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873047/products/zip-toothbrush-protector-cap-cover-2928-1-i0-1788873047623.webp',
      dropshipPrice: 40.00,
      quantity: 1,
      total: 40.00
    },
    status: 'shipped',
    adminNote: 'Dispatched via Delhivery Express surface routing',
    trackingNumber: 'DEL-9982415129',
    shippingCarrier: 'Delhivery Express',
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
        note: 'Tracking #DEL-9982415129 generated'
      }
    ]
  },
  {
    id: 'ord-1004',
    orderNumber: 'ORD-94818',
    customer: {
      name: 'Vikram Malhotra',
      email: 'vikram.m@techcorp.in',
      phone: '+91 99887 65432'
    },
    shippingAddress: {
      line1: '12 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India'
    },
    item: {
      productId: '6ac084b1cea081fd2bd799b1',
      productName: 'test',
      sku: 'SKU-398-1',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 120.00,
      quantity: 1,
      total: 120.00
    },
    status: 'delivered',
    adminNote: 'Successfully delivered to customer residence',
    trackingNumber: 'BLU-4481029412',
    shippingCarrier: 'Blue Dart',
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
        label: 'Shipped via Blue Dart',
        timestamp: '2026-09-27T09:00:00Z'
      },
      {
        status: 'delivered',
        label: 'Delivered',
        timestamp: '2026-09-29T16:15:00Z',
        note: 'Delivered and OTP verified by recipient'
      }
    ]
  },
  {
    id: 'ord-1005',
    orderNumber: 'ORD-94817',
    customer: {
      name: 'Sneha Kulkarni',
      email: 'sneha.k@pune-design.org',
      phone: '+91 97654 32109'
    },
    shippingAddress: {
      line1: '24 Prabhat Road',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411004',
      country: 'India'
    },
    item: {
      productId: '6aa0095c01838c99c3ddc1f9',
      productName: 'Color Naphthalene Balls',
      sku: 'SKU-2929-1',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873051/products/zip-color-naphthalene-balls-2929-1-i0-1788873050768.webp',
      dropshipPrice: 30.00,
      quantity: 3,
      total: 90.00
    },
    status: 'rejected',
    adminNote: 'Temporary stock intake hold at fulfillment center. Dropshipper balance refunded.',
    rejectionReason: 'Supplier stock undergoing re-packaging inspection. Restock scheduled soon.',
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
        note: 'Inventory zero allocation: Supplier SKU awaiting intake'
      }
    ]
  },
  {
    id: 'ord-1006',
    orderNumber: 'ORD-94816',
    customer: {
      name: 'Arjun Rao',
      email: 'arjun.rao@mountainstudio.in',
      phone: '+91 94480 12345'
    },
    shippingAddress: {
      line1: '88 Jubilee Hills, Road No. 36',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
      country: 'India'
    },
    item: {
      productId: '6aa0095a01838c99c3ddc1f2',
      productName: 'Toothbrush Protector Cap Cover',
      sku: 'SKU-2928-1',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873047/products/zip-toothbrush-protector-cap-cover-2928-1-i0-1788873047623.webp',
      dropshipPrice: 40.00,
      quantity: 3,
      total: 120.00
    },
    status: 'approved',
    adminNote: 'Stock verified at Telangana hub. Packaging in progress.',
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
        note: 'Verified with factory sealed packaging batch'
      }
    ]
  },
  {
    id: 'ord-1007',
    orderNumber: 'ORD-94815',
    customer: {
      name: 'Ananya Sen',
      email: 'ananya.sen@botanicals.in',
      phone: '+91 98301 98765'
    },
    shippingAddress: {
      line1: '15 Salt Lake Sector 1',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700064',
      country: 'India'
    },
    item: {
      productId: '6aa0095c01838c99c3ddc1f9',
      productName: 'Color Naphthalene Balls',
      sku: 'SKU-2929-1',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873051/products/zip-color-naphthalene-balls-2929-1-i0-1788873050768.webp',
      dropshipPrice: 30.00,
      quantity: 4,
      total: 120.00
    },
    status: 'shipped',
    adminNote: 'Tracking active. Carrier: Shadowfax Express',
    trackingNumber: 'SHP-8874102941',
    shippingCarrier: 'Shadowfax Express',
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
        label: 'Shipped via Shadowfax',
        timestamp: '2026-09-28T11:45:00Z',
        note: 'In transit to Kolkata sorting hub'
      }
    ]
  },
  {
    id: 'ord-1008',
    orderNumber: 'ORD-94814',
    customer: {
      name: 'Rohan Gupta',
      email: 'rohan.gupta@skyline-group.in',
      phone: '+91 98290 55443'
    },
    shippingAddress: {
      line1: '72 Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '302006',
      country: 'India'
    },
    item: {
      productId: '6ac084b1cea081fd2bd799b1',
      productName: 'test',
      sku: 'SKU-398-1',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      dropshipPrice: 120.00,
      quantity: 2,
      total: 240.00
    },
    status: 'delivered',
    adminNote: 'Verified order delivered and signature confirmed',
    trackingNumber: 'DTDC-7718290314',
    shippingCarrier: 'DTDC Express',
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
        note: 'Delivered to recipient address'
      }
    ]
  },
  {
    id: 'ord-1009',
    orderNumber: 'ORD-94813',
    customer: {
      name: 'Kavita Nair',
      email: 'kavita.n@chennai-crafts.in',
      phone: '+91 98470 11223'
    },
    shippingAddress: {
      line1: '56 Anna Salai, T. Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600017',
      country: 'India'
    },
    item: {
      productId: '6aa0095a01838c99c3ddc1f2',
      productName: 'Toothbrush Protector Cap Cover',
      sku: 'SKU-2928-1',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873047/products/zip-toothbrush-protector-cap-cover-2928-1-i0-1788873047623.webp',
      dropshipPrice: 40.00,
      quantity: 2,
      total: 80.00
    },
    status: 'pending',
    adminNote: 'Pending delivery pincode serviceability confirmation',
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
      name: 'Deepak Joshi',
      email: 'deepak.j@surattraders.in',
      phone: '+91 98250 88990'
    },
    shippingAddress: {
      line1: '10 Ring Road',
      city: 'Surat',
      state: 'Gujarat',
      postalCode: '395002',
      country: 'India'
    },
    item: {
      productId: '6aa0095c01838c99c3ddc1f9',
      productName: 'Color Naphthalene Balls',
      sku: 'SKU-2929-1',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873051/products/zip-color-naphthalene-balls-2929-1-i0-1788873050768.webp',
      dropshipPrice: 30.00,
      quantity: 5,
      total: 150.00
    },
    status: 'delivered',
    adminNote: 'Delivered safely to merchant premise',
    trackingNumber: 'DEL-9400100000000000',
    shippingCarrier: 'Delhivery Surface',
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
      name: 'Meera Nair',
      email: 'meera.design@studio-lin.in',
      phone: '+91 98450 33445'
    },
    shippingAddress: {
      line1: '80 Sector 18',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201301',
      country: 'India'
    },
    item: {
      productId: '6aa0095a01838c99c3ddc1f2',
      productName: 'Toothbrush Protector Cap Cover',
      sku: 'SKU-2928-1',
      image: 'https://res.cloudinary.com/dejsxuhnk/image/upload/v1788873047/products/zip-toothbrush-protector-cap-cover-2928-1-i0-1788873047623.webp',
      dropshipPrice: 40.00,
      quantity: 1,
      total: 40.00
    },
    status: 'approved',
    adminNote: 'Packaging initiated at NCR logistics center',
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
