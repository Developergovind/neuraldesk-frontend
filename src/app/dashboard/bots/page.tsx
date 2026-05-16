"use client";

import { useBots } from "@/lib/hooks/useBots";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlusIcon, ChatBubbleLeftRightIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate, cn } from "@/lib/utils";

export default function BotsPage() {
  const { data: bots, isLoading } = useBots();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white tracking-tight">My AI Assistants</h1>
          <p className="text-white/40 mt-2">Manage and deploy your custom-trained neural models.</p>
        </div>
        <Link href="/dashboard/bots/new">
          <Button className="gap-2 px-6 shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            <PlusIcon className="w-5 h-5" />
            Create New Bot
          </Button>
        </Link>
      </div>

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
                <Card hoverEffect className="group relative p-8 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,212,255,0.1)] overflow-hidden h-full">
                  {/* Background Glow */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/20 transition-colors duration-500" />
                  
                  <div className="relative flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: bot.accentColor }}
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
                      <h3 className="font-heading font-bold text-xl text-white truncate mb-2 group-hover:text-cyan-400 transition-colors">
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
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-cyan-500/20 transition-all">
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
    </div>
  );
}
