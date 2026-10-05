/** Dropshipper portal auth token only — not admin/staff JWT. */
const ACCESS_TOKEN_KEY = 'dropshipper_access_token';
const REFRESH_TOKEN_KEY = 'dropshipper_refresh_token';
const USER_KEY = 'dropshipper_user';

export const getAuthToken = (): string => {
  if (typeof window === 'undefined') return '';
  // Real dropshipper session first
  const portalToken = localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('token');
  if (portalToken) return portalToken;

  // Dev bypass only — never treat staff JWT as a dropshipper login
  if (isAuthBypassed()) {
    return (
      localStorage.getItem('dropshipper_staff_token') ||
      (import.meta.env.VITE_DROPSHIPPER_STAFF_TOKEN as string) ||
      ''
    );
  }
  return '';
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  if (token) {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    localStorage.setItem(ACCESS_TOKEN_KEY, cleanToken);
    localStorage.setItem('token', cleanToken);
  } else {
    clearDropshipperSession();
  }
};

export const setDropshipperSession = (payload: {
  accessToken?: string | null;
  refreshToken?: string | null;
  dropshipper?: unknown;
  user?: unknown;
}): void => {
  if (typeof window === 'undefined') return;
  if (payload.accessToken) {
    setAuthToken(String(payload.accessToken));
  }
  if (payload.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, String(payload.refreshToken));
  }
  const profile = payload.dropshipper || payload.user;
  if (profile) {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    localStorage.setItem('user', JSON.stringify(profile));
  }
};

export const getDropshipperUser = (): any => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearDropshipperSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Do not clear staff bypass helpers — those are env/local-dev only
};

export const isAuthBypassed = (): boolean => {
  return String(import.meta.env.VITE_DROPSHIPPER_AUTH_BYPASS || '').toLowerCase() === 'true';
};

/**
 * Standard fetch wrapper. Attaches dropshipper Bearer only when a portal session exists
 * (or bypass staff token when DROPSHIPPER_AUTH_BYPASS=true).
 * Automatically attempts silent token refresh with /auth/refresh upon 401.
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token) {
    headers.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });

  // If 401 Unauthorized and not already calling auth routes, try silent refresh
  if (res.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh') && !url.includes('/auth/logout')) {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    if (refreshToken) {
      try {
        const refreshRes = await fetch('/api/dropshipper/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData?.accessToken) {
            setAuthToken(refreshData.accessToken);
            headers.set('Authorization', `Bearer ${refreshData.accessToken}`);
            res = await fetch(url, {
              ...options,
              headers,
              credentials: options.credentials || 'include',
            });
          }
        }
      } catch {
        // Ignore refresh failure
      }
    }
  }

  return res;
}
