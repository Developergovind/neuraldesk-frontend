"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="prose prose-invert prose-cyan max-w-none"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-8">Privacy Policy</h1>
            <p className="text-white/50 mb-8 italic">Last Updated: May 4, 2026</p>
            
            <section className="mb-12">
              <h2 className="text-2xl font-heading font-bold mb-4 text-cyan-400">1. Information We Collect</h2>
              <p className="text-white/70 leading-relaxed">
                We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes your name, email address, company name, and any data you upload as knowledge sources for your bots.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-heading font-bold mb-4 text-cyan-400">2. How We Use Your Information</h2>
              <p className="text-white/70 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, including the generation of AI responses and the management of your chatbots. We do not sell your personal data to third parties.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-heading font-bold mb-4 text-cyan-400">3. Data Security</h2>
              <p className="text-white/70 leading-relaxed">
                We implement industry-standard security measures to protect your data. Knowledge base content is isolated per tenant and encrypted at rest.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
