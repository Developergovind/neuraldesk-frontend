"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loader";
import { XCircleIcon, ArrowLeftIcon, CreditCardIcon } from "@heroicons/react/24/outline";

function PaymentCancelContent() {
  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-coral-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="p-6 sm:p-10 bg-[#16151a]/95 border-white/10 shadow-2xl text-center backdrop-blur-2xl">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 mb-6">
            <XCircleIcon className="w-10 h-10 text-coral-400" />
          </div>

          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wider mb-4">
            Payment Cancelled
          </span>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
            No Charges Were Made
          </h1>
          <p className="text-white/60 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed mb-8">
            The checkout session was canceled or timed out. Your account and existing tier remain unchanged.
          </p>

          <div className="space-y-3">
            <Link href="/dashboard/subscription" className="block w-full">
              <Button variant="primary" size="lg" className="w-full justify-center shadow-[0_0_25px_rgba(245,143,124,0.35)]">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Return to Plans & Pricing
              </Button>
            </Link>

            <Link href="/dashboard" className="block w-full">
              <Button variant="glass" size="md" className="w-full justify-center">
                <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <PageLoader
          text="Loading..."
          subtext="Please wait"
          minHeight="min-h-screen"
        />
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
