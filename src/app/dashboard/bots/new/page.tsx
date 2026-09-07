"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBot, useBots } from "@/lib/hooks/useBots";
import { useBillingPlan } from "@/lib/hooks/useBilling";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { 
  ArrowLeftIcon, 
  SparklesIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  ArrowRightIcon 
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { BotColorPicker, SOLID_PALETTE } from "@/components/bots/BotColorPicker";

export default function NewBotPage() {
  const router = useRouter();
  const createBot = useCreateBot();
  const { data: bots } = useBots();
  const { data: billingInfo } = useBillingPlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const existingBotsCount = bots?.length || 0;
  const maxBots = billingInfo?.limits?.maxBots ?? 1;
  const isAtLimit = maxBots !== -1 && existingBotsCount >= maxBots;

  const [formData, setFormData] = useState({
    name: "",
    greeting: "Hello! How can I help you today?",
    persona: "You are a helpful AI assistant. Answer questions based on the provided context.",
    accentColor: SOLID_PALETTE[0].value,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAtLimit) {
      setShowUpgradeModal(true);
      return;
    }

    createBot.mutate(formData, {
      onSuccess: (data: any) => {
        router.push(`/dashboard/bots/${data.id}`);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "";
        if (
          err.response?.status === 403 || 
          msg.toLowerCase().includes("limit") || 
          msg.toLowerCase().includes("upgrade") || 
          msg.toLowerCase().includes("plan")
        ) {
          setShowUpgradeModal(true);
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bots" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Create New Bot</h1>
          <p className="text-white/40">Configure your AI assistant's personality and appearance.</p>
        </div>
      </div>

      {/* Upgrade Banner if user has reached plan bot limit */}
      {isAtLimit && (
        <Card className="p-6 bg-gradient-to-r from-coral-500/15 via-obsidian-900/60 to-blush-500/15 border-coral-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(245,143,124,0.15)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-coral-500/20 text-coral-400 flex items-center justify-center shrink-0 border border-coral-500/30 shadow-[0_0_15px_rgba(245,143,124,0.2)]">
                <SparklesIcon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-lg text-white">Free Plan Bot Limit Reached</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-coral-500/20 text-coral-300 border border-coral-500/30">
                    {existingBotsCount}/{maxBots} Used
                  </span>
                </div>
                <p className="text-sm text-white/70 mt-1 max-w-xl">
                  Your current subscription permits 1 active AI bot. Upgrade to <span className="text-coral-400 font-semibold">Pro</span> to build up to 5 custom bots with 50,000 monthly messages and live inbox access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <Link href="/dashboard/settings?tab=billing" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto gap-2 shadow-[0_0_20px_rgba(245,143,124,0.35)]">
                  <CreditCardIcon className="w-4 h-4" />
                  Upgrade Subscription
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 bg-white/[0.02] border-white/5">
            <h3 className="text-lg font-heading font-bold text-white mb-6">General Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Bot Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="Support Assistant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Greeting Message</label>
                <input
                  type="text"
                  required
                  value={formData.greeting}
                  onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="Hello! How can I help you today?"
                />
                <p className="mt-2 text-xs text-white/30 italic">This is the first message your users will see.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Persona & Instructions</label>
                <textarea
                  required
                  rows={4}
                  value={formData.persona}
                  onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  placeholder="Define how the bot should behave..."
                />
                <p className="mt-2 text-xs text-white/30 italic">Be specific. E.g., 'You are a technical support agent for a SaaS platform. Use a friendly but professional tone.'</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white/[0.02] border-white/5">
            <h3 className="text-lg font-heading font-bold text-white mb-6">Visual Customization</h3>
            <BotColorPicker
              value={formData.accentColor}
              onChange={(color) => setFormData({ ...formData, accentColor: color })}
              label="Accent Color"
            />
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/bots">
              <Button type="button" variant="glass" size="lg">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              isLoading={createBot.isPending}
            >
              {isAtLimit ? "Upgrade to Create" : "Create Assistant"}
            </Button>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <h3 className="text-sm font-heading font-bold uppercase tracking-widest text-white/40 mb-4">Live Preview</h3>
            
            <div className="rounded-3xl border border-white/10 bg-obsidian-900/50 overflow-hidden shadow-2xl">
              {/* Widget Header Preview */}
              <div 
                className="p-4 flex items-center justify-between transition-all"
                style={{ background: formData.accentColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
                    {formData.name[0] || "B"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none mb-1 drop-shadow-sm">{formData.name || "Assistant"}</p>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[10px] text-white/90 drop-shadow-sm">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget Chat Preview */}
              <div className="h-80 p-4 space-y-4 overflow-y-auto">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/50 shrink-0">
                    {formData.name[0] || "B"}
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-xs text-white/80 max-w-[80%]">
                    {formData.greeting}
                  </div>
                </div>
                <div className="flex items-start gap-2 flex-row-reverse">
                  <div className="p-3 rounded-2xl rounded-tr-none text-xs text-white max-w-[80%] shadow-lg" style={{ background: formData.accentColor }}>
                    How do I set up a new bot?
                  </div>
                </div>
              </div>

              {/* Widget Input Preview */}
              <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="h-10 rounded-xl bg-white/5 border border-white/10 flex items-center px-4">
                  <span className="text-xs text-white/20">Type a message...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Upgrade Subscription Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentCount={existingBotsCount}
        maxLimit={maxBots}
      />
    </div>
  );
}
