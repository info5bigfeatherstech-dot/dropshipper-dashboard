export interface AdminDropshipperRequest {
  id: string;
  kind: 'registration' | 'renew';
  fullName: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  businessName?: string;
  amountDueInr: number;
  amountPaidInr: number;
  payment?: {
    status: 'pending' | 'paid' | 'failed';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    amountPaise?: number;
    paidAt?: string;
    currency?: string;
  };
  adminStatus: 'pending' | 'approved' | 'rejected';
  adminDecisionNote?: string;
  application?: {
    permanentAddress?: string;
    haveShop?: boolean;
    businessAddress?: string;
    deliveryAddress?: string;
    sellingPlaceFrom?: string;
    sellingZoneCity?: string;
    productCategory?: string;
    monthlyEstimatedPurchase?: number | string;
    idProofUrl?: string;
    businessAddressProofUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ListRequestsResponse {
  success: boolean;
  requests: AdminDropshipperRequest[];
  total: number;
  page: number;
  pages: number;
}

export function getStaffToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('dropshipper_staff_token') ||
    (import.meta.env.VITE_DROPSHIPPER_STAFF_TOKEN as string) ||
    ''
  );
}

export function setStaffToken(token: string): void {
  if (typeof window === 'undefined') return;
  if (token) {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    localStorage.setItem('dropshipper_staff_token', cleanToken);
  } else {
    localStorage.removeItem('dropshipper_staff_token');
  }
}

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const staffToken = getStaffToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (staffToken) {
    headers.set(
      'Authorization',
      staffToken.startsWith('Bearer ') ? staffToken : `Bearer ${staffToken}`
    );
  }

  const url = path.startsWith('/api') ? path : `/api/admin/dropshipper${path.startsWith('/') ? path : `/${path}`}`;

  return fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });
}

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

export const adminDropshipperService = {
  /**
   * GET /api/admin/dropshipper/requests
   * List all registration & renew requests
   */
  async listRequests(params?: {
    page?: number;
    limit?: number;
    adminStatus?: 'pending' | 'approved' | 'rejected' | 'all';
    status?: string;
    q?: string;
  }): Promise<ListRequestsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.adminStatus && params.adminStatus !== 'all') {
      searchParams.set('adminStatus', params.adminStatus);
    } else if (params?.status && params.status !== 'all') {
      searchParams.set('adminStatus', params.status);
    }
    if (params?.q) searchParams.set('q', params.q.trim());

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await adminFetch(`/requests${qs}`);
    return parseJson(res);
  },

  /**
   * GET /api/admin/dropshipper/requests/:id
   * Get single request details
   */
  async getRequest(id: string): Promise<{ success: boolean; request: AdminDropshipperRequest }> {
    const res = await adminFetch(`/requests/${encodeURIComponent(id)}`);
    return parseJson(res);
  },

  /**
   * POST /api/admin/dropshipper/requests/:id/approve
   * Approve paid registration or renew request
   */
  async approveRequest(id: string, note?: string) {
    const res = await adminFetch(`/requests/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
    return parseJson(res);
  },

  /**
   * POST /api/admin/dropshipper/requests/:id/reject
   * Reject paid registration or renew request
   */
  async rejectRequest(id: string, reason?: string) {
    const res = await adminFetch(`/requests/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return parseJson(res);
  },
};
