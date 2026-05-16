"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { 
  UserGroupIcon, 
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

// ─── Usage Over Time Component ─────────────────────────────
function UsageOverTimeChart() {
  const [days, setDays] = useState(7);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const { data = [], isLoading } = useQuery({
    queryKey: ['usage-over-time', days],
    queryFn: () => api.get(`/bots/stats/usage?days=${days}`).then(r => r.data),
    staleTime: 60000,
    refetchInterval: 5 * 60 * 1000,  // refresh every 5 min
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
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
  };

  return (
    <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/5">
      {/* Header + Controls */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h3 className="text-white font-heading font-bold text-xl">Usage Over Time</h3>
          <p className="text-white/40 text-sm mt-0.5">
            Messages tracked in the last {days} days
          </p>
        </div>
        <div className="flex gap-2">
          {/* Chart type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(['area', 'bar'] as const).map(t => (
              <button key={t} onClick={() => setChartType(t)}
                className="px-4 py-1.5 text-xs font-bold transition-all capitalize"
                style={{
                  background: chartType === t ? 'rgba(0,212,255,0.15)' : 'transparent',
                  color: chartType === t ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                }}>
                {t}
              </button>
            ))}
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
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="h-64 rounded-xl animate-pulse"
             style={{ background: 'rgba(255,255,255,0.04)' }} />
      ) : data.length === 0 || data.every((d: any) => d.messages === 0) ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <p className="text-4xl">📊</p>
          <p className="text-white/40 text-sm">No activity in this period yet</p>
          <p className="text-white/25 text-xs">Chat with your bot to see data here</p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="botGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', paddingTop: '20px' }} />
                <Area type="monotone" dataKey="userMessages" name="User Messages"
                  stroke="#00d4ff" strokeWidth={2} fill="url(#userGrad)"
                  dot={{ fill: '#00d4ff', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="botMessages" name="Bot Replies"
                  stroke="#7c3aed" strokeWidth={2} fill="url(#botGrad)"
                  dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }} />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', paddingTop: '20px' }} />
                <Bar dataKey="userMessages" name="User Messages"
                  fill="#00d4ff" fillOpacity={0.8} radius={[4,4,0,0]} />
                <Bar dataKey="botMessages" name="Bot Replies"
                  fill="#7c3aed" fillOpacity={0.8} radius={[4,4,0,0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/bots/stats/dashboard').then(r => r.data),
    staleTime: 60000,
  });

  const metrics = [
    { 
      label: "Total Conversations", 
      value: dashboardStats?.totalSessions?.toLocaleString() || "0", 
      trend: "+12.5%", 
      icon: ChatBubbleLeftEllipsisIcon, 
      color: "text-cyan-400" 
    },
    { 
      label: "Total Bots", 
      value: dashboardStats?.totalBots?.toLocaleString() || "0", 
      trend: "+5.2%", 
      icon: UserGroupIcon, 
      color: "text-violet-400" 
    },
    { 
      label: "Avg. Response Time", 
      value: `${dashboardStats?.avgResponseTime || 0}s`, 
      trend: "-0.4s", 
      icon: ClockIcon, 
      color: "text-emerald-400" 
    },
    { 
      label: "Goal Completion", 
      value: "85.4%", 
      trend: "+2.1%", 
      icon: CheckCircleIcon, 
      color: "text-orange-400" 
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl" />
          <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Analytics</h1>
        <p className="text-white/40">Real-time performance insights across all your AI assistants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <Card key={i} className="p-6 bg-white/[0.02] border-white/5 group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-white/5 ${m.color} group-hover:scale-110 transition-transform`}>
                <m.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${m.trend.startsWith('+') ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {m.trend}
              </span>
            </div>
            <p className="text-sm text-white/40 mb-1">{m.label}</p>
            <p className="text-2xl font-heading font-bold text-white">{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UsageOverTimeChart />
        </div>

        <Card className="p-8 bg-white/[0.02] border-white/5">
          <h3 className="text-xl font-heading font-bold text-white mb-2">Bot Performance</h3>
          <p className="text-sm text-white/40 mb-8">Engagement by bot</p>
          <div className="space-y-6">
            {dashboardStats?.sessionsByBot?.map((bot: any, i: number) => {
              const total = dashboardStats.totalSessions || 1;
              const percentage = (bot.sessions / total) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80 font-medium">{bot.botName}</span>
                    <span className="text-white/40">{Math.round(percentage)}% of total</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage || 0}%` }}
                      className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    />
                  </div>
                </div>
              );
            })}
            {(!dashboardStats?.sessionsByBot || dashboardStats.sessionsByBot.length === 0) && (
              <div className="text-center py-20 flex flex-col items-center gap-4">
                <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-white/10" />
                <p className="text-sm text-white/20">No session data available yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
