"use client";

import { DemoChatWidget } from "./DemoChatWidget";

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
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d0d1a] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1">
      <div className="h-11 border-b border-white/10 bg-white/5 px-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/90" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/90" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
        </div>
        <div className="ml-2 flex-1 rounded-md bg-black/30 border border-white/10 text-[11px] text-white/50 px-3 py-1">
          yourwebsite.com
        </div>
      </div>

      <div className="relative h-[480px] max-md:h-[350px] bg-[#080810] p-5">
        <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">{companyName}</p>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span>Home</span>
              <span>Products</span>
              <span>About</span>
              <span>Contact</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-2xl md:text-3xl font-semibold text-white/90">Welcome to {companyName}</h3>
            <div className="space-y-2">
              <div className="h-3 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-2/3 rounded bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-white/10" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-md:grid-cols-2">
            {[0, 1, 2].map((card) => (
              <div key={card} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="h-20 rounded-lg bg-white/10" />
                <div className="mt-3 h-2.5 rounded bg-white/10" />
                <div className="mt-2 h-2.5 w-2/3 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        <DemoChatWidget
          botId={botId}
          botName={botName}
          greeting={greeting}
          accentColor={accentColor}
          suggestedQuestions={suggestedQuestions}
          autoOpen={autoOpen}
        />
      </div>
      <p className="px-5 py-3 text-xs text-cyan-300/90 border-t border-white/10">
        This is exactly how your customers see the bot.
      </p>
    </div>
  );
}
