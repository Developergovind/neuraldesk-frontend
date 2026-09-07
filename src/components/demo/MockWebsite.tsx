"use client";

import { useState } from "react";
import { DemoChatWidget } from "./DemoChatWidget";
import {
  ShieldCheck,
  Zap,
  BarChart3,
  Lock,
  RotateCw,
  Sparkles,
  ArrowUpRight,
  Bot,
  Activity,
  CheckCircle2,
  Layers,
} from "lucide-react";

interface MockWebsiteProps {
  botId: string;
  botName: string;
  greeting: string;
  accentColor: string;
  companyName: string;
  suggestedQuestions?: string[];
  autoOpen?: boolean;
}

export function MockWebsite({
  botId,
  botName,
  greeting,
  accentColor,
  companyName,
  suggestedQuestions = [],
  autoOpen = false,
}: MockWebsiteProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "metrics">("overview");

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#17161A] overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300">
      {/* Browser Chrome Header */}
      <div className="h-12 border-b border-white/10 bg-[#1f1e24]/90 px-4 sm:px-5 flex items-center justify-between gap-3">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-black/20 shadow-sm" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-black/20 shadow-sm" />
          <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-black/20 shadow-sm" />
        </div>

        {/* URL Bar */}
        <div className="flex-1 max-w-md mx-auto flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white/70 px-3.5 py-1.5 shadow-inner">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate font-mono text-[11px] sm:text-xs">
            https://{companyName.toLowerCase().replace(/\s+/g, "") || "acme-cloud"}.com
          </span>
          <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        {/* Quick browser controls */}
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <RotateCw className="w-3.5 h-3.5 hover:text-white/70 transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Simulated Live Website Viewport */}
      <div className="relative min-h-[520px] sm:min-h-[560px] bg-gradient-to-b from-[#141316] via-[#18171C] to-[#121114] p-4 sm:p-6 text-white select-none">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-coral-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blush-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Mock SaaS Navigation */}
        <div className="relative z-10 flex items-center justify-between pb-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-coral-500 to-blush-400 flex items-center justify-center text-white shadow-md shadow-coral-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-white">
              {companyName}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-xs text-white/60 font-medium">
            <span className="text-white hover:text-coral-400 transition-colors cursor-pointer">Platform</span>
            <span className="hover:text-coral-400 transition-colors cursor-pointer">Solutions</span>
            <span className="hover:text-coral-400 transition-colors cursor-pointer">Enterprise</span>
            <span className="hover:text-coral-400 transition-colors cursor-pointer">Pricing</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-colors">
              Sign In
            </button>
            <button className="hidden sm:flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-md shadow-coral-500/25">
              <span>Start Free</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mock SaaS Hero Section */}
        <div className="relative z-10 mt-6 sm:mt-8 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous AI Support Agent Enabled</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white leading-tight tracking-tight">
            Next-Generation Customer Intelligence Platform
          </h2>

          <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-lg">
            Empower your team with sub-second AI resolutions trained directly on your product knowledge base, docs, and FAQs.
          </p>
        </div>

        {/* Real-time KPI / Capability Cards */}
        <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-coral-400/30 transition-colors">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Resolution Rate</span>
              <Zap className="w-3.5 h-3.5 text-coral-400" />
            </div>
            <div className="text-xl font-bold text-white font-heading">94.8%</div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>+18.4% this month</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-blush-400/30 transition-colors">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Avg Latency</span>
              <Activity className="w-3.5 h-3.5 text-blush-400" />
            </div>
            <div className="text-xl font-bold text-white font-heading">&lt; 850ms</div>
            <div className="mt-1.5 text-[11px] text-white/50">
              Sub-second RAG stream
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-emerald-400/30 transition-colors">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Enterprise Security</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white font-heading">SOC-2 / GDPR</div>
            <div className="mt-1.5 text-[11px] text-emerald-400/90 font-medium">
              Isolated pgvector
            </div>
          </div>
        </div>

        {/* Live Customer Interaction Teaser */}
        <div className="relative z-10 mt-4 p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-coral-500/20 border border-coral-400/40 flex items-center justify-center text-coral-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/90">
                Interactive Assistant Preview
              </p>
              <p className="text-[11px] text-white/50">
                Click the glowing bubble in the bottom right corner to test live conversations.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
            v2.4 Ready
          </span>
        </div>

        {/* Live Chat Widget Component */}
        <DemoChatWidget
          botId={botId}
          botName={botName}
          greeting={greeting}
          accentColor={accentColor}
          suggestedQuestions={suggestedQuestions}
          autoOpen={autoOpen}
        />
      </div>

      {/* Browser Footer Status Bar */}
      <div className="px-5 py-3 border-t border-white/10 bg-[#141316] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-white/60">
          <span className="w-2 h-2 rounded-full bg-coral-400 animate-ping" />
          <span>Interactive Preview • Real-time backend connected</span>
        </div>
        <div className="text-[11px] font-mono text-white/40">
          NeuralDesk Embedded Engine
        </div>
      </div>
    </div>
  );
}
