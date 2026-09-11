"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  FileText,
  FileCode,
  Upload,
  Link as LinkIcon,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ExternalLink,
  Layers,
  ChevronDown,
  Info,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";
import {
  KnowledgeSource,
  useUploadFile,
  useIngestUrl,
  useIngestText,
  useDeleteSource,
} from "@/lib/hooks/useKnowledge";
import { WS_BASE } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn, formatDate, safeFormatDistanceToNow } from "@/lib/utils";
import toast from "react-hot-toast";

export interface KnowledgeProgressData {
  sourceId?: string;
  botId: string;
  stage: "crawling" | "embedding" | "completed" | "error";
  message: string;
  crawled?: number;
  total?: number;
  currentUrl?: string;
}

const MAX_PAGES_OPTIONS = [
  { value: 5, label: "5 pages", description: "Quick scan / Key pages" },
  { value: 10, label: "10 pages", description: "Standard section" },
  { value: 20, label: "20 pages (Recommended)", description: "Deep documentation" },
  { value: 50, label: "50 pages (Full Site)", description: "Complete site indexing" },
];

const CRAWL_DEPTH_OPTIONS = [
  { value: 1, label: "Level 1", description: "Direct links only" },
  { value: 2, label: "Level 2 (Recommended)", description: "Subdirectories & Sections" },
  { value: 3, label: "Level 3", description: "Deep site structure" },
];

