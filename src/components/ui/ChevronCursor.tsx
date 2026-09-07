"use client";

import React from "react";

interface ChevronCursorProps {
  className?: string;
  size?: number;
  isHovering?: boolean;
  isClicking?: boolean;
}

export function ChevronCursor({ 
  className, 
  size = 28, 
  isHovering = false, 
  isClicking = false 
}: ChevronCursorProps) {
  return (
    <div className={`relative pointer-events-none select-none ${className || ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible filter drop-shadow-[0_0_8px_rgba(245,143,124,0.7)]"
      >
        <defs>
          <filter id="neonChevronGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="chevronLeftFacet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F2C4CE" />
            <stop offset="40%" stopColor="#F58F7C" />
            <stop offset="100%" stopColor="#D94E38" />
          </linearGradient>

          <linearGradient id="chevronRightFacet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#FBD0D9" />
            <stop offset="100%" stopColor="#F58F7C" />
          </linearGradient>

          <linearGradient id="chevronBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F2C4CE" />
          </linearGradient>
        </defs>

        {/* Ambient Back Glow */}
        <path
          d="M 3 3 L 11 39 L 21 27 L 39 21 L 3 3 Z"
          fill="#F58F7C"
          opacity={isHovering ? 0.9 : 0.65}
          filter="url(#neonChevronGlow)"
        />

        {/* Left Facet */}
        <path
          d="M 3 3 L 11 39 L 21 27 Z"
          fill="url(#chevronLeftFacet)"
        />

        {/* Right Facet */}
        <path
          d="M 3 3 L 21 27 L 39 21 Z"
          fill="url(#chevronRightFacet)"
        />

        {/* Center Ridge Line */}
        <line
          x1="3"
          y1="3"
          x2="21"
          y2="27"
          stroke="#FFFFFF"
          strokeWidth="0.85"
          opacity="0.9"
        />

        {/* Crisp White Outer Border */}
        <path
          d="M 3 3 L 11 39 L 21 27 L 39 21 L 3 3 Z"
          fill="none"
          stroke="url(#chevronBorderGrad)"
          strokeWidth={isHovering ? 2.6 : 2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Apex Sparkle Point */}
        <circle cx="3" cy="3" r="1.4" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
