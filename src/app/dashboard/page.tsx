"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { api } from "@/lib/api";
import { useBots } from "@/lib/hooks/useBots";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowRightIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

// ─── Custom Tooltip ────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(8,8,16,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 14px',
      backdropFilter: 'blur(12px)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '6px' }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontSize: '13px', fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Conversations Trend Component ─────────────────────────
function ConversationsTrendChart() {
  const [days, setDays] = useState(7);

  const { data = [], isLoading } = useQuery({
    queryKey: ['conversation-trend', days],
    queryFn: () => api.get(`/bots/stats/trend?days=${days}`).then(r => r.data),
    staleTime: 60000,
  });

  return (
    <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-white font-heading font-bold text-xl">Conversations Trend</h3>
          <p className="text-white/40 text-sm mt-0.5">
            Activity over the last {days} days
          </p>
        </div>
        {/* Day selector */}
        <div className="flex gap-1">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: days === d ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
                color: days === d ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${days === d ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
              }}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="h-64 rounded-xl animate-pulse"
             style={{ background: 'rgba(255,255,255,0.04)' }} />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-white/25 text-sm">No data yet — start chatting with your bot!</p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                axisLine={false} tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', paddingTop: '20px' }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="url(#sessionsGrad)"
                dot={{ fill: '#00d4ff', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#00d4ff' }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Unique Visitors"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#visitorsGrad)"
                dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#7c3aed' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: bots, isLoading: botsLoading } = useBots();
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/bots/stats/dashboard').then(r => r.data),
    staleTime: 60000,
  });

  const isLoading = botsLoading || statsLoading;

  const stats = [
    { 
      label: "Total Conversations", 
      value: dashboardStats?.totalSessions || 0, 
      icon: ChatBubbleLeftRightIcon, 
      color: "text-cyan-400",
      description: "Total sessions across all bots"
    },
    { 
      label: "Total Bots", 
      value: dashboardStats?.totalBots || 0, 
      icon: UsersIcon, 
      color: "text-violet-400",
      description: "Created by your account"
    },
    { 
      label: "Avg Response Time", 
      value: `${dashboardStats?.avgResponseTime || 0}s`, 
      icon: ClockIcon, 
      color: "text-emerald-400",
      description: "Average assistant reply time"
    },
    { 
      label: "Goal Completion", 
      value: "85.4%", 
      icon: CheckCircleIcon, 
      color: "text-amber-400",
      description: "Estimated success rate"
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-48 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Dashboard Overview</h1>
          <p className="text-white/40">Welcome back! Your AI agents are performing well.</p>
        </div>
        <Link href="/dashboard/bots/new">
          <Button variant="primary" className="gap-2">
            <PlusIcon className="w-5 h-5" />
            Create New Bot
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 bg-white/[0.02] border-white/5 relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-white/30 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-heading font-bold text-white">{stat.value}</p>
              </div>
            </div>
            <p className="text-[10px] text-white/20 mt-3">{stat.description}</p>
            {/* Background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${stat.color}`}>
              <stat.icon className="w-full h-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ConversationsTrendChart />
        </div>

        <Card className="p-8 bg-white/[0.02] border-white/5">
          <h2 className="text-xl font-heading font-bold text-white mb-2">Bot Performance</h2>
          <p className="text-sm text-white/40 mb-8">Engagement by bot</p>
          
          <div className="space-y-6">
            {dashboardStats?.sessionsByBot?.slice(0, 5).map((bot: any, i: number) => {
              const total = dashboardStats.totalSessions || 1;
              const percentage = (bot.sessions / total) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80 font-medium">{bot.botName}</span>
                    <span className="text-white/40">{bot.sessions} sessions</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-cyan-500 shadow-[0_0_8px_#00d4ff]" 
                    />
                  </div>
                </div>
              );
            })}
            
            {(!dashboardStats?.sessionsByBot || dashboardStats.sessionsByBot.length === 0) && (
              <div className="text-center py-8">
                <p className="text-sm text-white/20">No bot data yet</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">4</span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Total Knowledge</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-emerald-400">92%</span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Accuracy</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bots Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-white">Your Bots</h2>
          <Link href="/dashboard/bots" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
            View All Bots
          </Link>
        </div>

        {bots && bots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot, i) => (
              <motion.div
                key={bot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/dashboard/bots/${bot.id}`}>
                  <Card hoverEffect className="p-6 bg-white/[0.02] border-white/5 group h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                        style={{ backgroundColor: bot.accentColor }}
                      >
                        {bot.name[0]}
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${bot.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {bot.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <h3 className="text-lg font-heading font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {bot.name}
                    </h3>
                    <p className="text-sm text-white/40 line-clamp-2 mb-6">
                      {bot.persona}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <span className="text-xs text-white/20">Created {new Date(bot.createdAt).toLocaleDateString()}</span>
                      <ArrowRightIcon className="w-4 h-4 text-white/20 group-hover:text-white transition-all group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-12 bg-white/[0.01] border-dashed border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-heading font-bold text-white mb-2">No bots found</h3>
            <p className="text-white/40 mb-8 max-w-xs mx-auto">Get started by creating your first AI assistant.</p>
            <Link href="/dashboard/bots/new">
              <Button variant="glass" className="mx-auto">Create Your First Bot</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
