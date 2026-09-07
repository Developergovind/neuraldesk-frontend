'use client';

import React, { useEffect, useRef, useMemo } from 'react';

export interface NetworkConfig {
  particleCount?: {
    desktop?: number;
    tablet?: number;
    mobile?: number;
  };
  particleSize?: {
    min?: number;
    max?: number;
  };
  particleSpeed?: {
    min?: number;
    max?: number;
  };
  connectionDistance?: number;
  lineOpacity?: number;
  particleOpacity?: {
    min?: number;
    max?: number;
  };
  glowIntensity?: number;
  mouseRadius?: number;
  mouseForce?: number;
  backgroundDarkness?: string;
  colors?: {
    background?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    lines?: string;
    pulse?: string;
  };
  enableMouseInteraction?: boolean;
  enablePulses?: boolean;
  pulseFrequency?: number;
  ambientGlow?: boolean;
  className?: string;
}

interface ResolvedConfig {
  particleCount: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  particleSize: {
    min: number;
    max: number;
  };
  particleSpeed: {
    min: number;
    max: number;
  };
  connectionDistance: number;
  lineOpacity: number;
  particleOpacity: {
    min: number;
    max: number;
  };
  glowIntensity: number;
  mouseRadius: number;
  mouseForce: number;
  backgroundDarkness: string;
  colors: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    lines: string;
    pulse: string;
  };
  enableMouseInteraction: boolean;
  enablePulses: boolean;
  pulseFrequency: number;
  ambientGlow: boolean;
  className: string;
}

const DEFAULT_CONFIG: ResolvedConfig = {
  particleCount: {
    desktop: 200,
    tablet: 140,
    mobile: 70,
  },
  particleSize: {
    min: 1.0,
    max: 2.6,
  },
  particleSpeed: {
    min: 0.15,
    max: 0.55,
  },
  connectionDistance: 135,
  lineOpacity: 0.16,
  particleOpacity: {
    min: 0.25,
    max: 0.85,
  },
  glowIntensity: 10,
  mouseRadius: 170,
  mouseForce: 0.05,
  backgroundDarkness: 'rgba(11, 13, 19, 0.94)',
  colors: {
    background: '#090B10',
    primary: '#F58F7C', // Coral Accent
    secondary: '#818CF8', // Indigo / Purple
    accent: '#38BDF8', // Cyan / Electric Blue
    lines: '130, 150, 190', // RGB tuple for dynamic alpha
    pulse: '#FFFFFF',
  },
  enableMouseInteraction: true,
  enablePulses: true,
  pulseFrequency: 0.03,
  ambientGlow: true,
  className: '',
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  depth: number; // 0.25 (far) to 1.0 (near)
  opacity: number;
  pulseOffset: number;
  driftAngle: number;
  driftSpeed: number;
}

interface PulsePacket {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
  color: string;
}

