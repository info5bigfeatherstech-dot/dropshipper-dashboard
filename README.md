# DropFlow — Dropshipping Seller Dashboard

A modern, polished, responsive **Dropshipping Seller Dashboard** front-end application built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

Themed in **"Soft Indigo Commerce"** (`#4F46E5`), with light and dark mode support, glassmorphism headers, rounded-2xl cards, micro-interactions, and real client-side PDF/CSV downloads.

---

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🎨 Design Theme: "Soft Indigo Commerce"

- **Primary**: Indigo (`#4F46E5`), active/hover (`#6366F1`), light background accents (`#EEF2FF`)
- **Backgrounds**: Slate-50 (`#F8FAFC`) in light mode; Slate-950 (`#0B0F19`) in dark mode
- **Cards**: White with 1px soft borders (`#E2E8F0` / dark `#1E293B`) and soft elevation shadows
- **Accents**: 
  - Emerald (`#10B981`) for Approved & In Stock
  - Amber (`#F59E0B`) for Pending Approval & Low Stock
  - Blue (`#3B82F6`) for Shipped
  - Teal (`#14B8A6`) for Delivered
  - Rose (`#F43F5E`) for Rejected & Out of Stock
- **Typography**: **Plus Jakarta Sans** with clean visual hierarchy

---

## 📁 Project Structure

```
d:/Dashboard/
├── public/                     # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI primitives
│   │   │   ├── StatusBadge.tsx # Status & Stock badges
│   │   │   ├── ProductCard.tsx # Grid & List product cards with margins
│   │   │   ├── StatCard.tsx    # Order metric cards with accent variants
│   │   │   ├── Tabs.tsx        # Framer Motion animated tab switcher
│   │   │   ├── EmptyState.tsx  # Empty & no-results states
│   │   │   ├── Skeletons.tsx   # Shimmer loaders for cards and rows
│   │   │   ├── Drawer.tsx      # Reusable slide-over panel
│   │   │   └── ToastContainer.tsx # Floating notification stack
│   │   ├── layout/
│   │   │   ├── Layout.tsx      # Main application shell
│   │   │   ├── Sidebar.tsx     # Collapsible sidebar (Products & Orders)
│   │   │   ├── TopBar.tsx      # Global search, theme toggle, notifications
│   │   │   └── MobileBottomBar.tsx # Responsive mobile bottom navigation
│   │   ├── orders/
│   │   │   ├── CreateOrderForm.tsx # 4-step order form + live sticky summary
│   │   │   └── OrderDetailDrawer.tsx # Timeline stepper, PDF/CSV/Image export
│   │   └── products/
│   │       └── ProductDetailModal.tsx # Full gallery, specs, and direct order CTA
│   ├── data/
│   │   ├── mockProducts.ts     # 14+ realistic commerce products with specs
│   │   └── mockOrders.ts       # 11+ realistic orders across all lifecycle states
│   ├── pages/
│   │   ├── ProductsPage.tsx    # Sourcing catalog with filters, search, sort
│   │   └── OrdersPage.tsx      # All Orders table + Create Order tab
│   ├── services/
│   │   ├── productsService.ts  # Async product API layer with mock latency
│   │   └── ordersService.ts    # Async order API layer
│   ├── store/
│   │   └── useStore.ts         # Zustand global state (theme, orders, auto-admin)
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & domain types
│   ├── utils/
│   │   ├── formatters.ts       # Currency, date, and profit margin helpers
│   │   └── exportUtils.ts      # jsPDF order export, CSV generator, image downloader
│   ├── App.tsx                 # React Router routes
│   ├── index.css               # Tailwind directives & design system
│   └── main.tsx                # React root mount
├── index.html                  # HTML template with Google Fonts
├── tailwind.config.js          # Tailwind theme configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

---

## 🔌 How to Swap Dummy Services for Real APIs

The application is built with a decoupled services layer (`/src/services`) that returns Promises. **No UI component directly imports mock data.**

### 1. Products Service (`src/services/productsService.ts`)

Replace the simulated delay and mock filter logic with real `fetch` or `axios` calls:

```typescript
// Replace mock implementation:
export const productsService = {
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/v1/products?${query}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`/api/v1/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async getCategories(): Promise<string[]> {
    const res = await fetch('/api/v1/products/categories');
    return res.json();
  }
};
```

### 2. Orders Service (`src/services/ordersService.ts`)

Connect order retrieval and creation to your backend:

```typescript
export const ordersService = {
  async getOrders(params?: OrderFilterParams): Promise<Order[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/v1/orders?${query}`);
    return res.json();
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  }
};
```

---

## ⚡ Key Features Implemented

1. **Products Catalog**:
   - High-quality Unsplash commerce images with hover zoom effect
   - Prominent **Dropship Price** (admin-approved price) alongside MSRP and calculated profit margin
   - Real-time search, category dropdown + quick category pills, stock status filter, and multi-option sort
   - Grid / List view switcher
   - Product Detail Slide-Over with thumbnail gallery, specs table, fulfillment time, and **"Create order with this product"** CTA.

2. **Orders & Fulfillment**:
   - **Tab 1: All Orders**:
     - Metric cards for Total Orders, Pending Approval, Approved, and Shipped/Delivered
     - Data table with Order ID, Product thumbnail + SKU, Customer info, Date, Amount, Status badge, and Quick Actions
     - Status chips filter, date range filter, instant search, and pagination
     - **Order Detail Slide-Over**: Interactive status timeline stepper (Created > Pending > Approved > Shipped > Delivered / Rejected), Customer & Shipping address cards, image zoom preview, and direct **Download Order Details (PDF & CSV)** and **Download Product Image** buttons with toast confirmations.
   - **Tab 2: Create Order**:
     - 4-card sectioned form: Product selection & quantity, Customer contact details, Shipping address, and Notes
     - Live Sticky Order Summary with dropship cost breakdown and margin estimate
     - Client-side validation with inline error messaging
     - Primary "Save Changes" and secondary "Save as draft"
     - Submission confirmation screen with confetti animation
     - **Simulated Auto-Admin Logic**: Pending orders auto-flip to Approved (or Rejected) after ~10 seconds with a real-time high-priority toast notification!

3. **Theme & Responsiveness**:
   - Dark mode toggle with persistent `localStorage` preference
   - Global search popover with live product and order matches
   - Collapsible desktop sidebar and mobile bottom navigation bar
