import axios from 'axios';
import Cookies from 'js-cookie';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
export const WS_BASE  = process.env.NEXT_PUBLIC_WS_URL  || 'http://localhost:5001';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken,
        });

        Cookies.set('accessToken', data.accessToken, { secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', data.refreshToken, { secure: true, sameSite: 'strict', expires: 7 });
        
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
          window.location.href = '/login';
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
