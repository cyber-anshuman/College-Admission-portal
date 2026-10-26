const API_BASE_URL = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// In-memory access token storage (never persisted to localStorage)
let inMemoryAccessToken: string | null = null;

// Purge any legacy tokens or profile PII from localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('admission_access_token');
    localStorage.removeItem('admission_user');
  } catch {}
}

export function getStoredToken(): string | null {
  return inMemoryAccessToken;
}

export function setStoredToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function clearStoredToken(): void {
  inMemoryAccessToken = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('admission_access_token');
      localStorage.removeItem('admission_user');
    } catch {}
  }
}

let refreshPromise: Promise<string | null> | null = null;

export async function bootstrapSession(): Promise<any | null> {
  if (refreshPromise) {
    const token = await refreshPromise;
    if (!token) return null;
    return api.getMe().catch(() => null);
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.status === 401) {
        clearStoredToken();
        return null;
      }

      if (!res.ok) {
        // Transient 503 or server error - keep state, do not redirect
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Service temporarily unavailable (${res.status})`);
      }

      const json = await res.json();
      const token = json.data?.accessToken || json.accessToken;
      if (token) {
        setStoredToken(token);
        return token;
      }
      return null;
    } catch (err: any) {
      if (err.message && err.message.includes('unavailable')) {
        throw err;
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  const token = await refreshPromise;
  if (!token) return null;
  return api.getMe().catch(() => null);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 with silent token refresh
  if (
    res.status === 401 &&
    !isRetry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh')
  ) {
    try {
      const user = await bootstrapSession();
      if (user && getStoredToken()) {
        return apiRequest<T>(endpoint, options, true);
      } else {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    } catch {
      // If refresh threw a 503 / network error, let it propagate without redirecting
    }
  }

  const responseJson = await res.json().catch(() => ({}));

  if (!res.ok) {
    let errorMsg = 'Request failed';
    if (Array.isArray(responseJson.message)) {
      errorMsg = responseJson.message.join(', ');
    } else if (typeof responseJson.message === 'string' && responseJson.message.trim()) {
      errorMsg = responseJson.message;
    } else if (typeof responseJson.error === 'string' && responseJson.error.trim()) {
      errorMsg = responseJson.error;
    } else if (res.statusText) {
      errorMsg = `${res.statusText} (${res.status})`;
    } else {
      errorMsg = `Request failed with status ${res.status}`;
    }
    throw new Error(errorMsg);
  }

  return responseJson.data !== undefined ? responseJson.data : responseJson;
}

export const api = {
  // Auth
  getConfig: () => apiRequest<{ otpEnabled: boolean }>('/auth/config'),
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  sendOtp: (data: { identifier: string }) =>
    apiRequest('/auth/otp/send', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: { identifier: string; otp: string }) =>
    apiRequest('/auth/otp/verify', { method: 'POST', body: JSON.stringify(data) }),
  refresh: () => apiRequest('/auth/refresh', { method: 'POST' }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
  bootstrapSession,

  // Programs & Seats
  getPrograms: (activeOnly = true) =>
    apiRequest(`/programs?activeOnly=${activeOnly}`),
  getProgramByCode: (code: string) => apiRequest(`/programs/${code}`),
  getQuotas: (programId: string) => apiRequest(`/seats/program/${programId}`),

  // Users & Audit
  getUsers: (role?: string) =>
    apiRequest(`/users${role ? `?role=${role}` : ''}`),
  getAuditLogs: (page = 1, limit = 50) =>
    apiRequest(`/users/audit-logs?page=${page}&limit=${limit}`),
};
