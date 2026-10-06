import { apiFetch, clearDropshipperSession, setAuthToken } from '../lib/api';

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

export type DropshipperRegisterFiles = {
  idProof: File;
  businessAddressProof: File;
};

export type SubscriptionSettings = {
  channel: string;
  subscriptionAmountInr: number;
  subscriptionYears: number;
  registrationOpen: boolean;
  updatedAt?: string;
};

export type RegistrationStatusResponse = {
  success: boolean;
  request: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    businessName?: string;
    amountDueInr: number;
    amountPaidInr: number;
    payment?: {
      status: 'pending' | 'paid' | 'failed';
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      paidAt?: string;
    };
    adminStatus: 'pending' | 'approved' | 'rejected';
    adminDecisionNote?: string;
    createdAt: string;
  };
  nextStep: 'complete_payment' | 'admin_approval' | 'otp_and_password' | 'rejected';
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
  /**
   * GET /auth/subscription-settings
   * Fetches public subscription fee & registrationOpen flag
   */
  async getSubscriptionSettings(): Promise<{ success: boolean; settings: SubscriptionSettings; isFallback?: boolean }> {
    try {
      const res = await publicFetch('/api/dropshipper/auth/subscription-settings');
      return await parseJson(res);
    } catch (err: any) {
      if (err?.status === 404 || err?.code === 'ROUTE_NOT_FOUND' || String(err?.message || '').includes('Cannot GET')) {
        return {
          success: true,
          settings: {
            channel: 'dropship',
            subscriptionAmountInr: 800,
            subscriptionYears: 1,
            registrationOpen: true,
          },
          isFallback: true,
        };
      }
      throw err;
    }
  },

  /**
   * POST /auth/register/start
   * Validate applicant + fee preview (no DB record written)
   */
  async startRegistration(body: DropshipperRegisterPayload) {
    const res = await publicFetch('/api/dropshipper/auth/register/start', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return parseJson(res);
  },

  /**
   * POST /auth/register/create-payment
   * Multipart: form fields + idProof + businessAddressProof (Cloudinary on server).
   */
  async createRegistrationPayment(
    body: DropshipperRegisterPayload,
    files: DropshipperRegisterFiles
  ) {
    const form = new FormData();
    form.append('fullName', body.fullName);
    form.append('email', body.email);
    form.append('phone', body.phone);
    form.append('whatsappNumber', body.whatsappNumber);
    if (body.businessName) form.append('businessName', body.businessName);
    form.append('permanentAddress', body.permanentAddress);
    form.append('haveShop', body.haveShop ? 'true' : 'false');
    form.append('businessAddress', body.businessAddress);
    form.append('deliveryAddress', body.deliveryAddress);
    form.append('sellingPlaceFrom', body.sellingPlaceFrom);
    form.append('sellingZoneCity', body.sellingZoneCity);
    form.append('productCategory', body.productCategory);
    form.append('monthlyEstimatedPurchase', String(body.monthlyEstimatedPurchase));
    form.append('idProof', files.idProof);
    form.append('businessAddressProof', files.businessAddressProof);

    const res = await publicFetch('/api/dropshipper/auth/register/create-payment', {
      method: 'POST',
      body: form,
    });
    return parseJson(res);
  },

  /**
   * POST /auth/register/verify-payment
   * Verifies Razorpay signature and puts request into admin pending queue
   */
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

  /**
   * GET /auth/register/status/:requestId?email=&phone=
   * Polls or retrieves registration approval status
   */
  async getRegistrationStatus(
    requestId: string,
    query: { email?: string; phone?: string }
  ): Promise<RegistrationStatusResponse> {
    const params = new URLSearchParams();
    if (query.email) params.set('email', query.email.trim());
    if (query.phone) params.set('phone', query.phone.trim());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await publicFetch(`/api/dropshipper/auth/register/status/${encodeURIComponent(requestId)}${queryString}`);
    return parseJson(res);
  },

  /**
   * POST /auth/activate/send-otp
   * Request email OTP after admin approval
   */
  async sendActivationOtp(body: { email?: string; phone?: string; dropshipperId?: string }) {
    const res = await publicFetch('/api/dropshipper/auth/activate/send-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return parseJson(res);
  },

  /**
   * POST /auth/activate/complete
   * Submit OTP + create login password (and optional confirmPassword)
   */
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

  /**
   * POST /auth/login
   * Dropshipper portal login: email/phone + password -> returns accessToken + refreshToken
   */
  async login(body: { email?: string; phone?: string; password: string }) {
    const res = await publicFetch('/api/dropshipper/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return parseJson(res);
  },

  /**
   * POST /auth/refresh
   * Public refresh of dropshipper access token
   */
  async refreshToken(refreshTokenParam?: string) {
    const refreshToken =
      refreshTokenParam ||
      (typeof window !== 'undefined' ? localStorage.getItem('dropshipper_refresh_token') : null);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const res = await publicFetch('/api/dropshipper/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    const data = await parseJson(res);
    if (data?.accessToken) {
      setAuthToken(data.accessToken);
    }
    return data;
  },

  /**
   * GET /auth/me
   * Fetches current dropshipper profile using Bearer JWT
   */
  async me() {
    const res = await apiFetch('/api/dropshipper/auth/me');
    return parseJson(res);
  },

  /**
   * POST /auth/logout
   * Blacklists current Bearer JWT and clears local session
   */
  async logout() {
    try {
      const res = await apiFetch('/api/dropshipper/auth/logout', { method: 'POST' });
      return await parseJson(res);
    } finally {
      clearDropshipperSession();
    }
  },
};
