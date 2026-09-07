import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
  return useQuery<BillingInfo>({
    queryKey: ["billing-plan"],
    queryFn: async () => {
      const res = await api.get("/stripe/plan");
      return res.data;
    },
    staleTime: 30000,
  });
}

export function useUpgradeCheckout() {
  return useMutation({
    mutationFn: async (plan: 'pro' | 'enterprise' = 'pro') => {
      const { data } = await api.post("/stripe/checkout", { plan });
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to start checkout session");
    }
  });
}
