"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { usePublicContent } from "@/lib/hooks/usePublic";
import ReactMarkdown from "react-markdown";

export default function ChangelogPage() {
  const { data: content, isLoading } = usePublicContent("changelog.items");

  const defaultChangelog = [
    { version: "1.0.0", date: "2024-05-04", changes: ["Initial launch of NeuralDesk", "Support for PDF/Docx knowledge base", "Custom glassmorphic chatbot widget", "Multi-tenant dashboard"] },
    { version: "0.9.0", date: "2024-04-15", changes: ["Beta release", "Ollama integration", "Auth system implemented"] },
  ];

  const items = content || defaultChangelog;

  return (
    <div className="min-h-screen bg-obsidian-950 text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-5xl font-heading font-bold mb-4">Changelog</h1>
            <p className="text-white/40 text-lg">Follow our journey as we build the future of AI support.</p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-12 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl" />)}
            </div>
          ) : (
            <div className="space-y-12 relative">
              {/* Timeline Line */}
              <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-white/5" />

              {items.map((item: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative md:pl-20"
                >
                  {/* Timeline Dot */}
                  <div className="hidden md:flex absolute left-6 top-2 w-4 h-4 rounded-full bg-[#080810] border-2 border-cyan-500 items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#00d4ff]" />
                  </div>

                  <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-500">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold border border-cyan-500/20">
                          v{item.version}
                        </span>
                        <span className="text-white/30 text-sm font-medium">{item.date}</span>
                      </div>
                      {i === 0 && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Latest</span>
                      )}
                    </div>

                    <ul className="space-y-4">
                      {item.changes.map((change: string, idx: number) => (
                        <li key={idx} className="flex gap-3 text-white/60 leading-relaxed">
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
