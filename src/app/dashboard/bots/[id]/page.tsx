"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useBot, useUpdateBot } from "@/lib/hooks/useBots";
import { useKnowledge, useUploadFile, useIngestUrl, useIngestText, useDeleteSource } from "@/lib/hooks/useKnowledge";
import { WS_BASE } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/auth";

import { 
  DocumentIcon, 
  LinkIcon, 
  PencilIcon, 
  TrashIcon,
  CloudArrowUpIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import { LiveChat } from "@/components/chat/LiveChat";
import toast from "react-hot-toast";
import ConversationsTab from '@/components/bots/ConversationsTab';
import LeadsTab from '@/components/bots/LeadsTab';
import { UsersIcon } from "@heroicons/react/24/outline";

type Tab = "overview" | "conversations" | "leads" | "knowledge" | "embed" | "settings" | "demo";

export default function BotDetailsPage() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  
  const { data: bot, isLoading: botLoading } = useBot(id);
  const { data: sources, isLoading: sourcesLoading } = useKnowledge(id);
  const updateBot = useUpdateBot(id);

  if (botLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/5 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-white/5 rounded" />
            <div className="h-4 w-32 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-10 w-full bg-white/5 rounded-lg" />
        <div className="h-96 w-full bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (!bot) return <div className="text-white">Bot not found.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl"
            style={{ backgroundColor: bot.accentColor }}
          >
            {bot.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-heading font-bold text-white">{bot.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${bot.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {bot.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-white/40 text-sm">Created on {new Date(bot.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="glass" size="sm" onClick={() => updateBot.mutate({ isActive: !bot.isActive })}>
            {bot.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setActiveTab("embed")}>
            Deploy Widget
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
        {[
          { id: "overview", label: "Overview", icon: ChartPieIcon },
          { id: "conversations", label: "Conversations", icon: ChatBubbleLeftRightIcon },
          { id: "leads", label: "Leads", icon: UsersIcon },
          { id: "knowledge", label: "Knowledge Base", icon: DocumentIcon },
          { id: "demo", label: "Live Demo", icon: CodeBracketIcon },
          { id: "embed", label: "Installation", icon: DocumentDuplicateIcon },
          { id: "settings", label: "Settings", icon: Cog6ToothIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewTab bot={bot} sources={sources} />}
          {activeTab === "conversations" && <ConversationsTab botId={id} />}
          {activeTab === "leads" && <LeadsTab botId={id} />}
          {activeTab === "knowledge" && <KnowledgeTab botId={id} sources={sources || []} isLoading={sourcesLoading} />}
          {activeTab === "demo" && (
            <div className="max-w-2xl mx-auto">
              <LiveChat 
                botId={id} 
                botName={bot.name} 
                accentColor={bot.accentColor} 
                greeting={bot.greeting} 
              />
            </div>
          )}
          {activeTab === "embed" && <EmbedTab bot={bot} />}
          {activeTab === "settings" && <SettingsTab bot={bot} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ bot, sources }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="p-8 bg-white/[0.02] border-white/5">
          <h3 className="text-lg font-heading font-bold text-white mb-6">Persona Summary</h3>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-white/70 leading-relaxed italic">
            "{bot.persona}"
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white/[0.02] border-white/5">
            <p className="text-sm text-white/40 mb-1">Knowledge Sources</p>
            <p className="text-3xl font-heading font-bold text-white">{sources?.length || 0}</p>
          </Card>
          <Card className="p-6 bg-white/[0.02] border-white/5">
            <p className="text-sm text-white/40 mb-1">Total Chunks</p>
            <p className="text-3xl font-heading font-bold text-white">
              {sources?.reduce((acc: number, s: any) => acc + (s.chunkCount || 0), 0) || 0}
            </p>
          </Card>
        </div>
      </div>
      
      <div className="space-y-6">
        <Card className="p-6 bg-white/[0.02] border-white/5">
          <h3 className="text-sm font-heading font-bold uppercase tracking-widest text-white/40 mb-4">Bot API Key</h3>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-black/20 border border-white/5 font-mono text-xs text-white/60">
            <span className="truncate">{bot.apiKey}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(bot.apiKey);
                toast.success("API Key copied!");
              }}
              className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KnowledgeTab({ botId, sources, isLoading }: { botId: string, sources: any[], isLoading: boolean }) {
  const [ingestMode, setIngestMode] = useState<"file" | "url" | "text" | null>(null);
  const [url, setUrl] = useState("");
  const [textData, setTextData] = useState({ name: "", text: "" });
  const queryClient = useQueryClient();

  const uploadFile = useUploadFile(botId);
  const ingestUrl = useIngestUrl(botId);
  const ingestText = useIngestText(botId);
  const deleteSource = useDeleteSource(botId);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const socket = io(WS_BASE, {
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      socket.emit("dashboard:join", { agentToken: token });
    });

    socket.on("connect_error", (err) => {
      console.error("Dashboard page socket connection error:", err);
    });

    socket.on("error", (err) => {
      console.error("Dashboard page socket error:", err);
    });

    socket.on("knowledge:status", (data: { sourceId: string; botId: string; status: string; chunkCount: number }) => {
      if (data.botId === botId) {
        queryClient.setQueryData(["knowledge", botId], (old: any[] | undefined) => {
          if (!old) return old;
          return old.map(s => s.id === data.sourceId ? { ...s, status: data.status, chunkCount: data.chunkCount } : s);
        });
        
        if (data.status === 'ready') {
          toast.success("Knowledge source processed successfully!");
        } else if (data.status === 'failed') {
          toast.error("Knowledge source processing failed.");
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [botId, queryClient]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (file) {
      uploadFile.mutate(file, { onSuccess: () => setIngestMode(null) });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold text-white">Knowledge Sources</h2>
        <div className="flex gap-2">
          <Button variant="glass" size="sm" onClick={() => setIngestMode("file")}>Upload File</Button>
          <Button variant="glass" size="sm" onClick={() => setIngestMode("url")}>Add URL</Button>
          <Button variant="glass" size="sm" onClick={() => setIngestMode("text")}>Paste Text</Button>
        </div>
      </div>

      {/* Ingestion Modals/Overlays */}
      <AnimatePresence>
        {ingestMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-8 bg-cyan-500/5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold text-white uppercase tracking-wider text-sm">
                  {ingestMode === "file" && "Upload Knowledge File"}
                  {ingestMode === "url" && "Crawl Website"}
                  {ingestMode === "text" && "Manual Text Entry"}
                </h3>
                <button onClick={() => setIngestMode(null)} className="text-white/40 hover:text-white">✕</button>
              </div>

              {ingestMode === "file" && (
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-cyan-500/50 transition-colors relative">
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,.docx,.txt"
                  />
                  <CloudArrowUpIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">Click or drag file to upload</p>
                  <p className="text-white/30 text-xs">PDF, DOCX, or TXT up to 10MB</p>
                  {uploadFile.isPending && <p className="mt-4 text-cyan-400 text-sm animate-pulse">Uploading...</p>}
                </div>
              )}

              {ingestMode === "url" && (
                <div className="flex gap-4">
                  <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/docs"
                    className="flex-1 h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 focus:border-cyan-500/50 transition-colors"
                  />
                  <Button 
                    variant="primary" 
                    onClick={() => ingestUrl.mutate(url, { onSuccess: () => { setUrl(""); setIngestMode(null); } })}
                    isLoading={ingestUrl.isPending}
                  >
                    Add Source
                  </Button>
                </div>
              )}

              {ingestMode === "text" && (
                <div className="space-y-4">
                  <input 
                    type="text"
                    value={textData.name}
                    onChange={(e) => setTextData({ ...textData, name: e.target.value })}
                    placeholder="Source Name (e.g. FAQ Patch)"
                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 focus:border-cyan-500/50 transition-colors"
                  />
                  <textarea 
                    value={textData.text}
                    onChange={(e) => setTextData({ ...textData, text: e.target.value })}
                    placeholder="Paste your text content here..."
                    className="w-full h-40 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 focus:border-cyan-500/50 transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="primary"
                      onClick={() => ingestText.mutate(textData, { onSuccess: () => { setTextData({ name: "", text: "" }); setIngestMode(null); } })}
                      isLoading={ingestText.isPending}
                    >
                      Process Text
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sources List */}
      <div className="grid grid-cols-1 gap-4">
        {sources.length > 0 ? (
          sources.map((source) => (
            <Card key={source.id} className="p-5 bg-white/[0.02] border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  {source.type === 'url' ? <LinkIcon className="w-5 h-5 text-cyan-400" /> : <DocumentIcon className="w-5 h-5 text-violet-400" />}
                </div>
                <div>
                  <h4 className="text-white font-medium">{source.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{source.type}</span>
                    <span className="text-white/10">•</span>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        source.status === 'ready' ? 'text-emerald-500' : 
                        source.status === 'failed' ? 'text-red-500' : 'text-cyan-400 animate-pulse'
                      }`}>
                        {source.status}
                      </span>
                      {source.status === 'failed' && source.errorMessage && (
                        <span className="text-[9px] text-red-400/60 mt-0.5 max-w-[200px] truncate" title={source.errorMessage}>
                          {source.errorMessage}
                        </span>
                      )}
                    </div>

                    {source.status === 'ready' && (
                      <>
                        <span className="text-white/10">•</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">{source.chunkCount} chunks</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteSource.mutate(source.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))
        ) : !isLoading && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-white/20">No knowledge sources added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmbedTab({ bot }: { bot: any }) {
  const [copied, setCopied] = useState(false);
  const widgetBaseUrl = WS_BASE.replace(/\/+$/, "");
  const scriptTag = `<script 
  src="${widgetBaseUrl}/widget.js?botId=${bot.id}" 
  defer
></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Snippet copied!");
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-heading font-bold text-white mb-2">Install Widget</h2>
        <p className="text-white/40">Copy and paste this snippet into the <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code> of your website.</p>
      </div>

      <Card className="bg-black/40 border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Installation Snippet</span>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {copied ? <CheckIcon className="w-3 h-3" /> : <DocumentDuplicateIcon className="w-3 h-3" />}
            {copied ? "COPIED" : "COPY CODE"}
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <pre className="text-sm font-mono text-cyan-400/80 leading-relaxed">
            {scriptTag}
          </pre>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/[0.02] border-white/5">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
            Production Ready
          </h4>
          <p className="text-sm text-white/40">Our widget is lightweight, lazy-loaded, and won't affect your site's SEO or performance.</p>
        </Card>
        <Card className="p-6 bg-white/[0.02] border-white/5">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center text-[10px]">2</span>
            Domain Lockdown
          </h4>
          <p className="text-sm text-white/40">Configure allowed origins in settings to prevent unauthorized usage of your assistant.</p>
        </Card>
      </div>
    </div>
  );
}

function SettingsTab({ bot }: { bot: any }) {
  const updateBot = useUpdateBot(bot.id);
  const [formData, setFormData] = useState({
    name: bot.name,
    greeting: bot.greeting,
    persona: bot.persona,
    accentColor: bot.accentColor,
  });

  const COLORS = ["#00d4ff", "#a855f7", "#ec4899", "#f97316", "#10b981", "#facc15"];

  return (
    <div className="max-w-3xl space-y-8 pb-20">
      <Card className="p-8 bg-white/[0.02] border-white/5 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Assistant Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Greeting Message</label>
          <input
            type="text"
            value={formData.greeting}
            onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Persona & Instructions</label>
          <textarea
            rows={5}
            value={formData.persona}
            onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-4">Accent Color</label>
          <div className="flex flex-wrap gap-4">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, accentColor: color })}
                className={`w-10 h-10 rounded-full border-2 transition-all ${formData.accentColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <Button 
            variant="primary" 
            onClick={() => updateBot.mutate(formData)}
            isLoading={updateBot.isPending}
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
