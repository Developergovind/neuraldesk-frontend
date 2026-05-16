"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { NeuralMesh } from "@/components/3d/NeuralMesh";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-obsidian-950 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <NeuralMesh />
      </div>

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-violet-500 mb-4 tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-6 uppercase tracking-widest">
            Page Not Found
          </h2>
          <p className="text-white/40 max-w-md mx-auto mb-10 leading-relaxed">
            The neural link you followed appears to be broken. Our systems couldn't locate the data you're looking for.
          </p>
          <Link href="/">
            <Button variant="primary" size="lg" className="px-12">
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
