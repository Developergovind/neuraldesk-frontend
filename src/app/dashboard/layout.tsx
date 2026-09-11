"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileTopHeader, MobileSidebarDrawer, MobileBottomNav } from "@/components/layout/Sidebar";
import { TorusKnotBackground } from "@/components/3d/TorusKnotBackground";
import { motion } from "framer-motion";
import { useMe } from "@/lib/hooks/useAuth";
import { isAuthenticated } from "@/lib/auth";
import { GlobalLoader } from "@/components/ui/Loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: me, isLoading, error } = useMe();

  useEffect(() => {
    setMounted(true);
  }, []);

  const authed = mounted ? isAuthenticated() : false;
  const isUnauthorized = (error as any)?.response?.status === 401;

  useEffect(() => {
    if (mounted && !isLoading && (!authed || isUnauthorized)) {
      router.push("/login");
    }
  }, [mounted, authed, isLoading, isUnauthorized, router]);

  if (!mounted || isLoading) {
    return (
      <GlobalLoader
        text="Securing NeuralDesk Workspace..."
        subtext="Verifying authentication and active bots"
        fullScreen={true}
      />
    );
  }

  if (!authed || isUnauthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#141316]/60 relative overflow-hidden flex-col lg:flex-row">
      <div className="fixed inset-0 z-0 opacity-100 pointer-events-none">
        <TorusKnotBackground />
      </div>
      
      {/* Desktop Collapsible Sidebar */}
      <Sidebar />

      {/* Mobile & Tablet Top Header */}
      <MobileTopHeader />

      {/* Mobile Slide-Over Drawer */}
      <MobileSidebarDrawer />
      
      {/* Main Content Area */}
      <main className="flex-1 relative z-10 min-w-0 h-auto lg:h-screen overflow-y-auto custom-scrollbar pb-24 md:pb-12 lg:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Docked Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
