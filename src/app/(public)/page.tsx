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
import { Check, ChevronDown, Copy } from "lucide-react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/+$/, "")}/public/demo-config`)
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

  if (!mounted) return null;

  const headline = cms?.["hero.headline"] || "Next-Gen AI Support Without The Complexity";
  const subheadline = cms?.["hero.subheadline"] || "Automate customer engagement with AI assistants trained on your unique business knowledge. Deploy a premium, glassmorphic chat experience in seconds.";
  const demoHeadline = cms?.["demo.section.headline"] || "See NeuralDesk in Action";
  const demoSubheadline = cms?.["demo.section.subheadline"] || "Chat with our demo bot right now.";
  const companyName = cms?.["demo.section.company_name"] || "Acme Corp";
  const demoColor = cms?.["demo.section.primary_color"] || "#00d4ff";
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
  const words = headline.split(" ");
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
    <div className="relative min-h-screen bg-obsidian-950 text-white selection:bg-cyan-500/30 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <NeuralMesh />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Enterprise-Grade RAG is Here</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-heading font-bold leading-tight mb-8 tracking-tight">
              {words.map((word: string, i: number) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="inline-block mr-[0.2em] last:mr-0"
                >
                  {i > words.length - 3 ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 animate-shimmer bg-[length:200%_auto]">
                      {word}
                    </span>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              {subheadline}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg" className="px-10 h-14 text-lg">
                  {cms?.["hero.cta_primary"] || "Get Started for Free"}
                </Button>
              </Link>
              <button onClick={scrollToDemo}>
                <Button variant="glass" size="lg" className="px-10 h-14 text-lg group">
                  {cms?.["hero.cta_secondary"] || "Live Demo"}
                </Button>
              </button>
            </div>
            <motion.button
              onClick={scrollToDemo}
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mx-auto mt-8 text-white/40 hover:text-white/70 transition-colors"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/30 flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative z-10 bg-obsidian-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6">Built for Scale</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-xl">
              Powerful tools to transform your business data into conversational intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: "Gemini 1.5 Pro", desc: "Powered by Google's latest model for unprecedented reasoning and speed.", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "text-cyan-400" },
              { title: "Smart Ingestion", desc: "Upload PDFs, CSVs, or crawl entire domains with our advanced RAG pipeline.", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12", color: "text-violet-400" },
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
                transition={{ delay: i * 0.1 }}
              >
                <Card hoverEffect className="h-full bg-white/[0.01] border-white/5 p-8">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-6 ${f.color}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-3">{f.title}</h3>
                  <p className="text-white/50 leading-relaxed text-sm">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {showDemo && (
        <section id="demo-section" ref={demoRef} className="py-24 px-6 bg-obsidian-950">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-7xl mx-auto space-y-10"
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-heading font-bold">{demoHeadline}</h2>
              <p className="mt-4 text-white/50 text-lg">{demoSubheadline}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MockWebsite
                botId={effectiveDemoConfig.botId}
                botName={effectiveDemoConfig.botName}
                greeting={effectiveDemoConfig.greeting}
                accentColor={effectiveDemoConfig.accentColor || demoColor}
                companyName={companyName}
                suggestedQuestions={suggestedQuestions}
                autoOpen={autoOpenDemo}
              />

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                <h3 className="text-2xl font-heading font-bold text-white">How to embed</h3>
                <div className="mt-4 inline-flex p-1 rounded-xl bg-white/5 border border-white/10">
                  {(["html", "wordpress", "shopify", "webflow"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setInstallTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest transition ${
                        installTab === tab ? "bg-cyan-500 text-white" : "text-white/50 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <p className="text-white/80 flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Step 1: Create your bot</p>
                  <p className="text-white/80 flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Step 2: Train it with your content</p>
                  <p className="text-white/80 flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400" /> Step 3: Copy this code</p>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-[#080810] overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest text-white/40">Install snippet</span>
                    <button onClick={copySnippet} className="text-cyan-400 text-xs flex items-center gap-1">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                    <code>
                      <span className="text-violet-400">&lt;script</span>{" "}
                      <span className="text-cyan-400">src</span>=<span className="text-emerald-400">"{`${WS_BASE}/widget.js?botId=${effectiveDemoConfig.botId}`}"</span>{" "}
                      <span className="text-cyan-400">defer</span>
                      <span className="text-violet-400">&gt;&lt;/script&gt;</span>
                    </code>
                  </pre>
                </div>

                <p className="mt-4 text-cyan-300 text-sm">That is what you get: a live chatbot on your site.</p>
                <div className="mt-8">
                  <p className="text-white font-medium mb-3">Ready to build yours?</p>
                  <Link href="/register">
                    <Button variant="primary">Get Started Free</Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8">Simple Pricing</h2>
            
            <div className="inline-flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
              <button 
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-white/50 hover:text-white"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === "annual" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-white/50 hover:text-white"}`}
              >
                Annual <span className="text-[10px] ml-1 text-cyan-200">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(plans || []).map((tier: any, i: number) => (
              <motion.div
                key={tier.id}
                whileHover={{ y: -10 }}
                className={`relative p-8 rounded-3xl border ${tier.isPopular ? 'bg-white/[0.03] border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.1)]' : 'bg-white/[0.01] border-white/5'}`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
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
                      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-sm text-cyan-400 font-bold">
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
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-2xl font-heading font-bold tracking-wide">NeuralDesk</span>
              </div>
              <p className="text-white/40 max-w-sm text-sm leading-relaxed">
                Empowering businesses with beautiful, intelligent, and context-aware AI assistants. 
                Built for the modern web with a focus on aesthetics and performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-heading font-bold mb-6 uppercase text-xs tracking-widest text-white/80">Platform</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><Link href="#features" className="hover:text-cyan-400 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-cyan-400 transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-bold mb-6 uppercase text-xs tracking-widest text-white/80">Company</h4>
              <ul className="space-y-4 text-sm text-white/40">
                <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
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
