"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Flash the progress bar briefly on route/param change
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent"
        >
          {/* Glowing Gradient Bar */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-coral-500 via-blush-400 to-coral-400 shadow-[0_0_12px_#F58F7C]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RouteProgressBar;
