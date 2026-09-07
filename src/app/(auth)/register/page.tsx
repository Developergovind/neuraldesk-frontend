"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LogoIcon } from "@/components/ui/Logo";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    let strength = 0;
    if (pw.length >= 8) strength++;
    if (/[A-Z]/.test(pw)) strength++;
    if (/[0-9]/.test(pw)) strength++;
    if (/[^A-Za-z0-9]/.test(pw)) strength++;
    return strength;
  }, [formData.password]);

  const strengthColor = ["bg-white/10", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"][passwordStrength];
  const strengthLabel = ["Empty", "Weak", "Fair", "Good", "Strong"][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        email: formData.email,
        password: formData.password,
        company: formData.company,
        name: formData.name,
      });
      
      toast.success("Account created successfully!");
      router.push("/login");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden select-none bg-[#19181C]">
      {/* 1. Full-Screen Executive Office Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/auth-bg.jpg"
          alt="NeuralDesk Executive Modern Office"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          quality={95}
        />
        {/* Layered cinematic dark overlays for pristine contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141316]/90 via-[#1E1D22]/70 to-[#141316]/85" />
        <div className="absolute inset-0 bg-[#1E1D22]/40 backdrop-blur-[2px]" />
      </div>

      {/* 2. Main Content Grid Overlay */}
      <div className="relative z-10 w-full min-h-screen grid lg:grid-cols-12 items-center p-4 sm:p-10 lg:p-16 max-w-7xl mx-auto py-12 lg:py-0">
        
        {/* Left: Branding & Value Proposition */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 flex flex-col justify-center pr-0 lg:pr-12 mb-8 lg:mb-0"
        >
          <div className="flex items-center gap-3.5 mb-5 sm:mb-6">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#242328]/80 border border-white/15 shadow-[0_0_30px_rgba(245,143,124,0.3)] backdrop-blur-xl">
              <LogoIcon size={32} animated />
            </div>
            <span className="text-2xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              NeuralDesk
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-light text-white/95 tracking-wide leading-tight">
            The Next Gen AI Chatbot
          </h2>

          <p className="text-xs sm:text-base text-white/75 max-w-lg mt-2.5 sm:mt-3.5 leading-relaxed font-light">
            Your intelligent workspace companion — build agents, automate tasks, and get more done with AI.
          </p>

          {/* Micro trust pills */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-white/70">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              ⚡ Instant Setup
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              🔒 Enterprise Sandboxed
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              🌐 38 Global Edge Nodes
            </span>
          </div>
        </motion.div>

        {/* Right: Glassmorphic Sign Up Form Card Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 w-full max-w-md mx-auto"
        >
          <Card className="p-5 sm:p-8 bg-[#1E1D22]/85 border-white/15 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] rounded-2xl">
            <div className="mb-6">
              <h1 className="text-2xl font-heading font-bold text-white tracking-tight">Create Account</h1>
              <p className="text-[#D6D6D6]/70 text-xs mt-1">Get started with your free enterprise workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#D6D6D6]/80 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#2C2B30]/90 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#F58F7C] focus:ring-1 focus:ring-[#F58F7C]/50 transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#D6D6D6]/80 mb-1.5">
                    Company
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#2C2B30]/90 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#F58F7C] focus:ring-1 focus:ring-[#F58F7C]/50 transition-all text-sm"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D6D6D6]/80 mb-1.5">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#2C2B30]/90 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#F58F7C] focus:ring-1 focus:ring-[#F58F7C]/50 transition-all text-sm"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D6D6D6]/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-11 pl-3.5 pr-12 rounded-xl bg-[#242328] border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#F58F7C] focus:ring-1 focus:ring-[#F58F7C]/50 transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#141316] hover:bg-[#1C1B20] border border-white/20 text-white/80 hover:text-[#F58F7C] transition-all shadow-md flex items-center justify-center"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 text-[#F58F7C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Strength Meter */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-white/50">Strength: {strengthLabel}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div 
                          key={i} 
                          className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColor : "bg-white/10"}`} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D6D6D6]/80 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#2C2B30]/90 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#F58F7C] focus:ring-1 focus:ring-[#F58F7C]/50 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-sm font-semibold shadow-[0_4px_20px_rgba(245,143,124,0.3)] hover:shadow-[0_4px_25px_rgba(245,143,124,0.45)] transition-all"
                  isLoading={loading}
                >
                  Create Free Account
                </Button>
              </div>
            </form>

            <div className="mt-5 pt-5 border-t border-white/10 text-center">
              <p className="text-[#D6D6D6]/70 text-xs">
                Already have an account?{" "}
                <Link href="/login" className="text-[#F58F7C] hover:text-[#F2C4CE] font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
