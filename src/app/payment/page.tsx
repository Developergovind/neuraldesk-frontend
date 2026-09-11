"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { PageLoader } from "@/components/ui/Loader";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SparklesIcon, CheckCircleIcon, CreditCardIcon, ShieldCheckIcon, BoltIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const requestedPlan = searchParams.get("plan");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const target = requestedPlan ? `/dashboard/subscription?plan=${requestedPlan}` : "/dashboard/subscription";
      router.replace(target);
    }
  }, [isAuthenticated, isLoading, requestedPlan, router]);

  if (isLoading) {
    return (
      <PageLoader
        text="Loading Payment Options..."
        subtext="Verifying session and fetching plan subscriptions"
        minHeight="min-h-screen"
      />
    );
  }

  const plans = [
    {
      id: "free",
      name: "Free Starter",
      badge: "Free Forever",
      priceMonthly: 0,
      priceAnnual: 0,
      description: "Perfect for testing and personal AI chatbot deployment.",
      highlight: false,
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
      badge: "Most Popular",
      priceMonthly: 29,
      priceAnnual: 24,
      description: "Supercharge your business with multi-bot deployment and live handoff.",
      highlight: true,
      features: [
        "Up to 5 AI Assistants",
        "50,000 Messages / month",
        "Deep Web Crawler (up to 50 subpages)",
        "Full Live Visitor Inbox & Handoff",
        "Custom Glassmorphic Branding",
        "Advanced Sentiment & User Analytics",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Scale",
      badge: "High Capacity",
      priceMonthly: 99,
      priceAnnual: 79,
      description: "Maximum compute, uncapped bots, and custom model fine-tuning.",
      highlight: false,
      features: [
        "Unlimited AI Assistants (∞)",
        "500,000 Messages / month",
        "Full Domain Deep Crawling & Bulk PDF",
        "Multi-Agent Orchestration & Webhooks",
        "Custom Fine-Tuning & Knowledge Graph",
        "99.9% Uptime SLA Guarantee",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen bg-obsidian-950 text-white selection:bg-coral-400/30 overflow-x-hidden">
      <Navbar />

      <main className="relative z-10 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-semibold mb-4 backdrop-blur-md">
            <SparklesIcon className="w-4 h-4" />
            <span>Secure & Transparent Billing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold mb-4 tracking-tight">
            Select Your Neural Plan
          </h1>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Deploy intelligent RAG AI chatbots across all your web platforms. Upgrade, downgrade, or cancel anytime.
          </p>

          <div className="inline-flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl mt-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-coral-500 text-white shadow-[0_0_20px_rgba(245,143,124,0.35)]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === "annual"
                  ? "bg-coral-500 text-white shadow-[0_0_20px_rgba(245,143,124,0.35)]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <Card
                  className={`relative flex flex-col justify-between h-full p-6 sm:p-8 rounded-3xl transition-all duration-300 ${
                    plan.highlight
                      ? "bg-[#1B1A20]/95 border-coral-500/50 shadow-[0_0_50px_rgba(245,143,124,0.2)]"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-coral-500 to-blush-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-white/50 text-xs sm:text-sm min-h-[40px] mb-6 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1.5 pb-6 mb-6 border-b border-white/5">
                      <span className="text-4xl sm:text-5xl font-heading font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-white/40 text-xs sm:text-sm font-medium">
                        / month {billingCycle === "annual" && price > 0 ? "(billed annually)" : ""}
                      </span>
                    </div>

                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                          <CheckCircleIcon className="w-5 h-5 text-coral-400 shrink-0 mt-0.5" />
                          <span className="text-white/80">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <Link href={`/register?plan=${plan.id}`}>
                      <Button
                        variant={plan.highlight ? "primary" : "secondary"}
                        size="lg"
                        className={`w-full justify-center text-sm font-semibold h-12 ${
                          plan.highlight ? "shadow-[0_0_25px_rgba(245,143,124,0.35)]" : ""
                        }`}
                      >
                        <span>{plan.id === "free" ? "Get Started Free" : `Subscribe to ${plan.name}`}</span>
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center text-xs text-white/40 flex items-center justify-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
          <span>256-bit encrypted checkout with Stripe integration and local server simulated support.</span>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <PageLoader
          text="Loading Payment..."
          subtext="Loading secure subscription checkout"
          minHeight="min-h-screen"
        />
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
