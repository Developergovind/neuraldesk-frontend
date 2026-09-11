"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  subtext?: string;
  className?: string;
}

/**
 * Core Dual-Ring Animated Spinner with Brand Gradient
 */
export function LoadingSpinner({
  size = "md",
  text,
  className,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}) {
  const sizeMap = {
    xs: { outer: "w-4 h-4", border: "border", logo: 10 },
    sm: { outer: "w-6 h-6", border: "border-[1.5px]", logo: 12 },
    md: { outer: "w-10 h-10", border: "border-2", logo: 18 },
    lg: { outer: "w-14 h-14", border: "border-2", logo: 24 },
    xl: { outer: "w-20 h-20", border: "border-[2.5px]", logo: 32 },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn("inline-flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("relative flex items-center justify-center", currentSize.outer)}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-coral-500/20 blur-md animate-pulse pointer-events-none" />

        {/* Outer Fast Spinning Ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-t-coral-400 border-r-transparent border-b-coral-500/20 border-l-transparent animate-spin",
            currentSize.border
          )}
          style={{ animationDuration: "0.85s" }}
        />

        {/* Inner Slow Counter-Spinning Ring */}
        <div
          className={cn(
            "absolute inset-1.5 rounded-full border-r-blush-400 border-t-transparent border-l-blush-300/30 border-b-transparent animate-spin-slow",
            currentSize.border
          )}
          style={{ animationDirection: "reverse", animationDuration: "2s" }}
        />

        {/* Center Glowing Logo or Pulsing Core */}
        {size !== "xs" && size !== "sm" ? (
          <div className="relative z-10 flex items-center justify-center transform scale-90">
            <LogoIcon size={currentSize.logo} animated />
          </div>
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-coral-400 shadow-[0_0_6px_#F58F7C]" />
        )}
      </div>

      {text && (
        <span className="text-xs font-medium text-white/70 animate-pulse tracking-wide font-sans">
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * Full Page or Container Loader for Dashboard Tabs & Pages
 */
export function PageLoader({
  text = "Loading...",
  subtext,
  className,
  minHeight = "min-h-[360px]",
}: {
  text?: string;
  subtext?: string;
  className?: string;
  minHeight?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl relative overflow-hidden",
        minHeight,
        className
      )}
    >
      {/* Ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-coral-500/10 via-blush-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Spinner */}
      <div className="relative z-10">
        <LoadingSpinner size="lg" />
      </div>

      {/* Text Messages */}
      <div className="mt-5 space-y-1 relative z-10">
        <h4 className="text-sm sm:text-base font-heading font-bold text-white tracking-wide">
          {text}
        </h4>
        {subtext && (
          <p className="text-xs text-white/40 max-w-sm mx-auto font-sans leading-relaxed">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Global Full-Screen Overlay Loader (used on login, workspace switch, initial load)
 */
export function GlobalLoader({
  text = "Loading NeuralDesk...",
  subtext = "Preparing your AI workspace",
  fullScreen = true,
  blur = true,
}: {
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
  blur?: boolean;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex flex-col items-center justify-center z-[9999] select-none",
          fullScreen ? "fixed inset-0 bg-[#121115]/90" : "w-full h-full min-h-screen bg-[#141316]",
          blur && "backdrop-blur-2xl"
        )}
      >
        {/* Radiant Ambient Orb */}
        <div className="absolute w-96 h-96 bg-gradient-to-tr from-coral-500/20 via-blush-500/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-md">
          {/* Main Dual-Ring Spinner */}
          <div className="relative w-20 h-20 flex items-center justify-center mb-6">
            {/* Soft Breathing Glow */}
            <div className="absolute inset-0 rounded-full bg-coral-400/25 blur-xl animate-pulse" />

            {/* Fast Outer Arc */}
            <div
              className="absolute inset-0 rounded-full border-[3px] border-t-coral-400 border-r-transparent border-b-coral-500/20 border-l-transparent animate-spin shadow-[0_0_20px_rgba(245,143,124,0.3)]"
              style={{ animationDuration: "0.85s" }}
            />

            {/* Slow Counter Arc */}
            <div
              className="absolute inset-2 rounded-full border-[2.5px] border-r-blush-400 border-t-transparent border-l-blush-300/30 border-b-transparent animate-spin-slow"
              style={{ animationDirection: "reverse", animationDuration: "2.2s" }}
            />

            {/* Logo in Center */}
            <div className="relative z-10 flex items-center justify-center p-2 rounded-xl bg-obsidian-900/90 border border-white/10 shadow-[0_0_15px_rgba(245,143,124,0.3)]">
              <LogoIcon size={24} animated />
            </div>
          </div>

          {/* Typography */}
          <h3 className="text-lg sm:text-xl font-heading font-bold text-white tracking-wide">
            {text}
          </h3>
          {subtext && (
            <p className="text-xs sm:text-sm text-white/50 mt-1.5 max-w-xs font-sans leading-relaxed">
              {subtext}
            </p>
          )}

          {/* Decorative Progress Dots */}
          <div className="flex items-center gap-1.5 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400/80 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-coral-400/50 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GlobalLoader;
