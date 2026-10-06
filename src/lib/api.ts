/** Dropshipper portal auth token only — not admin/staff JWT. */
const ACCESS_TOKEN_KEY = 'dropshipper_access_token';
const REFRESH_TOKEN_KEY = 'dropshipper_refresh_token';
const USER_KEY = 'dropshipper_user';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = String(token || '').replace(/^Bearer\s+/i, '').trim().split('.');
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * True only for dropshipper portal access JWTs (portal=dropshipper, type=access).
 * Rejects staff/admin/ecomm tokens and garbage strings.
 */
export function isDropshipperPortalAccessToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (String(payload.portal || '') !== 'dropshipper') return false;
  if (String(payload.type || '') !== 'access') return false;
  if (!payload.id) return false;
  const exp = Number(payload.exp);
  if (Number.isFinite(exp) && exp * 1000 <= Date.now()) return false;
  return true;
}

export const getAuthToken = (): string => {
  if (typeof window === 'undefined') return '';

  const portalToken = localStorage.getItem(ACCESS_TOKEN_KEY) || '';
  if (isDropshipperPortalAccessToken(portalToken)) {
    return portalToken;
  }

  // Legacy key — accept only if it is a real dropshipper portal token
  const legacy = localStorage.getItem('token') || '';
  if (isDropshipperPortalAccessToken(legacy)) {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, legacy);
    } catch {
      /* ignore */
    }
    return legacy;
  }

  // Stale / staff / ecomm tokens must not unlock the panel
  if (portalToken || legacy) {
    clearDropshipperSession();
  }

  // Dev bypass only — never treat staff JWT as a dropshipper login in production builds
  if (isAuthBypassed()) {
    return (
      localStorage.getItem('dropshipper_staff_token') ||
      (import.meta.env.VITE_DROPSHIPPER_STAFF_TOKEN as string) ||
      ''
    );
  }
  return '';
};

/** Whether the user may enter the authenticated dashboard shell. */
export const hasDropshipperPanelSession = (): boolean => {
  if (isAuthBypassed()) return true;
  return isDropshipperPortalAccessToken(getAuthToken());
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  if (token) {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    if (!isDropshipperPortalAccessToken(cleanToken)) {
      clearDropshipperSession();
      return;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, cleanToken);
    // Keep legacy key in sync for older helpers, but getAuthToken validates claims
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
          if (refreshData?.accessToken && isDropshipperPortalAccessToken(refreshData.accessToken)) {
            setAuthToken(refreshData.accessToken);
            headers.set('Authorization', `Bearer ${refreshData.accessToken}`);
            res = await fetch(url, {
              ...options,
              headers,
              credentials: options.credentials || 'include',
            });
          } else if (refreshRes.ok) {
            clearDropshipperSession();
          }
        }
      } catch {
        // Ignore refresh failure
      }
    }
  }

  return res;
}
