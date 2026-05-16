"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Spring physics for smooth trailing
  const cursorX = useSpring(-100, { damping: 25, stiffness: 150, mass: 0.5 });
  const cursorY = useSpring(-100, { damping: 25, stiffness: 150, mass: 0.5 });
  const dotX = useSpring(-100, { damping: 40, stiffness: 400, mass: 0.1 });
  const dotY = useSpring(-100, { damping: 40, stiffness: 400, mass: 0.1 });

  useEffect(() => {
    // Hide default cursor globally
    document.body.style.cursor = 'none';
    
    // Add custom cursor style to all interactive elements
    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
    `;
    document.head.appendChild(style);

    const moveCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.body.style.cursor = 'auto';
      document.head.removeChild(style);
    };
  }, [cursorX, cursorY, dotX, dotY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer trailing ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-400/50 pointer-events-none z-[9999] mix-blend-screen"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      />
      {/* Inner fast dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-400 pointer-events-none z-[10000] shadow-[0_0_10px_rgba(0,212,255,0.8)]"
        style={{
          x: dotX,
          y: dotY,
        }}
      />
    </>
  );
};
