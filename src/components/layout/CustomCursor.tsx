"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronCursor } from "@/components/ui/ChevronCursor";

export const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  
  const posRef = useRef({ x: -100, y: -100 });
  const trailPosRef = useRef({ x: -100, y: -100 });

  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Only enable custom cursor if device has fine pointer (mouse/trackpad) and not purely touch
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches && !("ontouchstart" in window && window.innerWidth < 1024);
    if (!hasFinePointer) {
      return;
    }
    setIsFinePointer(true);

    // Hide default system cursor so custom hardware-speed cursor takes over cleanly
    document.body.style.cursor = 'none';
    
    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
    `;
    document.head.appendChild(style);

    let animationFrameId: number;

    // Instant 1:1 hardware speed position update loop
    const updatePosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }

      // Smooth soft ambient aura follower
      trailPosRef.current.x += (posRef.current.x - trailPosRef.current.x) * 0.25;
      trailPosRef.current.y += (posRef.current.y - trailPosRef.current.y) * 0.25;
      
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailPosRef.current.x}px, ${trailPosRef.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      // Instant 1:1 hardware tracking with ZERO delay
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select') ||
          target.closest('[role="button"]') ||
          target.closest('.cursor-pointer')
        );
        setIsHovering(isInteractive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.body.style.cursor = 'auto';
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isVisible]);

  if (!isFinePointer || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
      {/* Soft Ambient Coral Aura Follower */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 w-12 h-12 rounded-full bg-[#F58F7C]/20 blur-xl pointer-events-none mix-blend-screen -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 will-change-transform"
        style={{
          transform: `translate3d(${trailPosRef.current.x}px, ${trailPosRef.current.y}px, 0)`,
          opacity: isHovering ? 0.8 : 0.4,
          scale: isClicking ? 1.4 : isHovering ? 1.2 : 1,
        }}
      />

      {/* Instant Zero-Lag Chevron Cursor Pointer */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform transition-all duration-75"
        style={{
          transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`,
          scale: isClicking ? 0.9 : isHovering ? 1.15 : 1,
        }}
      >
        <ChevronCursor 
          size={isHovering ? 32 : 28} 
          isHovering={isHovering} 
          isClicking={isClicking} 
        />
      </div>
    </div>
  );
};
