import { create } from 'zustand';
import Cookies from 'js-cookie';

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
}

export const useAuthStore = create<AuthState>((set) => ({
  tenant: null,
  isAuthenticated: false,
  isLoading: true,

  login: (tenant, accessToken, refreshToken) => {
    Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'strict' });
    Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'strict', expires: 7 });
    Cookies.set('tenant', JSON.stringify(tenant), { secure: true, sameSite: 'strict' });
    
    set({ tenant, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('tenant');
    set({ tenant: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  checkAuth: () => {
    const token = Cookies.get('accessToken');
    const tenantStr = Cookies.get('tenant');
    
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
