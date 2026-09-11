"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { PageLoader } from "@/components/ui/Loader";

export default function SubscriptionRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard/subscription");
      } else {
        router.replace("/#pricing");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <PageLoader
      text="Loading Subscription..."
      subtext="Routing to your workspace subscription management"
      minHeight="min-h-screen"
    />
  );
}
