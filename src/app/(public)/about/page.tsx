"use client";

import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { usePublicContent } from "@/lib/hooks/usePublic";
import ReactMarkdown from "react-markdown";

export default function AboutPage() {
  const { data: content, isLoading } = usePublicContent("about.content");

  const defaultContent = `# About NeuralDesk

We are on a mission to democratize enterprise-grade AI support. NeuralDesk was born out of the frustration with complex, ugly, and expensive chatbot solutions.

### Our Vision
To create a world where every business, regardless of size, can provide instant, intelligent, and beautiful support to their customers.

### Our Tech
Leveraging the latest in RAG (Retrieval-Augmented Generation) and glassmorphic UI design, we provide a platform that is as powerful as it is beautiful.

### The Team
Based in the heart of the digital frontier, our team of AI researchers, designers, and engineers work tirelessly to push the boundaries of what's possible in conversational AI.`;

  return (
    <div className="min-h-screen bg-obsidian-950 text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading ? (
              <div className="space-y-8 animate-pulse">
                <div className="h-12 w-2/3 bg-white/5 rounded-lg" />
                <div className="h-4 w-full bg-white/5 rounded-lg" />
                <div className="h-4 w-full bg-white/5 rounded-lg" />
                <div className="h-64 w-full bg-white/5 rounded-2xl" />
              </div>
            ) : (
              <div className="prose prose-invert prose-cyan max-w-none">
                <ReactMarkdown>
                  {content || defaultContent}
                </ReactMarkdown>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
