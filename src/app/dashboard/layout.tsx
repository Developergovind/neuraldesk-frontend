"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TorusKnotBackground } from "@/components/3d/TorusKnotBackground";
import { motion } from "framer-motion";
import { useMe } from "@/lib/hooks/useAuth";
import { isAuthenticated } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: me, isLoading, error } = useMe();
  const authed = isAuthenticated();

  useEffect(() => {
    if (!isLoading && (!authed || error)) {
      router.push("/login");
    }
  }, [authed, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian-950">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-violet-500 animate-spin-slow"></div>
        </div>
      </div>
    );
  }

  if (!authed || error) return null;

  return (
    <div className="flex min-h-screen bg-obsidian-950 relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-40">
        <TorusKnotBackground />
      </div>
      
      <Sidebar />
      
      <main className="flex-1 relative z-10 min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto p-6 lg:p-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
