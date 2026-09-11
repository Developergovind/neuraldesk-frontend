"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { NeuralMesh } from "@/components/3d/NeuralMesh";
import { Navbar } from "@/components/layout/Navbar";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePublicContent, usePublicPlans } from "@/lib/hooks/usePublic";
import { MockWebsite } from "@/components/demo/MockWebsite";
import { Check, ChevronDown, Copy, Terminal, Zap, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { WS_BASE } from "@/lib/api";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [installTab, setInstallTab] = useState<"html" | "wordpress" | "shopify" | "webflow">("html");
  const [copied, setCopied] = useState(false);
  const demoRef = useRef<HTMLDivElement | null>(null);
  const isDemoVisible = useInView(demoRef, { once: true, amount: 0.35 });
  const [autoOpenDemo, setAutoOpenDemo] = useState(false);
  
  const { data: cms } = usePublicContent([
    "hero.headline",
    "hero.subheadline",
    "hero.cta_primary",
    "hero.cta_secondary",
    "demo.section.headline",
    "demo.section.subheadline",
    "demo.section.company_name",
    "demo.section.primary_color",
    "demo.section.auto_open_delay",
    "demo.section.show",
    "demo.suggested_questions",
  ]);
  const { data: plans } = usePublicPlans();
  const { data: demoConfig } = usePublicContent("demo.bot_id");

  const [publicDemoConfig, setPublicDemoConfig] = useState<{
    botId: string;
    botName: string;
    greeting: string;
    accentColor: string;
  } | null>(null);

  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const primaryHeadline = "Next-Gen AI Support Without The Complexity";
  const cmsHeadline = cms?.["hero.headline"];
  const secondaryHeadline = cmsHeadline && cmsHeadline.trim() !== primaryHeadline.trim()
    ? cmsHeadline
    : "Build the Future of Customer Support with AI";

  const headlines = [primaryHeadline, secondaryHeadline];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").trim();
    if (apiBase.includes('neuraldeskapp.duckdns.org') || apiBase.includes('neuraldesk-api.duckdns.org')) {
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        apiBase = 'http://localhost:5001/api';
      }
    }
    fetch(`${apiBase.replace(/\/+$/, "")}/public/demo-config`)
      .then((response) => response.json())
      .then((data) => setPublicDemoConfig(data))
      .catch(() => setPublicDemoConfig(null));
  }, []);

  useEffect(() => {
    if (!isDemoVisible) return;
    const seconds = Number(cms?.["demo.section.auto_open_delay"] ?? 1.5);
    const timer = window.setTimeout(() => setAutoOpenDemo(true), Math.max(0.5, seconds) * 1000);
    return () => window.clearTimeout(timer);
  }, [isDemoVisible, cms]);

  useEffect(() => {
    // Give the first title 4.2s to fully animate in and be read, then transition every 5s
    const timer = setTimeout(() => {
      if (!isHovered) {
        setHeadlineIndex((prev) => (prev + 1) % headlines.length);
      }
    }, headlineIndex === 0 ? 4200 : 5000);

    return () => clearTimeout(timer);
  }, [headlineIndex, headlines.length, isHovered]);

  if (!mounted) return null;

  const currentHeadline = headlines[headlineIndex] || primaryHeadline;
  const currentWords = currentHeadline.split(" ");
  const subheadline = cms?.["hero.subheadline"] || "Automate customer engagement with AI assistants trained on your unique business knowledge. Deploy a premium, glassmorphic chat experience in seconds.";
  const demoHeadline = cms?.["demo.section.headline"] || "See NeuralDesk in Action";
  const demoSubheadline = cms?.["demo.section.subheadline"] || "Chat with our demo bot right now.";
  const companyName = cms?.["demo.section.company_name"] || "Acme Corp";
  const demoColor = cms?.["demo.section.primary_color"] || "#F58F7C";
  const showDemo = cms?.["demo.section.show"] !== false;
  const suggestedQuestions = Array.isArray(cms?.["demo.suggested_questions"])
    ? cms?.["demo.suggested_questions"]
    : [];
  const effectiveDemoConfig = publicDemoConfig || {
    botId: (demoConfig as any)?.botId || "00000000-0000-0000-0000-000000000001",
    botName: "NeuralDesk Assistant",
    greeting:
      "Hi! I'm NeuralDesk's demo assistant. Ask me anything about NeuralDesk - how it works, pricing, features, or embedding.",
    accentColor: demoColor,
  };
  const htmlSnippet = `<script src="${WS_BASE}/widget.js?botId=${effectiveDemoConfig.botId}" defer></script>`;
  const installSnippets: Record<"html" | "wordpress" | "shopify" | "webflow", string> = {
    html: htmlSnippet,
    wordpress: `<!-- In WordPress: Appearance > Theme File Editor > footer.php -->\n${htmlSnippet}`,
    shopify: `{% comment %} In Shopify: Online Store > Themes > Edit code > theme.liquid {% endcomment %}\n${htmlSnippet}`,
    webflow: `<!-- Webflow: Project Settings > Custom Code > Footer -->\n${htmlSnippet}`,
  };

  const scrollToDemo = () =>
    document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" });
  const copySnippet = async () => {
    await navigator.clipboard.writeText(installSnippets[installTab]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="relative min-h-screen bg-obsidian-950 text-white selection:bg-coral-400/30 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] lg:min-h-screen py-24 sm:py-32 flex items-center justify-center overflow-hidden">
        <NeuralMesh />
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto mt-8 sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm max-w-full">
              <span className="w-2 h-2 rounded-full bg-coral-400 animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs font-medium text-white/80 uppercase tracking-wider truncate">Enterprise-Grade RAG is Here</span>
            </div>
            
            <div 
              className="min-h-[110px] sm:min-h-[140px] md:min-h-[170px] lg:min-h-[200px] flex items-center justify-center mb-6 sm:mb-8"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`headline-${headlineIndex}`}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={{
                    initial: {},
                    animate: {
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.05,
                      },
                    },
                    exit: {
                      transition: {
                        staggerChildren: 0.03,
                        staggerDirection: -1,
                      },
                    },
                  }}
                  className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-[1.15] tracking-tight break-words"
                >
                  {currentWords.map((word: string, i: number) => {
                    // Highlight the last 3 words or last 2 words with glowing shimmer gradient
                    const highlightCount = currentWords.length > 5 ? 3 : 2;
                    const isHighlighted = i >= currentWords.length - highlightCount;
                    return (
                      <motion.span
                        key={`word-${headlineIndex}-${i}-${word}`}
                        variants={{
                          initial: {
                            opacity: 0,
                            y: 22,
                            filter: "blur(8px)",
                          },
                          animate: {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: {
                              duration: 0.55,
                              ease: [0.16, 1, 0.3, 1],
                            },
                          },
                          exit: {
                            opacity: 0,
                            y: -18,
                            filter: "blur(6px)",
                            transition: {
                              duration: 0.35,
                              ease: [0.4, 0, 0.2, 1],
                            },
                          },
                        }}
                        className="inline-block mr-[0.2em] last:mr-0"
                      >
                        {isHighlighted ? (
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 via-blush-400 to-coral-400 animate-shimmer bg-[length:200%_auto]">
                            {word}
                          </span>
                        ) : (
                          word
                        )}
                      </motion.span>
                    );
                  })}
                </motion.h1>
              </AnimatePresence>
            </div>
            
            <motion.p 
              key={subheadline}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-white/60 mb-8 sm:mb-10 max-w-2xl mx-auto font-light leading-relaxed px-2"
            >
              {subheadline}
            </motion.p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto sm:max-w-none">
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 sm:px-10 h-12 sm:h-14 text-base sm:text-lg justify-center shadow-[0_0_25px_rgba(245,143,124,0.35)]">
                  {cms?.["hero.cta_primary"] || "Get Started for Free"}
                </Button>
              </Link>
              <button onClick={scrollToDemo} className="w-full sm:w-auto">
                <Button variant="glass" size="lg" className="w-full sm:w-auto px-8 sm:px-10 h-12 sm:h-14 text-base sm:text-lg group justify-center">
                  {cms?.["hero.cta_secondary"] || "Live Demo"}
                </Button>
              </button>
            </div>
            <motion.button
              onClick={scrollToDemo}
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mx-auto mt-8 text-white/40 hover:text-white/70 transition-colors p-2"
              aria-label="Scroll to demo section"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>

        <motion.div 
          className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/30 flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 relative z-10 bg-obsidian-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold mb-4 sm:mb-6">Built for Scale</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-xl px-2">
              Powerful tools to transform your business data into conversational intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: "Gemini 1.5 Pro", desc: "Powered by Google's latest model for unprecedented reasoning and speed.", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "text-coral-400" },
              { title: "Smart Ingestion", desc: "Upload PDFs, CSVs, or crawl entire domains with our advanced RAG pipeline.", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12", color: "text-blush-400" },
              { title: "Vector Search", desc: "Built-in pgvector support for ultra-accurate context retrieval.", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "text-emerald-400" },
              { title: "3D Analytics", desc: "Visualize bot performance with interactive, high-fidelity data scenes.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "text-orange-400" },
              { title: "Global Widget", desc: "Zero-config glassmorphic chat widget that works on any website.", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-pink-400" },
              { title: "Multi-Tenant", desc: "Enterprise-ready isolation ensuring your data remains yours and yours alone.", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", color: "text-yellow-400" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card hoverEffect className="p-6 sm:p-8 h-full bg-white/[0.02] border-white/5 relative overflow-hidden group">
                  <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 sm:mb-8 ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="w-6 sm:w-7 h-6 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold mb-3 sm:mb-4 text-white group-hover:text-coral-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-white/50 leading-relaxed text-sm sm:text-base">
                    {f.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Embed & Live Demo Section */}
      {showDemo && (
        <section id="demo-section" ref={demoRef} className="py-20 sm:py-28 px-4 sm:px-6 relative z-10 bg-obsidian-950/60">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-semibold mb-4 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero-Friction Integration</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold mb-3 sm:mb-4">{demoHeadline}</h2>
              <p className="text-white/60 max-w-2xl mx-auto text-base sm:text-lg px-2">{demoSubheadline}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Live Mockup SaaS Preview */}
              <div className="lg:col-span-7 flex flex-col">
                <MockWebsite
                  botId={effectiveDemoConfig.botId}
                  botName={effectiveDemoConfig.botName}
                  greeting={effectiveDemoConfig.greeting}
                  accentColor={effectiveDemoConfig.accentColor}
                  companyName={companyName}
                  suggestedQuestions={suggestedQuestions}
                  autoOpen={autoOpenDemo}
                />
              </div>

              {/* Right Column: High-End Developer & Embed Experience */}
              <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-gradient-to-b from-[#1E1D22]/90 via-[#17161A]/90 to-[#141316]/90 p-6 sm:p-7 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-coral-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div>
                  {/* Panel Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-coral-500/15 border border-coral-500/30 text-coral-400 text-[11px] font-bold uppercase tracking-wider">
                      1-Click Embed
                    </span>
                    <span className="text-xs text-white/40 font-mono flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-coral-400" />
                      &lt; 30s setup
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-white mb-2">
                    Universal Integration
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6">
                    Paste a single asynchronous script tag into any website, CMS, or framework. Instant connection, zero build steps.
                  </p>

                  {/* Platform Selector Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                    {[
                      { id: "html", label: "HTML / JS" },
                      { id: "wordpress", label: "WordPress" },
                      { id: "shopify", label: "Shopify" },
                      { id: "webflow", label: "Webflow" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setInstallTab(tab.id as any)}
                        className={`rounded-xl px-2.5 py-2 text-xs font-semibold tracking-wide transition-all border ${
                          installTab === tab.id
                            ? "bg-coral-500/20 text-coral-300 border-coral-400/50 shadow-sm shadow-coral-500/20"
                            : "bg-white/[0.04] text-white/50 border-white/10 hover:bg-white/[0.08] hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 3-Step Setup Stepper */}
                  <div className="space-y-2.5 mb-5 bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-coral-500/20 border border-coral-400/40 text-coral-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-white">Connect Knowledge:</span>{" "}
                        <span className="text-white/60">Upload documents, PDFs, or enter website URLs.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-coral-500/20 border border-coral-400/40 text-coral-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-white">Customize Persona:</span>{" "}
                        <span className="text-white/60">Match brand colors, greeting message, and tone.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-coral-500/20 border border-coral-400/40 text-coral-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-white">Copy & Deploy:</span>{" "}
                        <span className="text-white/60">Add the snippet to your page header or footer.</span>
                      </div>
                    </div>
                  </div>

                  {/* High-End Terminal Code Snippet */}
                  <div className="rounded-2xl border border-white/15 bg-[#121114] overflow-hidden shadow-inner">
                    <div className="px-4 py-2.5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-coral-400" />
                        <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
                          {installTab === "html"
                            ? "index.html"
                            : installTab === "wordpress"
                            ? "footer.php"
                            : installTab === "shopify"
                            ? "theme.liquid"
                            : "custom_code.html"}
                        </span>
                      </div>
                      <button
                        onClick={copySnippet}
                        className="px-2.5 py-1 rounded-lg bg-coral-500/10 hover:bg-coral-500/20 border border-coral-400/30 text-coral-300 text-xs flex items-center gap-1.5 font-medium transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs leading-relaxed max-w-full font-mono">
                      <code>
                        <span className="text-blush-400">&lt;script</span>{" "}
                        <span className="text-coral-400">src</span>=<span className="text-emerald-400">"{`${WS_BASE}/widget.js?botId=${effectiveDemoConfig.botId}`}"</span>{" "}
                        <span className="text-coral-400">defer</span>
                        <span className="text-blush-400">&gt;&lt;/script&gt;</span>
                      </code>
                    </pre>
                  </div>

                  {/* Architecture Badges */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-white/50 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>&lt; 12KB Gzipped</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
                      <span>Non-blocking Async</span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Block */}
                <div className="mt-7 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold text-sm">Ready to build yours?</p>
                    <p className="text-white/40 text-xs">Free forever on Starter plan</p>
                  </div>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full sm:w-auto px-6 shadow-md shadow-coral-500/20">
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold mb-6 sm:mb-8">Simple Pricing</h2>
            
            <div className="inline-flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
              <button 
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-coral-500 text-white shadow-lg shadow-coral-500/20" : "text-white/50 hover:text-white"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle("annual")}
                className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${billingCycle === "annual" ? "bg-coral-500 text-white shadow-lg shadow-coral-500/20" : "text-white/50 hover:text-white"}`}
              >
                Annual <span className="text-[10px] ml-1 text-coral-200">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {(plans || []).map((tier: any, i: number) => (
              <motion.div
                key={tier.id}
                whileHover={{ y: -10 }}
                className={`relative p-8 rounded-3xl border ${tier.isPopular ? 'bg-white/[0.03] border-coral-500/50 shadow-[0_0_40px_rgba(245,143,124,0.2)]' : 'bg-white/[0.01] border-white/5'}`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-coral-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-heading font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-heading font-bold">${billingCycle === "annual" ? tier.priceAnnual / 12 : tier.priceMonthly}</span>
                  <span className="text-white/50 text-sm">/mo</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {tier.features.map((f: string, j: number) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-white/70">
                      <svg className="w-5 h-5 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-sm text-coral-400 font-bold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Up to {tier.maxBots} bots
                  </li>
                </ul>
                <Link href="/register">
                  <Button variant={tier.isPopular ? "primary" : "glass"} className="w-full h-12">
                    {tier.priceMonthly === 0 ? "Get Started" : "Select Plan"}
                  </Button>
                </Link>
              </motion.div>
            ))}
            
            {(!plans || plans.length === 0) && (
              <div className="col-span-3 text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-white/40 italic">Loading dynamic pricing plans...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-obsidian-950 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6">
                <Logo size="md" />
              </div>
              <p className="text-white/40 max-w-sm text-sm leading-relaxed">
                Empowering businesses with beautiful, intelligent, and context-aware AI assistants. 
                Built for the modern web with a focus on aesthetics and performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-heading font-bold mb-6 uppercase text-xs tracking-widest text-white/80">Platform</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><Link href="#features" className="hover:text-coral-400 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-coral-400 transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-coral-400 transition-colors">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-coral-400 transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-bold mb-6 uppercase text-xs tracking-widest text-white/80">Company</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><Link href="/about" className="hover:text-coral-400 transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-coral-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-coral-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-coral-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/20 text-xs">© {new Date().getFullYear()} NeuralDesk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
