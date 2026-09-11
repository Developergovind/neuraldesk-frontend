"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/Loader";

function BillingRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const query = params ? `?${params}` : "";
    // Redirect cleanly to subscription management page with any success/session query params
    router.replace(`/dashboard/subscription${query}`);
  }, [router, searchParams]);

  return (
    <PageLoader
      text="Loading Billing..."
      subtext="Routing to your workspace subscription management"
      minHeight="min-h-screen"
    />
  );
}

export default function BillingRedirectPage() {
  return (
    <Suspense
      fallback={
        <PageLoader
          text="Loading Billing..."
          subtext="Routing to your workspace subscription management"
          minHeight="min-h-screen"
        />
      }
    >
      <BillingRedirectContent />
    </Suspense>
  );
}
