"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number | "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

export function LogoIcon({ className, size = "md", animated = false }: LogoProps) {
  const dimension = 
    typeof size === "number" 
      ? size 
      : size === "sm" 
      ? 28 
      : size === "md" 
      ? 36 
      : size === "lg" 
      ? 48 
      : 64;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", animated && "hover:rotate-45 transition-transform duration-700 ease-out", className)}
    >
      <defs>
        {/* Arm Gradient 1 (Outer Arc) */}
        <linearGradient id="armOuterGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2C2B30" stopOpacity="0.1" />
          <stop offset="35%" stopColor="#F58F7C" stopOpacity="0.6" />
          <stop offset="75%" stopColor="#F58F7C" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F2C4CE" stopOpacity="1" />
        </linearGradient>

        {/* Arm Gradient 2 (Inner Arc) */}
        <linearGradient id="armInnerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2C2B30" stopOpacity="0.05" />
          <stop offset="40%" stopColor="#d9624d" stopOpacity="0.6" />
          <stop offset="80%" stopColor="#F58F7C" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F2C4CE" stopOpacity="1" />
        </linearGradient>

        {/* Center Facet Gradient */}
        <linearGradient id="centerCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F58F7C" />
          <stop offset="50%" stopColor="#F2C4CE" />
          <stop offset="100%" stopColor="#F58F7C" />
        </linearGradient>

        {/* Radial Glow Filter */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 6 Vortex Arms */}
      {[0, 60, 120, 180, 240, 300].map((angle, index) => (
        <g key={index} transform={`rotate(${angle} 60 60)`}>
          {/* Inner Arc */}
          <path
            d="M 58 45 C 57 32, 66 22, 79 20 C 85 19, 90 22, 92 25"
            stroke="url(#armInnerGrad)"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Outer Arc */}
          <path
            d="M 64 52 C 67 36, 79 26, 94 28 C 101 29, 106 33, 108 38"
            stroke="url(#armOuterGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* Center Faceted Aperture Core */}
      <g transform="translate(60, 60)">
        {/* Core Outer Hexagonal/Octagonal Ring */}
        <circle
          r="9.5"
          fill="#2C2B30"
          stroke="url(#centerCoreGrad)"
          strokeWidth="1.8"
        />

        {/* Internal Facet Geometric Lines */}
        <path
          d="M 0 -9.5 L 6.7 -6.7 L 9.5 0 L 6.7 6.7 L 0 9.5 L -6.7 6.7 L -9.5 0 L -6.7 -6.7 Z"
          fill="none"
          stroke="url(#centerCoreGrad)"
          strokeWidth="1.2"
          opacity="0.8"
        />
        
        {/* Pinwheel Aperture Triangles */}
        <path
          d="M 0 -9.5 L 3.5 -3.5 L 9.5 0 L 3.5 3.5 L 0 9.5 L -3.5 3.5 L -9.5 0 L -3.5 -3.5 Z"
          fill="rgba(245, 143, 124, 0.25)"
          stroke="url(#centerCoreGrad)"
          strokeWidth="1.2"
        />

        {/* Center Point Sparkle */}
        <circle r="2.2" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  size = "md",
  showText = true,
  textClassName,
}: {
  className?: string;
  size?: number | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 select-none group", className)}>
      <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-obsidian-900/80 border border-white/5 shadow-[0_0_20px_rgba(245,143,124,0.15)] group-hover:border-coral-500/30 group-hover:shadow-[0_0_25px_rgba(245,143,124,0.3)] transition-all duration-300">
        <LogoIcon size={size} animated />
      </div>
      {showText && (
        <span className={cn("text-xl font-heading font-bold tracking-wide text-white group-hover:text-silver-light transition-colors", textClassName)}>
          NeuralDesk
        </span>
      )}
    </div>
  );
}
