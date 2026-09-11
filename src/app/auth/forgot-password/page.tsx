"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LogoIcon } from "@/components/ui/Logo";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { isDisposableEmail, getDisposableEmailError } from "@/lib/disposableEmail";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (isDisposableEmail(val)) {
      setEmailError("Temporary/disposable emails (e.g. Yopmail) are blocked.");
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const disposableErr = getDisposableEmailError(email);
    if (disposableErr) {
      setEmailError(disposableErr);
      return toast.error("Access Denied: Temporary and disposable emails are blocked.", {
        duration: 5000,
        icon: "🚫",
      });
    }

    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
      toast.success("Reset link sent to your email!");
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Forgot password service is temporarily unavailable.");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
            Your intelligent workspace companion — recover your account securely and regain instant access to your AI agents.
          </p>

          {/* Micro trust pills */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-white/70">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              ⚡ Instant Reset Link
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              🔒 Enterprise Encryption
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              🌐 24/7 Security Shield
            </span>
          </div>
        </motion.div>

        {/* Right: Glassmorphic Reset Form Card Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 w-full max-w-md mx-auto"
        >
          <Card className="p-5 sm:p-8 bg-[#1E1D22]/85 border-white/15 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] rounded-2xl">
            {isSubmitted ? (
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-2xl bg-[#F58F7C]/15 border border-[#F58F7C]/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(245,143,124,0.25)]">
                  <svg className="w-8 h-8 text-[#F58F7C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                <h1 className="text-2xl font-heading font-bold text-white tracking-tight mb-2">
                  Check Your Inbox
                </h1>

                <p className="text-[#D6D6D6]/75 text-xs sm:text-sm leading-relaxed mb-6">
                  We have dispatched a secure password reset link to{" "}
                  <span className="text-white font-medium text-xs sm:text-sm block mt-1 break-all bg-white/5 py-1 px-2.5 rounded-lg border border-white/10">
                    {email}
                  </span>
                </p>

                <p className="text-[11px] text-[#D6D6D6]/50 mb-6 font-light">
                  Click the link in the email to set a new password. The link will expire in 60 minutes.
                </p>

                <div className="space-y-3">
                  <Link href="/login" className="block w-full">
                    <Button
                      variant="primary"
                      className="w-full h-11 text-sm font-semibold shadow-[0_4px_20px_rgba(245,143,124,0.3)] hover:shadow-[0_4px_25px_rgba(245,143,124,0.45)] transition-all"
                    >
                      Back to Sign In
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="w-full text-xs text-[#D6D6D6]/60 hover:text-white transition-colors py-2"
                  >
                    Didn't receive the email? <span className="text-[#F58F7C] underline font-medium">Try another email</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-heading font-bold text-white tracking-tight">Forgot Password</h1>
                  <p className="text-[#D6D6D6]/70 text-xs mt-1">
                    Enter your registered email and we'll send a secure password reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#D6D6D6]/80 mb-1.5">
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`w-full h-11 px-3.5 rounded-xl bg-[#2C2B30]/90 border ${
                        emailError ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/50" : "border-white/10 focus:border-[#F58F7C] focus:ring-[#F58F7C]/50"
                      } text-white placeholder-white/25 focus:outline-none focus:ring-1 transition-all text-sm`}
                      placeholder="name@company.com"
                    />
                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1 leading-tight font-medium"
                      >
                        <span className="text-sm">⚠️</span> {emailError}
                      </motion.p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full h-11 text-sm font-semibold shadow-[0_4px_20px_rgba(245,143,124,0.3)] hover:shadow-[0_4px_25px_rgba(245,143,124,0.45)] transition-all"
                      isLoading={isLoading}
                    >
                      Send Reset Link
                    </Button>
                  </div>
                </form>

                <div className="mt-5 pt-5 border-t border-white/10 text-center">
                  <p className="text-[#D6D6D6]/70 text-xs">
                    Remember your password?{" "}
                    <Link href="/login" className="text-[#F58F7C] hover:text-[#F2C4CE] font-semibold transition-colors">
                      Back to Sign In
                    </Link>
                  </p>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
