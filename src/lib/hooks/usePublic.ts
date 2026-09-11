import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function resolvePublicApiBase() {
  let rawBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").trim();
  if (rawBase && (rawBase.includes('neuraldeskapp.duckdns.org') || rawBase.includes('neuraldesk-api.duckdns.org'))) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      rawBase = 'http://localhost:5001/api';
    }
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

export const DEFAULT_PUBLIC_PLANS = [
  {
    id: "free",
    name: "Free Starter",
    priceMonthly: 0,
    priceAnnual: 0,
    maxBots: 1,
    isPopular: false,
    features: [
      "1 Custom AI Assistant",
      "1,000 Messages / month",
      "Standard Llama 3 / Groq Model",
      "Web Ingestion (up to 5 pages)",
      "Standard Embeddable Widget",
    ],
  },
  {
    id: "pro",
    name: "Pro Neural",
    priceMonthly: 29,
    priceAnnual: 288,
    maxBots: 5,
    isPopular: true,
    features: [
      "Up to 5 AI Assistants",
      "50,000 Messages / month",
      "Deep Web Crawler (50 pages)",
      "Full Live Visitor Inbox & Handoff",
      "Custom Glassmorphic Branding",
      "Sentiment & Analytics Insights",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Scale",
    priceMonthly: 99,
    priceAnnual: 948,
    maxBots: 999,
    isPopular: false,
    features: [
      "Unlimited AI Assistants (∞)",
      "500,000 Messages / month",
      "Full Domain Bulk Crawling & PDF",
      "Multi-Agent Orchestration",
      "Custom Fine-Tuning & Knowledge Graph",
      "99.9% Uptime SLA & Priority Support",
    ],
  },
];

export function usePublicPlans() {
  return useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/public/plans`, { timeout: 4000 });
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch (err) {
        // Fallback to pre-defined plans if endpoint is unavailable
      }
      return DEFAULT_PUBLIC_PLANS;
    },
    initialData: DEFAULT_PUBLIC_PLANS,
    staleTime: 60000,
  });
}

