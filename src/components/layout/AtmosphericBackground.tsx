"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AtmosphericBackgroundProps {
  className?: string;
  variant?: "default" | "subtle" | "vibrant";
}

/**
 * AtmosphericBackground
 * Premium, cinematic, multi-layered ambient background inspired by 4AI Network.
 * Uses diffused large radial gradient fields, heavy optical blur, slow GPU-accelerated
 * orbital drifts, and subtle vignette overlays for ultra-high-end depth and legibility.
 */
export function AtmosphericBackground({
  className,
  variant = "default",
}: AtmosphericBackgroundProps) {
  const isSubtle = variant === "subtle";
  const isVibrant = variant === "vibrant";

  const coralOpacity = isSubtle ? "opacity-[0.12]" : isVibrant ? "opacity-[0.28]" : "opacity-[0.20]";
  const blushOpacity = isSubtle ? "opacity-[0.10]" : isVibrant ? "opacity-[0.24]" : "opacity-[0.16]";
  const coreOpacity = isSubtle ? "opacity-[0.08]" : isVibrant ? "opacity-[0.18]" : "opacity-[0.12]";
  const slateOpacity = isSubtle ? "opacity-[0.20]" : isVibrant ? "opacity-[0.40]" : "opacity-[0.30]";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none",
        "bg-[#1c1b20]", // Deep obsidian/charcoal base layer
        className
      )}
    >
      {/* Base Atmospheric Linear Flow */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#18171b] via-[#232227] to-[#161519] opacity-90" 
      />

      {/* ─── Layer 1: Primary Upper-Left Coral Ambient Glow Field ─── */}
      <div
        className={cn(
          "absolute -top-[25vw] -left-[20vw] w-[80vw] h-[80vw] min-w-[650px] min-h-[650px] max-w-[1400px] max-h-[1400px]",
          "rounded-full blur-[100px] sm:blur-[140px] md:blur-[180px]",
          coralOpacity,
          "animate-atmospheric-1"
        )}
        style={{
          background: "radial-gradient(circle at 45% 45%, #F58F7C 0%, rgba(245, 143, 124, 0.45) 40%, rgba(245, 143, 124, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ─── Layer 2: Secondary Upper-Right Blush Rose Aurora Field ─── */}
      <div
        className={cn(
          "absolute -top-[15vw] -right-[20vw] w-[75vw] h-[75vw] min-w-[600px] min-h-[600px] max-w-[1300px] max-h-[1300px]",
          "rounded-full blur-[100px] sm:blur-[140px] md:blur-[170px]",
          blushOpacity,
          "animate-atmospheric-2"
        )}
        style={{
          background: "radial-gradient(circle at 50% 50%, #F2C4CE 0%, rgba(242, 196, 206, 0.5) 40%, rgba(242, 196, 206, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ─── Layer 3: Central Ambient Core Atmosphere (Behind Hero / Main Content) ─── */}
      <div
        className={cn(
          "absolute top-[25%] left-[20%] w-[60vw] h-[50vw] min-w-[500px] min-h-[420px] max-w-[1000px] max-h-[800px]",
          "rounded-[100%] blur-[120px] sm:blur-[150px] md:blur-[190px]",
          coreOpacity,
          "animate-atmospheric-3"
        )}
        style={{
          background: "radial-gradient(ellipse at 50% 50%, #F58F7C 0%, #F2C4CE 45%, transparent 75%)",
        }}
      />

      {/* ─── Layer 4: Lower-Left Deep Slate & Warm Glow Base ─── */}
      <div
        className={cn(
          "absolute top-[55%] -left-[25vw] w-[85vw] h-[85vw] min-w-[700px] min-h-[700px] max-w-[1400px] max-h-[1400px]",
          "rounded-full blur-[110px] sm:blur-[140px] md:blur-[180px]",
          slateOpacity,
          "animate-atmospheric-4"
        )}
        style={{
          background: "radial-gradient(circle at 45% 55%, #4F4F51 0%, rgba(245, 143, 124, 0.25) 45%, transparent 80%)",
        }}
      />

      {/* ─── Layer 5: Lower-Right Soft Blush Halo ─── */}
      <div
        className={cn(
          "absolute top-[65%] -right-[20vw] w-[70vw] h-[70vw] min-w-[600px] min-h-[600px] max-w-[1200px] max-h-[1200px]",
          "rounded-full blur-[100px] sm:blur-[140px] md:blur-[160px]",
          blushOpacity,
          "animate-atmospheric-1"
        )}
        style={{
          background: "radial-gradient(circle at 55% 45%, #F2C4CE 0%, rgba(79, 79, 81, 0.4) 50%, transparent 80%)",
        }}
      />

      {/* ─── Layer 6: Subtle Radial Vignette & Contrast Protector Overlay ─── */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(24,23,27,0.35)_70%,rgba(24,23,27,0.75)_100%)] pointer-events-none" 
      />

      {/* ─── Layer 7: Subtle Center-Horizon Ambient Glow Line ─── */}
      <div 
        className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-coral-400/10 to-transparent opacity-40 blur-[1px]" 
      />
    </div>
  );
}
