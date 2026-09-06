import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function resolvePublicApiBase() {
  let rawBase = process.env.NEXT_PUBLIC_API_URL;
  if (rawBase && rawBase.includes('neuraldeskapp.duckdns.org')) {
    rawBase = rawBase.replace('neuraldeskapp.duckdns.org', 'neuraldesk-api.duckdns.org');
  }
  if (typeof window !== 'undefined') {
    const isCurrentSiteLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    if (!isCurrentSiteLocalhost) {
      if (!rawBase || rawBase.includes('localhost') || rawBase.includes('127.0.0.1')) {
        rawBase = "https://neuraldesk-api.duckdns.org/api";
      }
    }
  }
  const base = rawBase || "https://neuraldesk-api.duckdns.org/api";
  const normalized = base.replace(/\/+$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

const API_BASE = resolvePublicApiBase();

export function usePublicContent(keys: string | string[]) {
  const queryKeys = Array.isArray(keys) ? keys.join(",") : keys;
  
  return useQuery({
    queryKey: ["public-content", queryKeys],
    queryFn: async () => {
      if (Array.isArray(keys)) {
        const { data } = await axios.get(`${API_BASE}/public/content?keys=${queryKeys}`);
        return data;
      } else {
        const { data } = await axios.get(`${API_BASE}/public/content/${keys}`);
        return data;
      }
    },
    staleTime: 60000, // 1 minute
  });
}

export function usePublicPlans() {
  return useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/public/plans`);
      return data;
    },
    staleTime: 60000,
  });
}
