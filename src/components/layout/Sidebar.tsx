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
import { LogoIcon } from "@/components/ui/Logo";

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
  const { data: activeSessions = { data: [] } as { data: any[] } } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => api.get('/chat/active-sessions').then(res => res.data),
    refetchInterval: 10000,
  });
  const activeCount = activeSessions.data?.length || 0;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 80 }}
      className="hidden lg:flex h-screen sticky top-0 flex-col border-r border-white/5 bg-obsidian-950/40 backdrop-blur-2xl z-40 relative select-none shrink-0 transition-[width] duration-300"
    >
      {/* Single, Perfectly Positioned Edge Toggle Button */}
      <button 
        onClick={toggleSidebar} 
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute -right-3.5 top-7 w-7 h-7 rounded-full bg-[#232227] border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.7)] flex items-center justify-center text-white/70 hover:text-coral-400 hover:border-coral-400/60 hover:scale-110 active:scale-95 transition-all duration-200 z-50 group cursor-pointer"
      >
        {sidebarOpen ? (
          <ChevronLeftIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        ) : (
          <ChevronRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        )}
      </button>

      {/* Logo Area */}
      <div className="h-20 flex items-center px-5 border-b border-white/5 shrink-0">
        <Link href="/dashboard" className={cn("flex items-center gap-3 min-w-0", !sidebarOpen && "justify-center w-full")}>
          <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-obsidian-900/80 border border-white/10 shadow-[0_0_15px_rgba(245,143,124,0.25)] shrink-0">
            <LogoIcon size={24} animated />
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
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="activeTabDesktop"
                  className="absolute inset-0 bg-white/5 rounded-xl border border-white/5"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={cn(
                "relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
                isActive ? "text-coral-400 font-semibold" : "text-white/40 hover:text-white hover:bg-white/5",
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
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-coral-400 shadow-[0_0_8px_#F58F7C]" />
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blush-500/20 to-coral-500/20 text-white flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
            <span className="font-bold text-sm uppercase">
              {tenant?.name ? (tenant.name.split(" ").length >= 2 ? tenant.name.split(" ")[0][0] + tenant.name.split(" ")[1][0] : tenant.name.substring(0, 2)) : 'U'}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{tenant?.company || 'Company'}</p>
              <p className="text-[10px] text-coral-400/80 truncate uppercase tracking-widest font-bold mt-1">{tenant?.plan || 'Free'} Plan</p>
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

/* Mobile Top Header for Viewports < lg */
export const MobileTopHeader = () => {
  const { toggleMobileDrawer } = useUIStore();
  const { data } = useMe();
  const tenant = data as any;
  const { data: activeSessions = { data: [] } as { data: any[] } } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => api.get('/chat/active-sessions').then(res => res.data),
    refetchInterval: 10000,
  });
  const activeCount = activeSessions.data?.length || 0;

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-obsidian-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileDrawer}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-obsidian-900/90 border border-white/10 shadow-[0_0_10px_rgba(245,143,124,0.25)]">
            <LogoIcon size={18} animated />
          </div>
          <span className="font-heading font-bold text-white text-base tracking-wide">NeuralDesk</span>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        {activeCount > 0 && (
          <Link
            href="/dashboard/inbox"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{activeCount} Live</span>
          </Link>
        )}

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blush-500/20 to-coral-500/20 text-white flex items-center justify-center border border-white/10 text-xs font-bold uppercase shadow-inner">
          {tenant?.name ? (tenant.name.split(" ").length >= 2 ? tenant.name.split(" ")[0][0] + tenant.name.split(" ")[1][0] : tenant.name.substring(0, 2)) : 'U'}
        </div>
      </div>
    </header>
  );
};

/* Mobile Slide-Over Navigation Drawer */
export const MobileSidebarDrawer = () => {
  const pathname = usePathname();
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUIStore();
  const { data } = useMe();
  const tenant = data as any;
  const logout = useLogout();
  const { data: activeSessions = { data: [] } as { data: any[] } } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => api.get('/chat/active-sessions').then(res => res.data),
    refetchInterval: 10000,
  });
  const activeCount = activeSessions.data?.length || 0;

  return (
    <AnimatePresence>
      {mobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 lg:hidden"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-obsidian-950/95 border-r border-white/10 backdrop-blur-2xl z-50 flex flex-col lg:hidden shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
              <Link href="/dashboard" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-3">
                <div className="p-1.5 rounded-xl bg-obsidian-900/80 border border-white/10 shadow-[0_0_12px_rgba(245,143,124,0.25)]">
                  <LogoIcon size={20} animated />
                </div>
                <span className="text-lg font-heading font-bold text-white tracking-wide">NeuralDesk</span>
              </Link>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                      isActive
                        ? "bg-coral-500/15 text-coral-400 border border-coral-500/30 font-semibold shadow-[0_0_15px_rgba(245,143,124,0.15)]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                    {item.name === 'Live Inbox' && activeCount > 0 && (
                      <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                        {activeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Tenant Info & Logout */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blush-500/20 to-coral-500/20 text-white flex items-center justify-center shrink-0 border border-white/10">
                  <span className="font-bold text-xs uppercase">
                    {tenant?.name ? (tenant.name.split(" ").length >= 2 ? tenant.name.split(" ")[0][0] + tenant.name.split(" ")[1][0] : tenant.name.substring(0, 2)) : 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{tenant?.company || tenant?.name || 'Company'}</p>
                  <p className="text-[10px] text-coral-400 font-bold uppercase tracking-wider">{tenant?.plan || 'Free'} Plan</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* Mobile Docked Bottom Navigation Bar for < md */
export const MobileBottomNav = () => {
  const pathname = usePathname();
  const { data: activeSessions = { data: [] } as { data: any[] } } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => api.get('/chat/active-sessions').then(res => res.data),
    refetchInterval: 10000,
  });
  const activeCount = activeSessions.data?.length || 0;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/90 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center py-1 px-2 rounded-xl transition-colors min-w-[56px]",
                isActive ? "text-coral-400 font-bold" : "text-white/40 hover:text-white"
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.name === 'Live Inbox' && activeCount > 0 && (
                  <span className="absolute -top-1 -right-2 h-3.5 min-w-3.5 px-1 rounded-full bg-emerald-500 text-[9px] font-black text-white flex items-center justify-center shadow-[0_0_6px_rgba(34,197,94,0.6)]">
                    {activeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{item.name}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-coral-400 mt-0.5 shadow-[0_0_6px_#F58F7C]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
