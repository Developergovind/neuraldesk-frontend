"use client";

import { useState } from "react";
import { useBots } from "@/lib/hooks/useBots";
import { useBillingPlan } from "@/lib/hooks/useBilling";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowRightIcon,
  SparklesIcon,
  CreditCardIcon 
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate, cn } from "@/lib/utils";

export default function BotsPage() {
  const { data: bots, isLoading } = useBots();
  const { data: billingInfo } = useBillingPlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const existingBotsCount = bots?.length || 0;
  const maxBots = billingInfo?.limits?.maxBots ?? 1;
  const isAtLimit = maxBots !== -1 && existingBotsCount >= maxBots;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-heading font-bold text-white tracking-tight">My AI Assistants</h1>
            {bots && bots.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white/70">
                {existingBotsCount} / {maxBots === -1 ? "∞" : maxBots} Bots
              </span>
            )}
          </div>
          <p className="text-white/40 mt-2">Manage and deploy your custom-trained neural models.</p>
        </div>

        <div className="flex items-center gap-3">
          {isAtLimit ? (
            <Button 
              onClick={() => setShowUpgradeModal(true)}
              className="gap-2 px-6 shadow-[0_0_20px_rgba(245,143,124,0.35)]"
            >
              <SparklesIcon className="w-5 h-5 text-coral-300 animate-pulse" />
              Upgrade to Add Bots
            </Button>
          ) : (
            <Link href="/dashboard/bots/new">
              <Button className="gap-2 px-6 shadow-[0_0_20px_rgba(245,143,124,0.35)]">
                <PlusIcon className="w-5 h-5" />
                Create New Bot
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Upgrade Banner if at limit */}
      {isAtLimit && (
        <Card className="p-5 bg-gradient-to-r from-coral-500/10 via-obsidian-900/60 to-blush-500/10 border-coral-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-coral-500/20 text-coral-400">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                You've utilized all {maxBots} bot slot{maxBots > 1 ? 's' : ''} on your {billingInfo?.plan || 'Free'} plan
              </p>
              <p className="text-xs text-white/50">
                Ready to deploy more assistants? Upgrade your subscription to Pro for 5 bots, 50k messages, and live chat inbox.
              </p>
            </div>
          </div>
          <Link href="/dashboard/settings?tab=billing" className="shrink-0">
            <Button variant="primary" size="sm" className="gap-2">
              <CreditCardIcon className="w-4 h-4" />
              Upgrade Subscription
            </Button>
          </Link>
        </Card>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : bots?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-20 text-center border-dashed border-white/10 bg-transparent">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <ChatBubbleLeftRightIcon className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="text-xl font-bold text-white">No neural desk bots yet</h3>
          <p className="text-white/40 mt-2 max-w-sm">Create your first AI assistant and feed it some knowledge to get started.</p>
          <Link href="/dashboard/bots/new" className="mt-8">
            <Button variant="secondary">Start Building</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots?.map((bot, index) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/dashboard/bots/${bot.id}`}>
                <Card hoverEffect className="group relative p-8 hover:border-coral-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,143,124,0.15)] overflow-hidden h-full">
                  {/* Background Glow */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-coral-500/10 blur-[60px] group-hover:bg-coral-500/20 transition-colors duration-500" />
                  
                  <div className="relative flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-transform group-hover:scale-110"
                        style={{ background: bot.accentColor }}
                      >
                        {bot.name[0]}
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        bot.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-white/20 border-white/10"
                      )}>
                        {bot.isActive ? "Online" : "Offline"}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-xl text-white truncate mb-2 group-hover:text-coral-400 transition-colors">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                        {bot.persona}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Created</span>
                        <span className="text-xs text-white/60 font-medium">{formatDate(bot.createdAt)}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-coral-500/20 transition-all">
                        <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentCount={existingBotsCount}
        maxLimit={maxBots}
      />
    </div>
  );
}
