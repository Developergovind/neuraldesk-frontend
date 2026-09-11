import { create } from 'zustand';
import Cookies from 'js-cookie';
import { isDisposableEmail } from '@/lib/disposableEmail';

interface Tenant {
  id: string;
  email: string;
  name: string;
  company: string;
  plan: string;
}

interface AuthState {
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tenant: Tenant, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => void;
  updateTenant: (partial: Partial<Tenant>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  tenant: null,
  isAuthenticated: false,
  isLoading: true,

  login: (tenant, accessToken, refreshToken) => {
    if (!tenant || !tenant.email || isDisposableEmail(tenant.email)) {
      // Disposable emails are blocked and suspended
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('tenant');
      if (typeof window !== "undefined") {
        localStorage.removeItem("tenant");
      }
      set({ tenant: null, isAuthenticated: false, isLoading: false });
      return;
    }

    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    Cookies.set('accessToken', accessToken, { secure: isHttps, sameSite: 'strict' });
    Cookies.set('refreshToken', refreshToken, { secure: isHttps, sameSite: 'strict', expires: 7 });
    Cookies.set('tenant', JSON.stringify(tenant), { secure: isHttps, sameSite: 'strict' });
    if (typeof window !== "undefined") {
      localStorage.setItem("tenant", JSON.stringify(tenant));
    }
    
    set({ tenant, isAuthenticated: true, isLoading: false });
  },

  updateTenant: (partial) => {
    const current = get().tenant;
    if (!current) return;
    const updated = { ...current, ...partial };
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    Cookies.set('tenant', JSON.stringify(updated), { secure: isHttps, sameSite: 'strict' });
    if (typeof window !== "undefined") {
      localStorage.setItem("tenant", JSON.stringify(updated));
    }
    set({ tenant: updated });
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('tenant');
    if (typeof window !== "undefined") {
      localStorage.removeItem("tenant");
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("neuraldesk_bot_chats_") || key.startsWith("neuraldesk_active_chat_")) {
          localStorage.removeItem(key);
        }
      });
    }
    set({ tenant: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  checkAuth: () => {
    const token = Cookies.get('accessToken');
    const tenantStr = Cookies.get('tenant');
    
    if (token && tenantStr) {
      try {
        const tenant = JSON.parse(tenantStr);
        if (tenant?.email && isDisposableEmail(tenant.email)) {
          // Blocked disposable email session, purge immediately
          get().logout();
          return;
        }
        set({ tenant, isAuthenticated: true, isLoading: false });
      } catch (e) {
        set({ tenant: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ tenant: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

