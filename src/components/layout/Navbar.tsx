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
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const { data, isLoading } = useMe();
  const user = data as any;
  const logout = useLogout();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3.5 lg:px-12 backdrop-blur-xl bg-obsidian-950/75 border-b border-white/5 transition-all">
        <div className="flex items-center gap-3">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Logo size="sm" />
          </Link>
        </div>
        
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</Link>
          <Link href="/#demo-section" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Demo</Link>
          <Link href="/#pricing" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Docs</Link>
        </div>

        {/* Right Section (User / Auth + Mobile Hamburger) */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors border border-white/10 group"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-500 to-blush-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-coral-500/20">
                  {getInitials(user.name)}
                </div>
                <ChevronDownIcon className={`w-3.5 h-3.5 text-white/50 group-hover:text-white transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
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
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-obsidian-900/95 border border-white/10 backdrop-blur-xl shadow-2xl p-2 z-50"
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
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors px-2 py-1">
                Sign In
              </Link>
              <Link href="/register">
                <Button variant="glass" size="sm">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[61px] left-0 right-0 bg-obsidian-950/95 border-b border-white/10 backdrop-blur-2xl p-6 z-40 md:hidden shadow-2xl"
            >
              <div className="flex flex-col space-y-4">
                <Link
                  href="/#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-white/80 hover:text-white py-2 border-b border-white/5 flex items-center justify-between"
                >
                  Features
                  <span className="text-xs text-white/30">AI & RAG Engine</span>
                </Link>
                <Link
                  href="/#demo-section"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-white/80 hover:text-white py-2 border-b border-white/5 flex items-center justify-between"
                >
                  Live Demo
                  <SparklesIcon className="w-4 h-4 text-coral-400" />
                </Link>
                <Link
                  href="/#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-white/80 hover:text-white py-2 border-b border-white/5 flex items-center justify-between"
                >
                  Pricing
                  <span className="text-xs text-coral-400 font-bold">Save 20%</span>
                </Link>
                <Link
                  href="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-white/80 hover:text-white py-2 border-b border-white/5 flex items-center justify-between"
                >
                  Documentation
                  <BookOpenIcon className="w-4 h-4 text-white/40" />
                </Link>

                {!user && (
                  <div className="pt-2 flex flex-col gap-3">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="glass" className="w-full justify-center">Sign In</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full justify-center shadow-[0_0_20px_rgba(245,143,124,0.3)]">Get Started Free</Button>
                    </Link>
                  </div>
                )}
                {user && (
                  <div className="pt-2 flex flex-col gap-3">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full justify-center shadow-[0_0_20px_rgba(245,143,124,0.3)]">Go to Dashboard</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
