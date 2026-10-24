const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admission_access_token');
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admission_access_token', token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admission_access_token');
    localStorage.removeItem('admission_user');
  }
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('admission_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admission_user', JSON.stringify(user));
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
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
  });

  const responseJson = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg =
      responseJson.message ||
      (Array.isArray(responseJson.message)
        ? responseJson.message.join(', ')
        : 'Request failed');
    throw new Error(errorMsg);
  }

  return responseJson.data !== undefined ? responseJson.data : responseJson;
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  sendOtp: (data: { identifier: string }) =>
    apiRequest('/auth/otp/send', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: { identifier: string; otp: string }) =>
    apiRequest('/auth/otp/verify', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),

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
