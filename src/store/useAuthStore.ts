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
    if (!tenant || !tenant.email) {
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
    Cookies.set('accessToken', accessToken, { secure: isHttps, sameSite: 'lax', expires: 7 });
    Cookies.set('refreshToken', refreshToken, { secure: isHttps, sameSite: 'lax', expires: 7 });
    Cookies.set('tenant', JSON.stringify(tenant), { secure: isHttps, sameSite: 'lax', expires: 7 });
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
    Cookies.set('tenant', JSON.stringify(updated), { secure: isHttps, sameSite: 'lax', expires: 7 });
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
    const token = Cookies.get('accessToken') || Cookies.get('refreshToken');
    const tenantStr = Cookies.get('tenant') || (typeof window !== "undefined" ? localStorage.getItem('tenant') : null);
    
    if (token && tenantStr) {
      try {
        const tenant = JSON.parse(tenantStr);
        set({ tenant, isAuthenticated: true, isLoading: false });
      } catch (e) {
        set({ tenant: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ tenant: null, isAuthenticated: false, isLoading: false });
    }
  },

}));