export const AnimatedNetworkBackground: React.FC<NetworkConfig> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Merge provided props with default configuration
  const config: ResolvedConfig = useMemo(() => {
    return {
      particleCount: {
        desktop: props.particleCount?.desktop ?? DEFAULT_CONFIG.particleCount.desktop,
        tablet: props.particleCount?.tablet ?? DEFAULT_CONFIG.particleCount.tablet,
        mobile: props.particleCount?.mobile ?? DEFAULT_CONFIG.particleCount.mobile,
      },
      particleSize: {
        min: props.particleSize?.min ?? DEFAULT_CONFIG.particleSize.min,
        max: props.particleSize?.max ?? DEFAULT_CONFIG.particleSize.max,
      },
      particleSpeed: {
        min: props.particleSpeed?.min ?? DEFAULT_CONFIG.particleSpeed.min,
        max: props.particleSpeed?.max ?? DEFAULT_CONFIG.particleSpeed.max,
      },
      connectionDistance: props.connectionDistance ?? DEFAULT_CONFIG.connectionDistance,
      lineOpacity: props.lineOpacity ?? DEFAULT_CONFIG.lineOpacity,
      particleOpacity: {
        min: props.particleOpacity?.min ?? DEFAULT_CONFIG.particleOpacity.min,
        max: props.particleOpacity?.max ?? DEFAULT_CONFIG.particleOpacity.max,
      },
      glowIntensity: props.glowIntensity ?? DEFAULT_CONFIG.glowIntensity,
      mouseRadius: props.mouseRadius ?? DEFAULT_CONFIG.mouseRadius,
      mouseForce: props.mouseForce ?? DEFAULT_CONFIG.mouseForce,
      backgroundDarkness: props.backgroundDarkness ?? DEFAULT_CONFIG.backgroundDarkness,
      colors: {
        background: props.colors?.background ?? DEFAULT_CONFIG.colors.background,
        primary: props.colors?.primary ?? DEFAULT_CONFIG.colors.primary,
        secondary: props.colors?.secondary ?? DEFAULT_CONFIG.colors.secondary,
        accent: props.colors?.accent ?? DEFAULT_CONFIG.colors.accent,
        lines: props.colors?.lines ?? DEFAULT_CONFIG.colors.lines,
        pulse: props.colors?.pulse ?? DEFAULT_CONFIG.colors.pulse,
      },
      enableMouseInteraction: props.enableMouseInteraction ?? DEFAULT_CONFIG.enableMouseInteraction,
      enablePulses: props.enablePulses ?? DEFAULT_CONFIG.enablePulses,
      pulseFrequency: props.pulseFrequency ?? DEFAULT_CONFIG.pulseFrequency,
      ambientGlow: props.ambientGlow ?? DEFAULT_CONFIG.ambientGlow,
      className: props.className ?? DEFAULT_CONFIG.className,
    };
  }, [props]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Check for user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;

    // Mouse state with smooth interpolation
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      isHovering: false,
    };

    let particles: Particle[] = [];
    let pulses: PulsePacket[] = [];

    // Helper to get active particle count based on responsive viewport width
    const getTargetParticleCount = (w: number): number => {
      if (w < 640) return config.particleCount.mobile;
      if (w < 1024) return config.particleCount.tablet;
      return config.particleCount.desktop;
    };

    // Color palette selector
    const colorPalette = [
      { color: config.colors.primary, glow: config.colors.primary },
      { color: config.colors.secondary, glow: config.colors.secondary },
      { color: config.colors.accent, glow: config.colors.accent },
    ];

    // Initialize particles
    const initParticles = () => {
      const count = getTargetParticleCount(width);
      particles = [];
      pulses = [];

      for (let i = 0; i < count; i++) {
        const depth = 0.25 + Math.random() * 0.75; // 0.25 = far away, 1.0 = close
        const baseRadius =
          (config.particleSize.min + Math.random() * (config.particleSize.max - config.particleSize.min)) *
          (0.6 + depth * 0.5);

        const paletteItem = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        const speed = (config.particleSpeed.min + Math.random() * (config.particleSpeed.max - config.particleSpeed.min)) * depth;
        const angle = Math.random() * Math.PI * 2;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: baseRadius,
          baseRadius,
          color: paletteItem.color,
          glowColor: paletteItem.glow,
          depth,
          opacity:
            (config.particleOpacity.min +
              Math.random() * (config.particleOpacity.max - config.particleOpacity.min)) *
            depth,
          pulseOffset: Math.random() * Math.PI * 2,
          driftAngle: Math.random() * Math.PI * 2,
          driftSpeed: (Math.random() - 0.5) * 0.015,
        });
      }
    };

    // Handle high-DPI canvas resizing
    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      // Clamp DPR to max 2 to conserve GPU fill-rate on 3x/4x mobile screens
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles();
    };

    handleResize();

    // Mouse movement listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
      mouse.isHovering = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.isHovering = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
      mouse.isHovering = false;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    if (config.enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Tab visibility handling (pause animation when tab is inactive to save battery)
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !prefersReducedMotion) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Main animation loop
    let lastTime = performance.now();
    let time = 0;

    const maxDistSq = config.connectionDistance * config.connectionDistance;
    const mouseRadiusSq = config.mouseRadius * config.mouseRadius;

    const render = (now: number) => {
      if (!isVisible) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      time += dt;

      // Smooth mouse interpolation
      if (mouse.isHovering) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      // 1. Clear background with deep dark tone
      ctx.fillStyle = config.colors.background;
      ctx.fillRect(0, 0, width, height);

      // 2. Ambient radial energy glow (soft nebula effect)
      if (config.ambientGlow) {
        const grad1 = ctx.createRadialGradient(
          width * 0.25,
          height * 0.35,
          20,
          width * 0.25,
          height * 0.35,
          width * 0.55
        );
        grad1.addColorStop(0, 'rgba(129, 140, 248, 0.045)');
        grad1.addColorStop(1, 'rgba(11, 13, 19, 0)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        const grad2 = ctx.createRadialGradient(
          width * 0.75,
          height * 0.65,
          20,
          width * 0.75,
          height * 0.65,
          width * 0.6
        );
        grad2.addColorStop(0, 'rgba(245, 143, 124, 0.04)');
        grad2.addColorStop(1, 'rgba(11, 13, 19, 0)');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);
      }

      const activeConnections: { i: number; j: number; p1: Particle; p2: Particle }[] = [];

      // 3. Update and render particles
      const particleLen = particles.length;

      for (let i = 0; i < particleLen; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // Organic drift oscillation
          p.driftAngle += p.driftSpeed;
          p.x += p.vx + Math.cos(p.driftAngle) * 0.15;
          p.y += p.vy + Math.sin(p.driftAngle) * 0.15;

          // Screen wrap-around with smooth boundary margin
          const margin = 20;
          if (p.x < -margin) p.x = width + margin;
          if (p.x > width + margin) p.x = -margin;
          if (p.y < -margin) p.y = height + margin;
          if (p.y > height + margin) p.y = -margin;

          // Mouse proximity reaction (gentle magnetic repulsion/attraction)
          if (mouse.isHovering) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < mouseRadiusSq && distSq > 0.01) {
              const dist = Math.sqrt(distSq);
              const force = (1 - dist / config.mouseRadius) * config.mouseForce;
              p.x += (dx / dist) * force * 15 * p.depth;
              p.y += (dy / dist) * force * 15 * p.depth;
            }
          }
        }

        // Pulse intensity modulation
        const currentPulse = Math.sin(time * 1.5 + p.pulseOffset) * 0.15 + 0.85;
        const currentRadius = p.radius * currentPulse;
        const currentAlpha = p.opacity * currentPulse;

        // Render Particle Core
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(currentAlpha, 1);

        // Bloom Glow for closer nodes
        if (p.depth > 0.65 && config.glowIntensity > 0) {
          ctx.shadowBlur = config.glowIntensity * p.depth;
          ctx.shadowColor = p.glowColor;
        }
        ctx.fill();
        ctx.restore();

        // 4. Calculate Particle Connections
        for (let j = i + 1; j < particleLen; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const factor = 1 - dist / config.connectionDistance;
            const depthFactor = (p.depth + p2.depth) * 0.5;
            let alpha = factor * config.lineOpacity * depthFactor;

            // Highlight connection if near cursor
            if (mouse.isHovering) {
              const midX = (p.x + p2.x) * 0.5;
              const midY = (p.y + p2.y) * 0.5;
              const mdx = midX - mouse.x;
              const mdy = midY - mouse.y;
              if (mdx * mdx + mdy * mdy < mouseRadiusSq) {
                alpha = Math.min(alpha * 2.2, 0.6);
              }
            }

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${config.colors.lines}, ${alpha})`;
            ctx.lineWidth = 0.65 * depthFactor;
            ctx.stroke();

            activeConnections.push({ i, j, p1: p, p2 });
          }
        }
      }

      // 5. Dynamic Energy Pulses traveling along connection lines
      if (config.enablePulses && !prefersReducedMotion && activeConnections.length > 0) {
        // Spawn random pulse
        if (Math.random() < config.pulseFrequency && pulses.length < 15) {
          const conn = activeConnections[Math.floor(Math.random() * activeConnections.length)];
          pulses.push({
            fromIndex: conn.i,
            toIndex: conn.j,
            progress: 0,
            speed: 0.8 + Math.random() * 0.8,
            color: config.colors.pulse,
          });
        }

        // Render and update pulses
        for (let k = pulses.length - 1; k >= 0; k--) {
          const pulse = pulses[k];
          pulse.progress += pulse.speed * dt;

          if (pulse.progress >= 1) {
            pulses.splice(k, 1);
            continue;
          }

          const p1 = particles[pulse.fromIndex];
          const p2 = particles[pulse.toIndex];

          if (!p1 || !p2) {
            pulses.splice(k, 1);
            continue;
          }

          const px = p1.x + (p2.x - p1.x) * pulse.progress;
          const py = p1.y + (p2.y - p1.y) * pulse.progress;
          const pulseAlpha = Math.sin(pulse.progress * Math.PI) * 0.8;

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = pulse.color;
          ctx.globalAlpha = pulseAlpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = config.colors.accent;
          ctx.fill();
          ctx.restore();
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // If reduced motion is preferred, render single static frame
    if (prefersReducedMotion) {
      render(performance.now());
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (config.enableMouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [config]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none ${config.className}`}
      style={{
        backgroundColor: config.colors.background,
      }}
    >
      {/* Dynamic GPU Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Cinematic Vignette Overlay to ensure 100% foreground readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${config.backgroundDarkness} 90%)`,
        }}
      />
    </div>
  );
};

export default AnimatedNetworkBackground;
