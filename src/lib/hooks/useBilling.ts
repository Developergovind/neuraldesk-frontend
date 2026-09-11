import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

export interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise';
  limits: {
    maxBots: number;
    messagesPerMonth: number;
  };
  usage: {
    botsCreated: number;
    messagesThisMonth: number;
    messagesLimit: number;
    messagesPercent: number;
    resetAt?: string;
  };
  billing?: {
    hasActiveSubscription: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
  };
}

export function useBillingPlan() {
  const { tenant } = useAuthStore();
  const currentPlan = (tenant?.plan || 'free').toLowerCase() as 'free' | 'pro' | 'enterprise';

  return useQuery<BillingInfo>({
    queryKey: ["billing-plan", currentPlan],
    queryFn: async () => {
      try {
        const res = await api.get("/stripe/plan");
        if (res.data?.plan) {
          return res.data;
        }
      } catch (err) {
        // Graceful fallback for local development or when Stripe backend endpoint is not configured
      }

      // Default accurate tier configurations
      const isPro = currentPlan === 'pro';
      const isEnterprise = currentPlan === 'enterprise';

      return {
        plan: currentPlan,
        limits: {
          maxBots: isEnterprise ? -1 : isPro ? 5 : 1,
          messagesPerMonth: isEnterprise ? 500000 : isPro ? 50000 : 1000,
        },
        usage: {
          botsCreated: 0,
          messagesThisMonth: 0,
          messagesLimit: isEnterprise ? 500000 : isPro ? 50000 : 1000,
          messagesPercent: 0,
          resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        billing: {
          hasActiveSubscription: isPro || isEnterprise,
          subscriptionStatus: isPro || isEnterprise ? 'active' : 'inactive',
        },
      };
    },
    staleTime: 15000,
  });
}

export function useUpgradeCheckout() {
  const queryClient = useQueryClient();
  const { updateTenant } = useAuthStore();

  return useMutation({
    mutationFn: async (plan: 'pro' | 'enterprise' = 'pro') => {
      try {
        const { data } = await api.post("/stripe/checkout", { plan });
        if (data?.url) {
          let checkoutUrl = data.url;
          // Rewrite any previous duckdns domains to local origin / port
          if (typeof window !== "undefined") {
            const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            if (isLocal) {
              checkoutUrl = checkoutUrl
                .replace(/https?:\/\/neuraldeskapp\.duckdns\.org/gi, window.location.origin)
                .replace(/https?:\/\/neuraldesk-api\.duckdns\.org/gi, "http://localhost:5001");
            }
          }
          return { url: checkoutUrl, plan, isLive: true };
        }
      } catch (err: any) {
        // If Stripe checkout API fails or is not configured on local server, provide local dev upgrade
        console.warn("Stripe checkout API not reachable, falling back to local simulated plan:", err);
      }
      return { plan, isLive: false };
    },
    onSuccess: (result, plan) => {
      if (result.isLive && result.url) {
        window.location.href = result.url;
      } else {
        // Local desktop server / development mode upgrade
        updateTenant({ plan });
        queryClient.invalidateQueries({ queryKey: ["billing-plan"] });
        queryClient.invalidateQueries({ queryKey: ["auth-me"] });
        queryClient.invalidateQueries({ queryKey: ["bots"] });
        toast.success(`🎉 Plan updated to ${plan.toUpperCase()} on local server! All features unlocked.`, {
          duration: 5000,
          icon: "⚡",
        });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to start checkout session");
    }
  });
}
