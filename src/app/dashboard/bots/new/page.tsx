"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBot } from "@/lib/hooks/useBots";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const COLORS = [
  "#00d4ff", // Cyan
  "#a855f7", // Violet
  "#ec4899", // Pink
  "#f97316", // Orange
  "#10b981", // Emerald
  "#facc15", // Yellow
];

export default function NewBotPage() {
  const router = useRouter();
  const createBot = useCreateBot();
  const [formData, setFormData] = useState({
    name: "",
    greeting: "Hello! How can I help you today?",
    persona: "You are a helpful AI assistant. Answer questions based on the provided context.",
    accentColor: COLORS[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createBot.mutate(formData, {
      onSuccess: (data: any) => {
        router.push(`/dashboard/bots/${data.id}`);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Create New Bot</h1>
          <p className="text-white/40">Configure your AI assistant's personality and appearance.</p>
        </div>
      </div>

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
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-4">Accent Color</label>
              <div className="flex flex-wrap gap-4">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, accentColor: color })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${formData.accentColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard">
              <Button type="button" variant="glass" size="lg">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" size="lg" isLoading={createBot.isPending}>
              Create Assistant
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
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: formData.accentColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                    {formData.name[0] || "B"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none mb-1">{formData.name || "Assistant"}</p>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[10px] text-white/70">Online</span>
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
                  <div className="p-3 rounded-2xl rounded-tr-none text-xs text-white max-w-[80%] shadow-lg" style={{ backgroundColor: formData.accentColor }}>
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
    </div>
  );
}
