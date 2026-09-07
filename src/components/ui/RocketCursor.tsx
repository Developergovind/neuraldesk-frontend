"use client";

import React from "react";
import { motion } from "framer-motion";

interface RocketCursorProps {
  className?: string;
  size?: number;
  isHovering?: boolean;
  isClicking?: boolean;
}

export function RocketCursor({ 
  className, 
  size = 36, 
  isHovering = false, 
  isClicking = false 
}: RocketCursorProps) {
  return (
    <div className={`relative pointer-events-none select-none ${className || ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible filter drop-shadow-[0_0_8px_rgba(245,143,124,0.6)]"
      >
        <defs>
          {/* Neon Coral Glow Filter */}
          <filter id="cursorNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glowing Edge Gradient */}
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#F2C4CE" />
            <stop offset="60%" stopColor="#F58F7C" />
            <stop offset="100%" stopColor="#E05742" />
          </linearGradient>

          {/* Stealth Fuselage Gradient */}
          <linearGradient id="fuselageDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3A3840" />
            <stop offset="50%" stopColor="#2C2B30" />
            <stop offset="100%" stopColor="#1E1D22" />
          </linearGradient>

          {/* Left Wing Facet Shade */}
          <linearGradient id="wingFacetLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A292E" />
            <stop offset="100%" stopColor="#19181C" />
          </linearGradient>

          {/* Right Wing Facet Light */}
          <linearGradient id="wingFacetRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#45434C" />
            <stop offset="100%" stopColor="#2C2B30" />
          </linearGradient>

          {/* Engine Nozzle Gradient */}
          <linearGradient id="nozzleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F4F51" />
            <stop offset="50%" stopColor="#2C2B30" />
            <stop offset="100%" stopColor="#151417" />
          </linearGradient>

          {/* Flame Plume Gradient */}
          <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FFDEB5" />
            <stop offset="55%" stopColor="#F58F7C" />
            <stop offset="90%" stopColor="#E05742" />
            <stop offset="100%" stopColor="#E05742" stopOpacity="0" />
          </linearGradient>

          {/* Core Inner Flame */}
          <linearGradient id="flameCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFE1CF" />
            <stop offset="100%" stopColor="#F58F7C" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 1. JET THRUSTER EXHAUST FLAME */}
        <g className="origin-[35px_35px]">
          {/* Outer Flame Plume */}
          <motion.path
            d="M 29 41 C 33 49, 44 62, 53 65 C 47 55, 48 53, 58 56 C 50 49, 43 45, 41 29 Z"
            fill="url(#flameGrad)"
            opacity={isClicking ? 1 : isHovering ? 0.95 : 0.85}
            animate={{
              scale: isClicking ? [1.2, 1.35, 1.2] : isHovering ? [1.05, 1.15, 1.05] : [0.95, 1.05, 0.95],
              opacity: isClicking ? [0.9, 1, 0.9] : [0.75, 0.95, 0.75],
            }}
            transition={{
              repeat: Infinity,
              duration: isClicking ? 0.15 : 0.35,
              ease: "easeInOut",
            }}
          />

          {/* Inner High-Heat Core Flame */}
          <motion.path
            d="M 31 39 C 34 46, 42 54, 48 56 C 44 49, 43 47, 50 49 C 44 44, 40 40, 39 31 Z"
            fill="url(#flameCoreGrad)"
            animate={{
              scale: isClicking ? [1.1, 1.25, 1.1] : [0.9, 1.05, 0.9],
              opacity: [0.85, 1, 0.85],
            }}
            transition={{
              repeat: Infinity,
              duration: isClicking ? 0.12 : 0.25,
              ease: "easeInOut",
            }}
          />
        </g>

        {/* 2. ROCKET NOZZLE BARREL */}
        <g>
          {/* Nozzle Cylindrical Base */}
          <path
            d="M 27 33 L 34 40 L 40 34 L 33 27 Z"
            fill="url(#nozzleGrad)"
            stroke="#4F4F51"
            strokeWidth="1.2"
          />
          {/* Nozzle Ring Collar Glow */}
          <path
            d="M 28 35 L 36 43 L 41 38 L 33 30 Z"
            fill="#1E1D22"
            stroke="url(#edgeGrad)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <line 
            x1="29" y1="36" x2="39" y2="26" 
            stroke="url(#edgeGrad)" 
            strokeWidth="1.4" 
            strokeLinecap="round" 
          />
        </g>

        {/* 3. STEALTH ARROWHEAD MAIN FUSELAGE */}
        <g>
          {/* Left Wing Facet */}
          <path
            d="M 2 2 L 15 44 L 23 35 L 29 33 L 18 18 Z"
            fill="url(#wingFacetLeft)"
          />

          {/* Right Wing Facet */}
          <path
            d="M 2 2 L 18 18 L 33 29 L 35 23 L 44 15 Z"
            fill="url(#wingFacetRight)"
          />

          {/* Center Spine Facet (Connecting to tip) */}
          <path
            d="M 2 2 L 18 18 L 29 29 L 18 18 Z"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.8"
          />

          {/* 4. INNER HUD CHEVRON INLAY */}
          <path
            d="M 12 16 L 20 28 L 26 26 L 28 20 L 16 12 Z"
            fill="url(#fuselageDark)"
            stroke="url(#edgeGrad)"
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Inner HUD Core Accent Line */}
          <path
            d="M 9 9 L 17 21 L 22 20 L 20 15 L 9 9"
            fill="none"
            stroke="rgba(242, 196, 206, 0.6)"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />

          {/* 5. OUTER GLOWING CONTOUR BORDER */}
          <path
            d="M 2 2 L 15 44 L 24 35 L 30 33 L 33 30 L 35 24 L 44 15 L 2 2 Z"
            fill="none"
            stroke="url(#edgeGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#cursorNeonGlow)"
          />

          {/* Sharp Apex Highlight Point */}
          <circle cx="2.5" cy="2.5" r="1.5" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}
