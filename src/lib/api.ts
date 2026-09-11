import axios from 'axios';
import Cookies from 'js-cookie';
import { isDisposableEmail, BLOCKED_EMAIL_MESSAGE } from './disposableEmail';

const isHttps = () => typeof window !== 'undefined' && window.location.protocol === 'https:';

const getApiBase = () => {
  let url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').trim();
  if (url && (url.includes('neuraldeskapp.duckdns.org') || url.includes('neuraldesk-api.duckdns.org'))) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      url = 'http://localhost:5001/api';
    }
  }
  const normalized = url.replace(/\/+$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const API_BASE = getApiBase();

const getWsBase = () => {
  let wsUrl = process.env.NEXT_PUBLIC_WS_URL ? process.env.NEXT_PUBLIC_WS_URL.trim() : undefined;
  let apiUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.trim() : undefined;

  if (typeof window !== 'undefined') {
    const isCurrentSiteLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';

    if (isCurrentSiteLocalhost) {
      return 'http://localhost:5001';
    }
  }

  const getOrigin = (urlStr: string) => {
    try {
      if (urlStr.startsWith('http')) {
        return new URL(urlStr).origin;
      }
      return urlStr;
    } catch {
      return urlStr;
    }
  };

  if (wsUrl) return getOrigin(wsUrl);
  if (apiUrl) return getOrigin(apiUrl);
  return 'http://localhost:5001';
};

export const WS_BASE = getWsBase();

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token and validate emails
api.interceptors.request.use(
  (config) => {
    // Intercept and block any auth attempts using disposable emails
    if (
      (config.url?.includes('/auth/login') || 
       config.url?.includes('/auth/register') || 
       config.url?.includes('/auth/forgot-password')) &&
      config.data
    ) {
      let email = "";
      if (typeof config.data === "string") {
        try {
          const parsed = JSON.parse(config.data);
          email = parsed.email || "";
        } catch {}
      } else if (typeof config.data === "object") {
        email = config.data.email || "";
      }

      if (email && isDisposableEmail(email)) {
        return Promise.reject({
          response: {
            data: {
              message: BLOCKED_EMAIL_MESSAGE,
            },
            status: 400,
          },
          message: BLOCKED_EMAIL_MESSAGE,
        });
      }
    }

    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        // No refresh token, force logout
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('tenant');
        if (typeof window !== 'undefined') {
          const isDashboard = window.location.pathname.startsWith('/dashboard');
          if (isDashboard) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken,
        });

        Cookies.set('accessToken', data.accessToken, { secure: isHttps(), sameSite: 'lax', expires: 7 });
        Cookies.set('refreshToken', data.refreshToken, { secure: isHttps(), sameSite: 'lax', expires: 7 });

        
        api.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
        originalRequest.headers.Authorization = 'Bearer ' + data.accessToken;
        
        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('tenant');
        if (typeof window !== 'undefined') {
          const isDashboard = window.location.pathname.startsWith('/dashboard');
          if (isDashboard) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Named exports for convenience
export const get = <T>(url: string, config = {}) => api.get<T>(url, config).then(res => res.data);
export const post = <T>(url: string, data = {}, config = {}) => api.post<T>(url, data, config).then(res => res.data);
export const patch = <T>(url: string, data = {}, config = {}) => api.patch<T>(url, data, config).then(res => res.data);
export const del = <T>(url: string, config = {}) => api.delete<T>(url, config).then(res => res.data);
export const postForm = <T>(url: string, data: FormData, config = {}) => 
  api.post<T>(url, data, { ...config, headers: { ...((config as any).headers || {}), 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
