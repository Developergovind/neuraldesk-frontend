"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMe, useLogout } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { 
  UserIcon, 
  Squares2X2Icon as LayoutDashboardIcon, 
  ArrowRightOnRectangleIcon as LogOutIcon, 
  ChevronDownIcon 
} from "@heroicons/react/24/outline";

export function Navbar() {
  const { data, isLoading } = useMe();
  const user = data as any;
  const logout = useLogout();
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-obsidian-950/50 border-b border-white/5">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-heading font-bold tracking-wide text-white">NeuralDesk</span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <Link href="/#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</Link>
        <Link href="/#demo-section" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Demo</Link>
        <Link href="/#pricing" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</Link>
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors border border-white/10 group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-cyan-500/20">
                {getInitials(user.name)}
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-white/50 group-hover:text-white transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-obsidian-900/90 border border-white/10 backdrop-blur-xl shadow-2xl p-2 z-50"
                  >
                    <div className="px-3 py-2 mb-2 border-b border-white/5">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      href="/dashboard"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <LayoutDashboardIcon className="w-4 h-4" />
                      Dashboard
                    </Link>
                    
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors mt-1"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register">
              <Button variant="glass" size="sm">Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
