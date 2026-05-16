"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/useUIStore';
import { useLogout, useMe } from '@/lib/hooks/useAuth';
import { 
  Squares2X2Icon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftOnRectangleIcon,
  InboxIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
  { name: 'My Bots', href: '/dashboard/bots', icon: ChatBubbleLeftRightIcon },
  { name: 'Live Inbox', href: '/dashboard/inbox', icon: InboxIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { data } = useMe();
  const tenant = data as any;
  const logout = useLogout();
  const { data: activeSessions = [] } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => api.get('/chat/active-sessions').then(res => res.data),
    refetchInterval: 10000,
  });
  const activeCount = activeSessions.length;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 80 }}
      className="h-screen sticky top-0 flex flex-col border-r border-white/5 bg-obsidian-950/40 backdrop-blur-2xl z-40 overflow-hidden"
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center w-full")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-heading font-bold text-white tracking-wide whitespace-nowrap"
              >
                NeuralDesk
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={toggleSidebar} 
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors z-50 backdrop-blur-md"
      >
        {sidebarOpen ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/5 rounded-xl border border-white/5"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={cn(
                "relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
                isActive ? "text-cyan-400" : "text-white/40 hover:text-white hover:bg-white/5",
                !sidebarOpen && "justify-center px-0"
              )}>
                <item.icon className="w-5 h-5 shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="font-medium text-sm whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && sidebarOpen && !(item.name === 'Live Inbox' && activeCount > 0) && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff]" />
                )}
                {item.name === 'Live Inbox' && activeCount > 0 && (
                  <span className={cn(
                    "ml-auto rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-[0_0_10px_rgba(34,197,94,0.45)]",
                    !sidebarOpen && "absolute right-2 top-2 min-w-4 text-center"
                  )}>
                    {activeCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-white/5 shrink-0 bg-white/[0.01]">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5",
          !sidebarOpen && "justify-center p-2"
        )}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-white flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
            <span className="font-bold text-sm uppercase">
              {tenant?.name ? (tenant.name.split(" ").length >= 2 ? tenant.name.split(" ")[0][0] + tenant.name.split(" ")[1][0] : tenant.name.substring(0, 2)) : 'U'}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{tenant?.company || 'Company'}</p>
              <p className="text-[10px] text-cyan-400/60 truncate uppercase tracking-widest font-bold mt-1">{tenant?.plan || 'Free'} Plan</p>
            </div>
          )}
          {sidebarOpen && (
            <button 
              onClick={() => logout()} 
              className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Logout"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
