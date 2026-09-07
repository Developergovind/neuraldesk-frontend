"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#2C2B30]">
      {/* Left side - Auth Showcase */}
      <div className="hidden lg:block w-1/2 h-full min-h-screen">
        <AuthShowcase />
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative bg-[#2C2B30]/40 backdrop-blur-sm">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#F58F7C]/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden mb-8 text-center flex justify-center">
            <Link href="/">
              <Logo size="md" />
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
