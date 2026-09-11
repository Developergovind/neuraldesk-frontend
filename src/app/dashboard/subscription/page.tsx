"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loader";
import { useAuthStore } from "@/store/useAuthStore";
import { useBillingPlan, useUpgradeCheckout } from "@/lib/hooks/useBilling";
import { useBots } from "@/lib/hooks/useBots";
import {
  SparklesIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  InboxStackIcon,
  DocumentTextIcon,
  CheckIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

function SubscriptionContent() {
  const { tenant, updateTenant } = useAuthStore();
  const { data: billingInfo, isLoading: isBillingLoading } = useBillingPlan();
  const { data: bots } = useBots();
  const upgradeCheckout = useUpgradeCheckout();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const currentPlan = (billingInfo?.plan || tenant?.plan || "free").toLowerCase();
  const botsCount = bots?.length || 0;
  const maxBots = billingInfo?.limits?.maxBots ?? (currentPlan === "enterprise" ? -1 : currentPlan === "pro" ? 5 : 1);
  const maxMessages = billingInfo?.limits?.messagesPerMonth ?? (currentPlan === "enterprise" ? 500000 : currentPlan === "pro" ? 50000 : 1000);
  const messagesUsed = billingInfo?.usage?.messagesThisMonth ?? 0;

  const handleSelectPlan = (plan: "free" | "pro" | "enterprise") => {
    if (plan === currentPlan) {
      toast("You are currently on this plan.", { icon: "ℹ️" });
      return;
    }

    if (plan === "free") {
      updateTenant({ plan: "free" });
      toast.success("Switched to Free Starter plan on local server.");
      return;
    }

    upgradeCheckout.mutate(plan);
  };

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
        { text: "1 Custom AI Assistant", enabled: true },
        { text: "1,000 Messages / month", enabled: true },
        { text: "Standard Llama 3 / Groq Model", enabled: true },
        { text: "Web Ingestion (up to 5 pages)", enabled: true },
        { text: "Standard Embeddable Widget", enabled: true },
        { text: "Live Visitor Inbox & Human Handoff", enabled: false },
        { text: "Custom Branding & Domain", enabled: false },
        { text: "Priority Support SLA", enabled: false },
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
        { text: "Up to 5 AI Assistants", enabled: true },
        { text: "50,000 Messages / month", enabled: true },
        { text: "Deep Web Crawler (up to 50 subpages)", enabled: true },
        { text: "Full Live Visitor Inbox & Handoff", enabled: true },
        { text: "Custom Glassmorphic Branding & Colors", enabled: true },
        { text: "Advanced Sentiment & User Analytics", enabled: true },
        { text: "Priority Fast-Inference Compute", enabled: true },
        { text: "Email & Chat Support", enabled: true },
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
        { text: "Unlimited AI Assistants (∞)", enabled: true },
        { text: "500,000 Messages / month", enabled: true },
        { text: "Full Domain Deep Crawling & Bulk PDF", enabled: true },
        { text: "Multi-Agent Orchestration & Webhooks", enabled: true },
        { text: "Custom Fine-Tuning & Knowledge Graph", enabled: true },
        { text: "99.9% Uptime SLA Guarantee", enabled: true },
        { text: "Dedicated Account Architect", enabled: true },
        { text: "24/7 Phone & Slack Support", enabled: true },
      ],
    },
  ];

  const faqs = [
    {
      q: "Can I upgrade, downgrade, or cancel anytime?",
      a: "Yes! You can switch between plans at any time. When upgrading, your new limits and capabilities unlock instantly.",
    },
    {
      q: "How does the local server / desktop plan testing work?",
      a: "On your local server or development desktop, plan selections activate instantly with full feature parity, allowing you to test all Pro and Enterprise bot limits without needing external live Stripe credentials.",
    },
    {
      q: "What happens when I reach my monthly message limit?",
      a: "Your AI bots will continue operating seamlessly. You will receive a friendly dashboard reminder to upgrade your tier or adjust your limits before any throttling occurs.",
    },
    {
      q: "How does Live Visitor Inbox & Human Handoff work?",
      a: "Pro and Enterprise tiers include our real-time Live Inbox where you can monitor visitor conversations live and take over from the AI assistant with a single click.",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">
              Subscription & Plans
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-coral-500/20 text-coral-400 border border-coral-500/30">
              {currentPlan} Plan
            </span>
          </div>
          <p className="text-white/50 text-xs sm:text-sm mt-1.5">
            Manage your organization tier, compute allocation, and assistant limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings?tab=billing">
            <Button variant="glass" size="sm" className="gap-2">
              <CreditCardIcon className="w-4 h-4" />
              Settings & Invoices
            </Button>
          </Link>
        </div>
      </div>

      {/* Current Usage Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Active Tier */}
        <Card className="p-5 bg-white/[0.02] border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/50 font-medium">Current Plan</span>
            <div className="p-2 rounded-xl bg-coral-500/10 text-coral-400">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-heading font-bold text-white capitalize">{currentPlan}</p>
          <p className="text-xs text-white/40 mt-1">
            {currentPlan === "free" ? "Free Forever • Upgrade to expand" : "Active Subscription • Full Access"}
          </p>
        </Card>

        {/* Card 2: AI Bots Limit */}
        <Card className="p-5 bg-white/[0.02] border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/50 font-medium">Assistant Bots</span>
            <div className="p-2 rounded-xl bg-blush-500/10 text-blush-400">
              <BoltIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-heading font-bold text-white">{botsCount}</span>
            <span className="text-xs text-white/40">/ {maxBots === -1 ? "∞ Unlimited" : maxBots}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-coral-500 to-blush-400 rounded-full"
              style={{
                width: `${maxBots === -1 ? 15 : Math.min((botsCount / maxBots) * 100, 100)}%`,
              }}
            />
          </div>
        </Card>

        {/* Card 3: Messages Limit */}
        <Card className="p-5 bg-white/[0.02] border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/50 font-medium">Monthly Messages</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowPathIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-heading font-bold text-white">{messagesUsed.toLocaleString()}</span>
            <span className="text-xs text-white/40">/ {maxMessages.toLocaleString()}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{
                width: `${Math.min((messagesUsed / maxMessages) * 100, 100)}%`,
              }}
            />
          </div>
        </Card>

        {/* Card 4: Live Inbox & Features */}
        <Card className="p-5 bg-white/[0.02] border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/50 font-medium">Live Inbox Access</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <InboxStackIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-heading font-bold text-white">
            {currentPlan === "free" ? "Locked (Pro)" : "Active & Unlocked"}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {currentPlan === "free" ? "Upgrade to enable human agent handoff" : "Real-time live visitor handoff enabled"}
          </p>
        </Card>
      </div>

      {/* Billing Cycle Switcher */}
      <div className="text-center pt-6">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
          Select Your Workspace Tier
        </h2>
        <p className="text-white/50 text-xs sm:text-sm max-w-lg mx-auto mb-6">
          Scale your customer automation seamlessly. Upgrade or switch tiers anytime.
        </p>

        <div className="inline-flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 sm:px-7 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-coral-500 text-white shadow-[0_0_20px_rgba(245,143,124,0.35)]"
                : "text-white/50 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-5 sm:px-7 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
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

      {/* 3 Tier Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-2">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
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
                {/* Popular / Active Badge */}
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-coral-500 to-blush-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-heading font-bold text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <p className="text-white/50 text-xs sm:text-sm min-h-[40px] mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 pb-6 mb-6 border-b border-white/5">
                    <span className="text-4xl sm:text-5xl font-heading font-bold text-white">
                      ${price}
                    </span>
                    <span className="text-white/40 text-xs sm:text-sm font-medium">
                      / month {billingCycle === "annual" && price > 0 ? "(billed annually)" : ""}
                    </span>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                        {feat.enabled ? (
                          <CheckCircleIcon className="w-5 h-5 text-coral-400 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center shrink-0 mt-0.5 opacity-30">
                            <span className="text-white text-xs">-</span>
                          </div>
                        )}
                        <span className={feat.enabled ? "text-white/80" : "text-white/30 line-through"}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA Button */}
                <div className="pt-4 border-t border-white/5">
                  <Button
                    variant={isCurrent ? "glass" : plan.highlight ? "primary" : "secondary"}
                    size="lg"
                    className={`w-full justify-center text-sm font-semibold h-12 ${
                      plan.highlight && !isCurrent
                        ? "shadow-[0_0_25px_rgba(245,143,124,0.35)]"
                        : ""
                    }`}
                    disabled={isCurrent}
                    onClick={() => handleSelectPlan(plan.id as any)}
                    isLoading={upgradeCheckout.isPending}
                  >
                    {isCurrent
                      ? "Current Active Plan"
                      : plan.id === "free"
                      ? "Downgrade to Free"
                      : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Local Dev / Desktop Simulation Note */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-coral-500/10 text-coral-400 shrink-0">
            <GlobeAltIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white">Local Server & Desktop Ready</p>
            <p className="text-[11px] sm:text-xs text-white/50">
              Selecting any plan on your local server unlocks all features, bot capacities, and live inbox capabilities instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleSelectPlan("free")}
            className="px-3 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
          >
            Test Free
          </button>
          <button
            onClick={() => handleSelectPlan("pro")}
            className="px-3 py-1 rounded-lg text-xs bg-coral-500/20 hover:bg-coral-500/30 text-coral-400 border border-coral-500/30 font-semibold"
          >
            Test Pro
          </button>
          <button
            onClick={() => handleSelectPlan("enterprise")}
            className="px-3 py-1 rounded-lg text-xs bg-blush-500/20 hover:bg-blush-500/30 text-blush-300 border border-blush-500/30 font-semibold"
          >
            Test Enterprise
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="pt-8">
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-white/40 text-xs sm:text-sm mt-1">
            Everything you need to know about plans and billing
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="p-4 sm:p-5 bg-white/[0.02] border-white/5 cursor-pointer hover:border-white/10 transition-all"
              onClick={() => setActiveFaq(activeFaq === index ? null : index)}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm sm:text-base font-semibold text-white">
                  {faq.q}
                </span>
                <span className="text-coral-400 font-bold text-lg">
                  {activeFaq === index ? "−" : "+"}
                </span>
              </div>
              {activeFaq === index && (
                <p className="text-xs sm:text-sm text-white/60 mt-3 pt-3 border-t border-white/5 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <PageLoader
          text="Loading Subscription & Plans..."
          subtext="Fetching current tier, resource allocations, and billing status"
          minHeight="min-h-[60vh]"
        />
      }
    >
      <SubscriptionContent />
    </Suspense>
  );
}
