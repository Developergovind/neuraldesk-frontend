"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuthStore } from "@/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loader";
import { CheckCircleIcon, SparklesIcon, ArrowRightIcon, BoltIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { tenant, updateTenant } = useAuthStore();

  const planParam = searchParams.get("plan") || "pro";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Fire confetti celebration
    const end = Date.now() + 2.5 * 1000;
    const colors = ["#F58F7C", "#F8A1B5", "#10B981", "#6366F1"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Update active plan in store
    if (planParam === "pro" || planParam === "enterprise") {
      updateTenant({ plan: planParam });
    }

    // Refresh billing and auth caches
    queryClient.invalidateQueries({ queryKey: ["billing-plan"] });
    queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    queryClient.invalidateQueries({ queryKey: ["bots"] });
  }, [planParam, queryClient, updateTenant]);

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-coral-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="p-6 sm:p-10 bg-[#16151a]/95 border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.15)] text-center backdrop-blur-2xl">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircleIcon className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Payment Confirmed & Plan Activated</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
            Welcome to {planParam.toUpperCase()} Tier!
          </h1>
          <p className="text-white/60 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed mb-8">
            Your payment was successful and all advanced AI assistant limits and features have been unlocked for your organization.
          </p>

          {/* Details Pill */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 mb-8 text-left space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Active Tier:</span>
              <span className="text-white font-bold capitalize">{planParam} Tier</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Status:</span>
              <span className="text-emerald-400 font-semibold">Active & Verified</span>
            </div>
            {sessionId && (
              <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                <span className="text-white/40">Reference ID:</span>
                <span className="text-white/60 font-mono text-[11px] truncate max-w-[200px]">
                  {sessionId}
                </span>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link href="/dashboard" className="block w-full">
              <Button variant="primary" size="lg" className="w-full justify-center shadow-[0_0_25px_rgba(245,143,124,0.35)]">
                <Squares2X2Icon className="w-5 h-5 mr-2" />
                Go to Dashboard
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/dashboard/bots/new" className="block w-full">
              <Button variant="glass" size="md" className="w-full justify-center">
                <BoltIcon className="w-4 h-4 mr-1.5 text-coral-400" />
                Deploy New AI Assistant
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <PageLoader
          text="Finalizing Subscription..."
          subtext="Verifying payment confirmation"
          minHeight="min-h-screen"
        />
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
