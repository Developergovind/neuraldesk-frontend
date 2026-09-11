"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/Loader";

export default function PricingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/#pricing");
  }, [router]);

  return (
    <PageLoader
      text="Loading Pricing..."
      subtext="Redirecting to pricing plans"
      minHeight="min-h-screen"
    />
  );
}
