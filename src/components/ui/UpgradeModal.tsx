"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUpgradeCheckout } from "@/lib/hooks/useBilling";
import {
  SparklesIcon,
  XMarkIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ArrowRightIcon,
  BoltIcon
} from "@heroicons/react/24/outline";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  currentCount?: number;
  maxLimit?: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  title = "Unlock More AI Assistants",
  description = "You've reached your Free Plan limit (1 AI bot). Upgrade your subscription to deploy multiple neural bots and supercharge your customer support.",
  currentCount = 1,
  maxLimit = 1,
}) => {
  const router = useRouter();
  const upgradeCheckout = useUpgradeCheckout();

  if (!isOpen) return null;

  const handleGoToBilling = () => {
    onClose();
    router.push("/dashboard/subscription");
  };

  const handleDirectUpgrade = () => {
    upgradeCheckout.mutate("pro", {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const features = [
    "Up to 5 AI Assistants & Neural Models",
    "50,000 Messages / month with priority compute",
    "Full Live Inbox & Real-Time Visitor Handoff",
    "Custom widget branding & color themes",
    "Advanced conversation analytics & insights",
    "Priority support & dedicated API access",
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="relative w-full max-w-xl z-10 my-8"
        >
          <Card className="relative overflow-hidden border-coral-500/30 bg-[#16151a]/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,143,124,0.2)] backdrop-blur-2xl">
            {/* Background Glows */}
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-coral-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-blush-500/15 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-500/20 text-coral-400 text-xs font-bold uppercase tracking-wider border border-coral-500/30">
                <SparklesIcon className="w-4 h-4 text-coral-400 animate-pulse" />
                Subscription Upgrade Required
              </span>
              <span className="text-xs text-white/40 font-medium">
                {currentCount}/{maxLimit === -1 ? '∞' : maxLimit} Bots Used
              </span>
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight mb-2">
              {title}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {description}
            </p>

            {/* Plan Features Showcase Box */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 mb-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-coral-500/20 text-coral-400">
                    <BoltIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Pro Plan Upgrade</h4>
                    <p className="text-[11px] text-white/40">Scale your automation with full access</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white font-heading">$29</span>
                  <span className="text-xs text-white/40">/month</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                    <CheckCircleIcon className="w-4 h-4 text-coral-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-[0_0_25px_rgba(245,143,124,0.35)] font-semibold text-sm"
                onClick={handleGoToBilling}
              >
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Go to Upgrade Subscription Page
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="glass"
                  size="md"
                  className="flex-1 justify-center text-xs"
                  onClick={handleDirectUpgrade}
                  isLoading={upgradeCheckout.isPending}
                >
                  <SparklesIcon className="w-4 h-4 mr-1.5 text-coral-400" />
                  Instant Pro Checkout
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="text-xs text-white/40 hover:text-white"
                  onClick={onClose}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
