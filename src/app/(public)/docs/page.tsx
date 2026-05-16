"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { usePublicContent } from "@/lib/hooks/usePublic";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { Search, Book, FileText, Zap, Shield, Code } from "lucide-react";

const sidebarItems = [
  { label: "Getting Started", icon: Zap, id: "start" },
  { label: "Bot Configuration", icon: FileText, id: "config" },
  { label: "Knowledge Base", icon: Book, id: "kb" },
  { label: "API Reference", icon: Code, id: "api" },
  { label: "Security & Privacy", icon: Shield, id: "security" },
];

export default function DocsPage() {
  const { data: content, isLoading } = usePublicContent("docs.content");
  const [activeTab, setActiveTab] = useState("start");

  const defaultDocs = `# NeuralDesk Documentation

Welcome to the NeuralDesk documentation. Here you'll find everything you need to build and deploy your AI agents.

## Quick Start
1. **Create an account** on NeuralDesk.
2. **Build your first bot** from the dashboard.
3. **Upload your knowledge** (PDF, Docx, or URL).
4. **Deploy the widget** to your website.

## Bot Configuration
You can customize your bot's persona, greeting, and accent colors to match your brand...

## Knowledge Base
NeuralDesk uses RAG (Retrieval-Augmented Generation) to ground AI responses in your data...`;

  return (
    <div className="min-h-screen bg-obsidian-950 text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-8 shrink-0">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                placeholder="Search docs..."
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]" 
                      : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-4xl">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <div className="space-y-8 animate-pulse">
                  <div className="h-12 w-2/3 bg-white/5 rounded-lg" />
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-full bg-white/5 rounded-lg" />)}
                </div>
              ) : (
                <div className="prose prose-invert prose-cyan max-w-none prose-headings:font-heading prose-headings:font-bold">
                  <ReactMarkdown>
                    {content || defaultDocs}
                  </ReactMarkdown>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
