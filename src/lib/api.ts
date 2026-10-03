export const getAuthToken = (): string => {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('dropshipper_staff_token') ||
    (import.meta.env.VITE_DROPSHIPPER_STAFF_TOKEN as string) ||
    ''
  );
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  if (token) {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    localStorage.setItem('token', cleanToken);
    localStorage.setItem('dropshipper_staff_token', cleanToken);
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('dropshipper_staff_token');
    localStorage.removeItem('user');
  }
};

export const isAuthBypassed = (): boolean => {
  return import.meta.env.VITE_DROPSHIPPER_AUTH_BYPASS === 'true';
};

/**
 * Standard fetch wrapper that automatically attaches the Staff / Admin Bearer token
 * to every request.
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

  // Attach Bearer token if present
  if (token) {
    headers.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include'
  });
}