export function KnowledgeTab({
  botId,
  sources = [],
  isLoading = false,
}: {
  botId: string;
  sources: KnowledgeSource[];
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const [ingestMode, setIngestMode] = useState<"file" | "url" | "text" | null>(null);

  // URL Ingestion Form State
  const [url, setUrl] = useState("");
  const [crawlSubpages, setCrawlSubpages] = useState(true);
  const [maxPages, setMaxPages] = useState<number>(20);
  const [crawlDepth, setCrawlDepth] = useState<number>(2);

  // Text Ingestion State
  const [textData, setTextData] = useState({ name: "", text: "" });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  // Real-time Crawling / Embedding Progress State
  const [activeProgress, setActiveProgress] = useState<KnowledgeProgressData | null>(null);
  const [isCompletedBanner, setIsCompletedBanner] = useState(false);
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);

  const uploadFile = useUploadFile(botId);
  const ingestUrl = useIngestUrl(botId);
  const ingestText = useIngestText(botId);
  const deleteSource = useDeleteSource(botId);

  const socketRef = useRef<Socket | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Socket.IO Real-Time Progress & Status Listener
  useEffect(() => {
    const token = getAccessToken();
    const socket = io(WS_BASE, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (token) {
        socket.emit("dashboard:join", { agentToken: token });
      }
    });

    // Listen to real-time progress events from backend crawler
    socket.on("knowledge:progress", (data: KnowledgeProgressData) => {
      if (data && data.botId === botId) {
        setActiveProgress(data);
        setIsCompletedBanner(false);

        if (progressTimeoutRef.current) {
          clearTimeout(progressTimeoutRef.current);
        }
      }
    });

    // Listen to knowledge source final status
    socket.on(
      "knowledge:status",
      (data: { sourceId: string; botId: string; status: string; chunkCount: number }) => {
        if (data.botId === botId) {
          queryClient.invalidateQueries({ queryKey: ["knowledge", botId] });

          if (data.status === "ready") {
            setIsCompletedBanner(true);
            setActiveProgress((prev) =>
              prev
                ? {
                    ...prev,
                    stage: "completed",
                    message: "Knowledge source processed and indexed successfully!",
                  }
                : null
            );
            toast.success("Knowledge source processed successfully!");

            // Auto-hide progress card after 6 seconds
            progressTimeoutRef.current = setTimeout(() => {
              setActiveProgress(null);
              setIsCompletedBanner(false);
            }, 6000);
          } else if (data.status === "failed") {
            setActiveProgress((prev) =>
              prev
                ? {
                    ...prev,
                    stage: "error",
                    message: "Knowledge processing failed. Please check the URL or file.",
                  }
                : null
            );
            toast.error("Knowledge source processing failed.");
          }
        }
      }
    );

    return () => {
      if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
      socket.disconnect();
    };
  }, [botId, queryClient]);

  // 2. Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile.mutate(file, {
        onSuccess: () => {
          setIngestMode(null);
        },
      });
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error("Please enter a valid website URL");
      return;
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      trimmedUrl = "https://" + trimmedUrl;
    }

    ingestUrl.mutate(
      {
        url: trimmedUrl,
        crawlSubpages,
        maxPages: crawlSubpages ? maxPages : 1,
        crawlDepth: crawlSubpages ? crawlDepth : 1,
      },
      {
        onSuccess: () => {
          setUrl("");
          setIngestMode(null);
          // Set initial optimistic progress
          setActiveProgress({
            botId,
            stage: "crawling",
            message: `Starting deep crawl for ${trimmedUrl}...`,
            crawled: 0,
            total: crawlSubpages ? maxPages : 1,
            currentUrl: trimmedUrl,
          });
        },
      }
    );
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textData.name.trim() || !textData.text.trim()) {
      toast.error("Please provide both a title and content");
      return;
    }
    ingestText.mutate(textData, {
      onSuccess: () => {
        setTextData({ name: "", text: "" });
        setIngestMode(null);
      },
    });
  };

  const handleDelete = (sourceId: string) => {
    deleteSource.mutate(sourceId, {
      onSuccess: () => {
        setDeletingSourceId(null);
      },
    });
  };

  // 3. Filtered Sources
  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      const matchesSearch =
        source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedTypeFilter === "all" || source.type === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [sources, searchQuery, selectedTypeFilter]);

  // Calculate Progress Percentages
  const progressPercent = useMemo(() => {
    if (!activeProgress) return 0;
    if (activeProgress.stage === "completed") return 100;
    if (activeProgress.crawled && activeProgress.total && activeProgress.total > 0) {
      return Math.min(
        100,
        Math.max(5, Math.round((activeProgress.crawled / activeProgress.total) * 100))
      );
    }
    return activeProgress.stage === "embedding" ? 75 : 30;
  }, [activeProgress]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Header & Action Buttons ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white flex items-center gap-2.5">
            <span>Knowledge Base</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-mono font-medium">
              {sources.length} {sources.length === 1 ? "source" : "sources"}
            </span>
          </h2>
          <p className="text-white/40 text-xs sm:text-sm mt-1">
            Feed your AI assistant with documentation, websites, PDFs, or FAQs for precise RAG responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setIngestMode(ingestMode === "url" ? null : "url")}
            className={cn(
              "gap-2 border-white/10 transition-all",
              ingestMode === "url" && "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
            )}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Add Website / Docs</span>
          </Button>

          <Button
            variant="glass"
            size="sm"
            onClick={() => setIngestMode(ingestMode === "file" ? null : "file")}
            className={cn(
              "gap-2 border-white/10 transition-all",
              ingestMode === "file" && "border-violet-500/50 bg-violet-500/10 text-violet-300"
            )}
          >
            <Upload className="w-4 h-4 text-violet-400" />
            <span>Upload Document</span>
          </Button>

          <Button
            variant="glass"
            size="sm"
            onClick={() => setIngestMode(ingestMode === "text" ? null : "text")}
            className={cn(
              "gap-2 border-white/10 transition-all",
              ingestMode === "text" && "border-coral-500/50 bg-coral-500/10 text-coral-300"
            )}
          >
            <FileText className="w-4 h-4 text-coral-400" />
            <span>Paste Text</span>
          </Button>
        </div>
      </div>

      {/* ── Real-Time Crawling / Ingestion Progress Card ────────────── */}
      <AnimatePresence>
        {activeProgress && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "p-5 sm:p-6 rounded-2xl border backdrop-blur-xl transition-all shadow-xl relative overflow-hidden",
                activeProgress.stage === "completed"
                  ? "bg-emerald-950/40 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                  : activeProgress.stage === "error"
                  ? "bg-rose-950/40 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.15)]"
                  : activeProgress.stage === "embedding"
                  ? "bg-[#1B1627]/90 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                  : "bg-[#101A24]/90 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
              )}
            >
              {/* Subtle Ambient Background Light */}
              <div
                className={cn(
                  "absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl pointer-events-none opacity-20 -mr-20 -mt-20",
                  activeProgress.stage === "completed"
                    ? "bg-emerald-400"
                    : activeProgress.stage === "embedding"
                    ? "bg-purple-500"
                    : "bg-cyan-400"
                )}
              />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border",
                      activeProgress.stage === "completed"
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : activeProgress.stage === "error"
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                        : activeProgress.stage === "embedding"
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                        : "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                    )}
                  >
                    {activeProgress.stage === "completed" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : activeProgress.stage === "error" ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : activeProgress.stage === "embedding" ? (
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Globe className="w-5 h-5 animate-spin-slow" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          activeProgress.stage === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : activeProgress.stage === "error"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : activeProgress.stage === "embedding"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse"
                        )}
                      >
                        {activeProgress.stage === "completed"
                          ? "Indexed Successfully"
                          : activeProgress.stage === "error"
                          ? "Processing Error"
                          : activeProgress.stage === "embedding"
                          ? "⚡ Generating Embeddings"
                          : "🕷️ Deep Crawling Website"}
                      </span>

                      {activeProgress.crawled !== undefined && activeProgress.total !== undefined && (
                        <span className="text-xs font-mono text-white/70">
                          {activeProgress.crawled} / {activeProgress.total} pages
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-white mt-1">
                      {activeProgress.message || "Processing knowledge source..."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveProgress(null)}
                  className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                  title="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 relative z-10">
                <div className="flex items-center justify-between text-[11px] text-white/50 mb-1.5 font-mono">
                  <span>
                    {activeProgress.stage === "completed"
                      ? "100% Completed"
                      : `${progressPercent}% in progress`}
                  </span>
                  {activeProgress.currentUrl && (
                    <span
                      className="max-w-[320px] truncate text-cyan-300/80 hover:text-cyan-200 flex items-center gap-1"
                      title={activeProgress.currentUrl}
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {activeProgress.currentUrl}
                    </span>
                  )}
                </div>

                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden relative">
                  <motion.div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      activeProgress.stage === "completed"
                        ? "bg-emerald-500"
                        : activeProgress.stage === "error"
                        ? "bg-rose-500"
                        : activeProgress.stage === "embedding"
                        ? "bg-gradient-to-r from-purple-500 to-coral-400"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500"
                    )}
                    style={{ width: `${progressPercent}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ingestion Form Modals / Panels ──────────────────────────── */}
      <AnimatePresence>
        {ingestMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card className="p-5 sm:p-7 bg-[#17161B]/95 border-white/10 shadow-2xl relative">
              {/* Header of Form */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      ingestMode === "url" && "bg-cyan-500/20 text-cyan-400",
                      ingestMode === "file" && "bg-violet-500/20 text-violet-400",
                      ingestMode === "text" && "bg-coral-500/20 text-coral-400"
                    )}
                  >
                    {ingestMode === "url" && <Globe className="w-4 h-4" />}
                    {ingestMode === "file" && <Upload className="w-4 h-4" />}
                    {ingestMode === "text" && <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-base">
                      {ingestMode === "url" && "Add Knowledge via Website & Docs"}
                      {ingestMode === "file" && "Upload Knowledge Document"}
                      {ingestMode === "text" && "Manual Knowledge Text Entry"}
                    </h3>
                    <p className="text-white/40 text-xs">
                      {ingestMode === "url" &&
                        "Deep crawl web pages, extract content, and generate vector embeddings."}
                      {ingestMode === "file" &&
                        "Upload PDF, DOCX, or TXT documents (up to 10MB)."}
                      {ingestMode === "text" &&
                        "Paste raw policies, custom instructions, or FAQ notes directly."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIngestMode(null)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ── Mode 1: URL & Deep Crawling ─────────────────────────── */}
              {ingestMode === "url" && (
                <form onSubmit={handleUrlSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                      Documentation or Website URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/docs or https://docs.yourcompany.com"
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/25 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {/* Toggle Switch: Deep Crawling */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Crawl Subpages & Documentation
                          </p>
                          <p className="text-xs text-white/40">
                            Automatically follows internal links within this domain to index all guides and pages.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={crawlSubpages}
                        onClick={() => setCrawlSubpages(!crawlSubpages)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          crawlSubpages ? "bg-cyan-500" : "bg-white/10"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                            crawlSubpages ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    {/* Subpage Crawl Controls (When Toggle Enabled) */}
                    <AnimatePresence>
                      {crawlSubpages && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 border-t border-white/10 space-y-4 overflow-hidden"
                        >
                          {/* Max Pages Selector */}
                          <div>
                            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                              Max Pages to Crawl
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                              {MAX_PAGES_OPTIONS.map((opt) => {
                                const isSelected = maxPages === opt.value;
                                return (
                                  <div
                                    key={opt.value}
                                    onClick={() => setMaxPages(opt.value)}
                                    className={cn(
                                      "p-3 rounded-xl border cursor-pointer transition-all text-left select-none",
                                      isSelected
                                        ? "bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                        : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                                    )}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span
                                        className={cn(
                                          "text-xs font-bold",
                                          isSelected ? "text-cyan-300" : "text-white"
                                        )}
                                      >
                                        {opt.label}
                                      </span>
                                      {isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                                      )}
                                    </div>
                                    <p className="text-[10px] text-white/40 leading-relaxed">
                                      {opt.description}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Crawl Depth Selector */}
                          <div>
                            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                              Crawl Depth
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              {CRAWL_DEPTH_OPTIONS.map((opt) => {
                                const isSelected = crawlDepth === opt.value;
                                return (
                                  <div
                                    key={opt.value}
                                    onClick={() => setCrawlDepth(opt.value)}
                                    className={cn(
                                      "p-2.5 rounded-xl border cursor-pointer transition-all text-left select-none",
                                      isSelected
                                        ? "bg-cyan-500/15 border-cyan-500/50"
                                        : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={cn(
                                          "text-xs font-bold",
                                          isSelected ? "text-cyan-300" : "text-white"
                                        )}
                                      >
                                        {opt.label}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-white/40 mt-0.5">
                                      {opt.description}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Helpful Info Alert */}
                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300/90 text-xs">
                            <Info className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                            <span>
                              The crawler respects <code className="text-cyan-200">robots.txt</code>, strips boilerplate navigation/footers, and streams real-time progress via WebSocket.
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="glass"
                      onClick={() => setIngestMode(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={ingestUrl.isPending}
                      className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-none shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{crawlSubpages ? `Crawl up to ${maxPages} Pages` : "Ingest Single Page"}</span>
                    </Button>
                  </div>
                </form>
              )}

              {/* ── Mode 2: File Upload ──────────────────────────────────── */}
              {ingestMode === "file" && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 sm:p-12 text-center hover:border-violet-500/50 hover:bg-violet-500/[0.02] transition-all relative group cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept=".pdf,.docx,.txt"
                      disabled={uploadFile.isPending}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      {uploadFile.isPending ? (
                        <Loader2 className="w-7 h-7 animate-spin text-violet-400" />
                      ) : (
                        <Upload className="w-7 h-7 text-violet-400" />
                      )}
                    </div>
                    <p className="text-white font-medium text-base mb-1">
                      {uploadFile.isPending
                        ? "Uploading & processing document..."
                        : "Click or drag document to upload"}
                    </p>
                    <p className="text-white/40 text-xs">
                      Supports PDF, DOCX, or TXT files up to 10MB
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="glass"
                      onClick={() => setIngestMode(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Mode 3: Manual Text Entry ───────────────────────────── */}
              {ingestMode === "text" && (
                <form onSubmit={handleTextSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                      Source Title / Category
                    </label>
                    <input
                      type="text"
                      value={textData.name}
                      onChange={(e) =>
                        setTextData({ ...textData, name: e.target.value })
                      }
                      placeholder="e.g., Return Policy 2026, Pricing FAQ, VIP Support Guidelines"
                      required
                      className="w-full h-11 px-4 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/25 focus:border-coral-500/60 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                      Knowledge Content
                    </label>
                    <textarea
                      value={textData.text}
                      onChange={(e) =>
                        setTextData({ ...textData, text: e.target.value })
                      }
                      placeholder="Paste your text content, product specifications, or troubleshooting steps here..."
                      required
                      rows={6}
                      className="w-full p-4 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/25 focus:border-coral-500/60 transition-colors text-sm resize-none custom-scrollbar"
                    />
                    <div className="flex justify-between items-center text-[10px] text-white/30 mt-1">
                      <span>Plaintext or Markdown supported</span>
                      <span>{textData.text.length} characters</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="glass"
                      onClick={() => setIngestMode(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={ingestText.isPending}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Process & Vectorize Text</span>
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Knowledge Sources List & Search ─────────────────────────── */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge sources..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-coral-500/40 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
            {["all", "url", "pdf", "docx", "text"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedTypeFilter(type)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all",
                  selectedTypeFilter === type
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                {type === "all" ? "All Types" : type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {filteredSources.length > 0 ? (
            filteredSources.map((source) => {
              const isUrl = source.type === "url";
              const isDoc = source.type === "pdf" || source.type === "docx";

              return (
                <Card
                  key={source.id}
                  className="p-4 sm:p-5 bg-white/[0.02] hover:bg-white/[0.04] border-white/5 hover:border-white/10 flex items-center justify-between gap-4 group transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-inner",
                        isUrl
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                          : isDoc
                          ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                          : "bg-coral-500/10 border-coral-500/30 text-coral-400"
                      )}
                    >
                      {isUrl ? (
                        <Globe className="w-5 h-5" />
                      ) : isDoc ? (
                        <FileCode className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold text-sm sm:text-base truncate">
                          {source.name}
                        </h4>
                        {isUrl && (
                          <a
                            href={source.name.startsWith("http") ? source.name : `https://${source.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/30 hover:text-cyan-400 transition-colors shrink-0"
                            title="Open URL in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 mt-1.5 flex-wrap text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/50 uppercase font-mono font-bold text-[10px]">
                          {source.type}
                        </span>

                        <span className="text-white/20">•</span>

                        <span
                          className={cn(
                            "font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5",
                            source.status === "ready"
                              ? "text-emerald-400"
                              : source.status === "failed"
                              ? "text-rose-400"
                              : "text-cyan-400 animate-pulse"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              source.status === "ready"
                                ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                                : source.status === "failed"
                                ? "bg-rose-400 shadow-[0_0_6px_#fb7185]"
                                : "bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-ping"
                            )}
                          />
                          {source.status === "ready"
                            ? "Indexed & Ready"
                            : source.status === "failed"
                            ? "Failed"
                            : "Processing..."}
                        </span>

                        {source.status === "ready" && (
                          <>
                            <span className="text-white/20">•</span>
                            <span className="text-white/50 flex items-center gap-1 font-mono">
                              <Sparkles className="w-3 h-3 text-coral-400" />
                              {source.chunkCount || 0} chunks
                            </span>
                          </>
                        )}

                        {source.createdAt && (
                          <>
                            <span className="text-white/20 hidden sm:inline">•</span>
                            <span className="text-white/30 hidden sm:inline">
                              {safeFormatDistanceToNow(source.createdAt, {
                                addSuffix: true,
                              })}
                            </span>
                          </>
                        )}
                      </div>

                      {source.status === "failed" && source.errorMessage && (
                        <p className="text-[11px] text-rose-400/80 mt-1 truncate max-w-md">
                          Error: {source.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDeletingSourceId(source.id)}
                      className="p-2 rounded-xl bg-white/[0.02] hover:bg-rose-500/10 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                      title="Delete knowledge source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-white/20">
                <Globe className="w-6 h-6" />
              </div>
              <p className="text-white/40 text-sm font-medium">
                {searchQuery || selectedTypeFilter !== "all"
                  ? "No matching knowledge sources found."
                  : "No knowledge sources added yet."}
              </p>
              <p className="text-white/20 text-xs mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "Try changing your search keywords or clearing filters."
                  : "Connect your website docs or upload PDFs so the bot can answer queries with accurate context."}
              </p>
              {!searchQuery && selectedTypeFilter === "all" && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setIngestMode("url")}
                    className="gap-2 text-xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Crawl Website</span>
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setIngestMode("file")}
                    className="gap-2 text-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-violet-400" />
                    <span>Upload Document</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ───────────────────────────────── */}
      <AnimatePresence>
        {deletingSourceId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#19181D] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Delete Knowledge Source?</h3>
              </div>
              <p className="text-sm text-white/60">
                Are you sure you want to remove this knowledge source? All generated vector chunks and embeddings will be permanently purged from the database.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="glass"
                  onClick={() => setDeletingSourceId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(deletingSourceId)}
                  isLoading={deleteSource.isPending}
                  className="bg-rose-500 hover:bg-rose-600 border-none text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                >
                  Confirm Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default KnowledgeTab;
