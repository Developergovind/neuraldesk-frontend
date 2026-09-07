import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function resolvePublicApiBase() {
  let rawBase = process.env.NEXT_PUBLIC_API_URL || "https://neuraldesk-api.duckdns.org/api";
  if (rawBase && rawBase.includes('neuraldeskapp.duckdns.org')) {
    rawBase = rawBase.replace('neuraldeskapp.duckdns.org', 'neuraldesk-api.duckdns.org');
  }
  const normalized = rawBase.replace(/\/+$/, "");
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
