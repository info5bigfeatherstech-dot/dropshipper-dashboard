import { apiFetch } from '../lib/api';

export type DropshipperRegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  businessName?: string;
  permanentAddress: string;
  haveShop: boolean;
  businessAddress: string;
  deliveryAddress: string;
  sellingPlaceFrom: string;
  sellingZoneCity: string;
  productCategory: string;
  monthlyEstimatedPurchase: number | string;
  idProofUrl?: string;
  businessAddressProofUrl?: string;
};

async function parseJson(res: Response) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(message) as Error & {
      status?: number;
      code?: string;
      data?: unknown;
    };
    err.status = res.status;
    err.code = data?.code;
    err.data = data;
    throw err;
  }
  return data;
}

/** Public auth calls — do not require dropshipper JWT. */
async function publicFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  // Intentionally no Authorization — register/activate/login are public
  return fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });
}

export const dropshipperAuthService = {
  async getSubscriptionSettings() {
    const res = await publicFetch('/api/dropshipper/auth/subscription-settings');
    return parseJson(res);
  },

  async createRegistrationPayment(body: DropshipperRegisterPayload) {
    const res = await publicFetch('/api/dropshipper/auth/register/create-payment', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return parseJson(res);
  },

  async verifyRegistrationPayment(body: {
    requestId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const res = await publicFetch('/api/dropshipper/auth/register/verify-payment', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return parseJson(res);
  },

  async sendActivationOtp(body: { email?: string; phone?: string; dropshipperId?: string }) {
    const res = await publicFetch('/api/dropshipper/auth/activate/send-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return parseJson(res);
  },

  async completeActivation(body: {
    email?: string;
    phone?: string;
    dropshipperId?: string;
    otp: string;
    password: string;
    confirmPassword?: string;
  }) {
    const res = await publicFetch('/api/dropshipper/auth/activate/complete', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return parseJson(res);
  },

  async login(body: { email?: string; phone?: string; password: string }) {
    const res = await publicFetch('/api/dropshipper/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return parseJson(res);
  },

  async me() {
    const res = await apiFetch('/api/dropshipper/auth/me');
    return parseJson(res);
  },

  async logout() {
    const res = await apiFetch('/api/dropshipper/auth/logout', { method: 'POST' });
    return parseJson(res);
  },
};
