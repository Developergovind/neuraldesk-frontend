"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBot, useUpdateBot, useDeleteBot } from "@/lib/hooks/useBots";
import { useKnowledge } from "@/lib/hooks/useKnowledge";
import { WS_BASE } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loader";
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
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { LiveChat } from "@/components/chat/LiveChat";
import toast from "react-hot-toast";
import ConversationsTab from '@/components/bots/ConversationsTab';
import LeadsTab from '@/components/bots/LeadsTab';
import DomainManager from '@/components/bots/DomainManager';
import KnowledgeTab from '@/components/bots/KnowledgeTab';
import { UsersIcon } from "@heroicons/react/24/outline";
import { BotColorPicker } from "@/components/bots/BotColorPicker";

type Tab = "overview" | "conversations" | "leads" | "knowledge" | "embed" | "settings" | "demo";

export default function BotDetailsPage() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  
  const { data: bot, isLoading: botLoading } = useBot(id);
  const { data: sources, isLoading: sourcesLoading } = useKnowledge(id);
  const updateBot = useUpdateBot(id);

  if (botLoading) {
    return (
      <PageLoader
        text="Loading Bot Workspace..."
        subtext="Syncing bot configuration, neural personality, and knowledge base"
        minHeight="min-h-[60vh]"
      />
    );
  }

  if (!bot) return <div className="text-white">Bot not found.</div>;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/bots"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs sm:text-sm font-medium transition-all group active:scale-95 shadow-sm"
        >
          <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to My Assistants</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div 
            className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-2xl shrink-0"
            style={{ background: bot.accentColor }}
          >
            {bot.name[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white truncate">{bot.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${bot.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {bot.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-white/40 text-xs sm:text-sm">Created on {new Date(bot.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button variant="glass" size="sm" className="flex-1 sm:flex-initial justify-center" onClick={() => updateBot.mutate({ isActive: !bot.isActive })}>
            {bot.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="primary" size="sm" className="flex-1 sm:flex-initial justify-center" onClick={() => setActiveTab("embed")}>
            Deploy Widget
          </Button>
        </div>
      </div>

      {/* Responsive Swipeable Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/5 overflow-x-auto custom-scrollbar max-w-full pb-2 sm:pb-1.5">
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
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-white/10 text-white shadow-sm border border-white/10" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
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
            <div className="max-w-4xl mx-auto">
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
          <pre className="text-sm font-mono text-coral-400/90 leading-relaxed">
            {scriptTag}
          </pre>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/[0.02] border-white/5">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-coral-500/20 text-coral-400 flex items-center justify-center text-[10px]">1</span>
            Production Ready
          </h4>
          <p className="text-sm text-white/40">Our widget is lightweight, lazy-loaded, and won't affect your site's SEO or performance.</p>
        </Card>
        <Card className="p-6 bg-white/[0.02] border-white/5">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-blush-500/20 text-blush-400 flex items-center justify-center text-[10px]">2</span>
            Domain Lockdown
          </h4>
          <p className="text-sm text-white/40">Configure allowed origins in settings to prevent unauthorized usage of your assistant.</p>
        </Card>
      </div>
    </div>
  );
}

function SettingsTab({ bot }: { bot: any }) {
  const router = useRouter();
  const updateBot = useUpdateBot(bot.id);
  const deleteBot = useDeleteBot();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: bot.name,
    greeting: bot.greeting,
    persona: bot.persona,
    accentColor: bot.accentColor,
  });

  const handleDeleteBot = () => {
    deleteBot.mutate(bot.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.push("/dashboard/bots");
      },
    });
  };

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
          <BotColorPicker
            value={formData.accentColor}
            onChange={(color) => setFormData({ ...formData, accentColor: color })}
            label="Accent Color"
          />
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

      {/* Domain Security */}
      <DomainManager botId={bot.id} />

      {/* Danger Zone */}
      <Card className="p-6 sm:p-8 bg-red-500/[0.03] border-red-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <h4 className="text-white font-heading font-bold text-base">Delete Assistant</h4>
              <p className="text-white/40 text-xs mt-1 leading-relaxed">
                Permanently delete <span className="text-white/70 font-semibold">{bot.name}</span> and all of its training data, leads, and conversation history. This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all shrink-0 active:scale-95 text-center"
          >
            Delete Bot
          </button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-[#0f0e13] border border-white/10 shadow-2xl z-10 space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <TrashIcon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-heading font-bold text-white">Delete Assistant?</h3>
                <p className="text-sm text-white/50 mt-1">
                  Are you sure you want to delete <span className="text-white font-medium">"{bot.name}"</span>? All associated messages and knowledge will be lost.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBot}
                  disabled={deleteBot.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {deleteBot.isPending ? "Deleting..." : "Yes, Delete Bot"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
