"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="prose prose-invert prose-violet max-w-none"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-8">Terms of Service</h1>
            <p className="text-white/50 mb-8 italic">Last Updated: May 4, 2026</p>
            
            <section className="mb-12">
              <h2 className="text-2xl font-heading font-bold mb-4 text-violet-400">1. Acceptance of Terms</h2>
              <p className="text-white/70 leading-relaxed">
                By accessing or using NeuralDesk, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-heading font-bold mb-4 text-violet-400">2. Description of Service</h2>
              <p className="text-white/70 leading-relaxed">
                NeuralDesk provides a platform for creating and managing AI-powered chatbots using RAG technology. We reserve the right to modify or discontinue the service at any time.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-heading font-bold mb-4 text-violet-400">3. User Responsibilities</h2>
              <p className="text-white/70 leading-relaxed">
                You are responsible for the content you upload and the behavior of your bots. You agree not to use the service for any illegal or harmful activities.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
