"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { PaperAirplaneIcon, UserIcon } from "@heroicons/react/24/solid";
import { 
  ArrowPathIcon, 
  PlusIcon, 
  TrashIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon,
  ChevronRightIcon,
  Bars3BottomRightIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { api, WS_BASE } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface StoredChatSession {
  id: string;
  sessionId: string | null;
  title: string;
  createdAt: string;
  messages: Message[];
}

export function LiveChat({
  botId,
  botName,
  accentColor,
  greeting,
}: {
  botId: string;
  botName: string;
  accentColor: string;
  greeting: string;
}) {
  const [sessions, setSessions] = useState<StoredChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  // Storage key
  const storageKey = `neuraldesk_bot_chats_${botId}`;
  const activeKey = `neuraldesk_active_chat_${botId}`;

  // 1. Initial Load of Sessions from LocalStorage (resumes ongoing chats)
  useEffect(() => {
    let initialSessions: StoredChatSession[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        initialSessions = JSON.parse(stored);
      }
    } catch {
      initialSessions = [];
    }

    if (!initialSessions || initialSessions.length === 0) {
      const defaultId = `chat_${Date.now()}`;
      initialSessions = [
        {
          id: defaultId,
          sessionId: null,
          title: "New Conversation",
          createdAt: new Date().toISOString(),
          messages: [{ role: "assistant", content: greeting }],
        },
      ];
    }

    const savedActiveId = localStorage.getItem(activeKey);
    const validActiveId = initialSessions.some((s) => s.id === savedActiveId)
      ? (savedActiveId as string)
      : initialSessions[0].id;

    setSessions(initialSessions);
    setActiveSessionId(validActiveId);
    isInitializedRef.current = true;
  }, [botId, greeting, storageKey, activeKey]);

  // 2. Sync to LocalStorage whenever sessions or activeSessionId changes
  useEffect(() => {
    if (!isInitializedRef.current || sessions.length === 0) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
      if (activeSessionId) {
        localStorage.setItem(activeKey, activeSessionId);
      }
    } catch (e) {
      console.error("Failed to persist bot chats", e);
    }
  }, [sessions, activeSessionId, storageKey, activeKey]);

  // Active Session computation
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  // 3. Ensure server sessionId and Socket setup for active conversation
  useEffect(() => {
    if (!activeSession) return;

    // Create server sessionId if missing
    if (!activeSession.sessionId) {
      api
        .post(`/chat/${botId}/session`)
        .then(({ data }) => {
          setSessions((prev) =>
            prev.map((s) => (s.id === activeSession.id ? { ...s, sessionId: data.sessionId } : s))
          );
        })
        .catch((err) => {
          console.error("Failed to create chat session on server", err);
        });
    }

    // Connect socket
    const s = io(WS_BASE, {
      transports: ["polling", "websocket"],
    });

    s.on("connect_error", (err) => {
      console.error("LiveChat Socket connection error:", err);
      setIsTyping(false);
    });

    s.on("error", (err: any) => {
      console.error("LiveChat Socket error:", err);
      toast.error(err.message || "An error occurred in chat");
      setIsTyping(false);
    });

    s.on("chunk", (data) => {
      setIsTyping(false);
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== activeSession.id) return session;
          const currentMsgs = [...session.messages];
          const last = currentMsgs[currentMsgs.length - 1];
          if (last && last.role === "assistant") {
            const updatedLast = { ...last, content: last.content + data.text };
            return {
              ...session,
              messages: [...currentMsgs.slice(0, -1), updatedLast],
            };
          } else {
            return {
              ...session,
              messages: [...currentMsgs, { role: "assistant", content: data.text }],
            };
          }
        })
      );
    });

    s.on("typing", () => setIsTyping(true));

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [botId, activeSession?.id]);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, isTyping]);

  // Handler: Start a New Chat
  const handleNewChat = async () => {
    const newId = `chat_${Date.now()}`;
    let serverSessionId: string | null = null;
    try {
      const { data } = await api.post(`/chat/${botId}/session`);
      serverSessionId = data.sessionId;
    } catch (err) {
      console.warn("Could not pre-fetch server sessionId", err);
    }

    const newSession: StoredChatSession = {
      id: newId,
      sessionId: serverSessionId,
      title: `Chat ${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [{ role: "assistant", content: greeting }],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInput("");
    setShowMobileSidebar(false);
    toast.success("Started new conversation");
  };

  // Handler: Switch / Resume Previous Chat
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setShowMobileSidebar(false);
  };

  // Handler: Delete a Chat Session
  const handleDeleteSession = (idToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const remaining = sessions.filter((s) => s.id !== idToDelete);
    if (remaining.length === 0) {
      const newId = `chat_${Date.now()}`;
      const defaultSession: StoredChatSession = {
        id: newId,
        sessionId: null,
        title: "New Conversation",
        createdAt: new Date().toISOString(),
        messages: [{ role: "assistant", content: greeting }],
      };
      setSessions([defaultSession]);
      setActiveSessionId(newId);
    } else {
      setSessions(remaining);
      if (activeSessionId === idToDelete) {
        setActiveSessionId(remaining[0].id);
      }
    }
    toast.success("Chat removed");
  };

  // Handler: Reset Current Active Chat
  const handleResetActiveChat = async () => {
    if (!activeSession) return;
    try {
      const { data } = await api.post(`/chat/${botId}/session`);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                sessionId: data.sessionId,
                title: "New Conversation",
                messages: [{ role: "assistant", content: greeting }],
              }
            : s
        )
      );
      setInput("");
      toast.success("Conversation reset");
    } catch {
      toast.error("Failed to reset conversation");
    }
  };

  // Handler: Send Message
  const handleSend = () => {
    if (!input.trim() || !activeSession || !socket) return;

    const text = input.trim();
    const currentSessionId = activeSession.sessionId;

    if (!currentSessionId) {
      api.post(`/chat/${botId}/session`).then(({ data }) => {
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSession.id ? { ...s, sessionId: data.sessionId } : s))
        );
        socket.emit("message", {
          botId,
          sessionId: data.sessionId,
          text,
        });
      });
    } else {
      socket.emit("message", {
        botId,
        sessionId: currentSessionId,
        text,
      });
    }

    setInput("");
    setIsTyping(true);

    // Update active session messages and set title if this was the first user message
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSession.id) return session;
        const isFirstUserMsg = !session.messages.some((m) => m.role === "user");
        const newTitle = isFirstUserMsg
          ? text.length > 24
            ? text.substring(0, 24) + "..."
            : text
          : session.title;

        return {
          ...session,
          title: newTitle,
          messages: [...session.messages, { role: "user", content: text }],
        };
      })
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-[620px] bg-obsidian-900/60 rounded-3xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl relative">
      {/* ── Main Chat Area (Left / Center) ────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-black/20 shrink-0"
              style={{ background: accentColor }}
            >
              {botName[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white leading-none truncate">{botName}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 truncate max-w-[130px] hidden sm:inline">
                  {activeSession?.title || "Active Chat"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  Resumed & Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Reset Chat Button */}
            <button
              onClick={handleResetActiveChat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-xs font-medium transition-all active:scale-95"
              title="Reset current conversation"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* + New Chat Button (Desktop & Mobile) */}
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-coral-500/20 hover:bg-coral-500/30 text-coral-300 border border-coral-500/30 text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,143,124,0.15)] active:scale-95"
              title="Start a new chat"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>

            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-medium"
              title="View previous chats"
            >
              <Bars3BottomRightIcon className="w-4 h-4" />
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-coral-500/20 text-coral-400">
                {sessions.length}
              </span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {activeSession?.messages?.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10 overflow-hidden text-xs font-bold",
                  m.role === "user" ? "bg-white/5 text-coral-300" : "bg-white/10 text-white"
                )}
              >
                {m.role === "user" ? (
                  <UserIcon className="w-4 h-4 text-white/40" />
                ) : (
                  <span
                    style={
                      accentColor?.includes("gradient")
                        ? {
                            backgroundImage: accentColor,
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                          }
                        : { color: accentColor }
                    }
                  >
                    {botName[0]}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "max-w-[82%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg",
                  m.role === "user"
                    ? "bg-coral-500/15 text-white border border-coral-500/25 rounded-tr-none"
                    : "bg-white/[0.03] text-white/90 border border-white/5 rounded-tl-none"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-white/20 ml-11">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white/[0.01] border-t border-white/5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question or continue conversation..."
              className="w-full h-12 pl-4 pr-14 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-coral-500/50 focus:bg-white/[0.07] transition-all text-xs sm:text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105 active:scale-95 shadow-md"
              style={{ background: accentColor }}
              title="Send message"
            >
              <PaperAirplaneIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right-Side Previous Chats Switcher Panel ───────────────── */}
      <div
        className={cn(
          "w-full lg:w-72 xl:w-80 flex flex-col bg-[#100f13]/95 lg:bg-transparent border-t lg:border-t-0 lg:border-l border-white/5 h-full transition-all z-20",
          showMobileSidebar ? "flex fixed inset-0 lg:static z-50 p-4 lg:p-0" : "hidden lg:flex"
        )}
      >
        {/* Right Panel Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-coral-400" />
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-white">
              Previous Chats
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/60">
              {sessions.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded-lg bg-coral-500/20 text-coral-300 hover:bg-coral-500/30 transition-colors"
              title="Start a new chat"
            >
              <PlusIcon className="w-4 h-4" />
            </button>

            {showMobileSidebar && (
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="lg:hidden p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Previous Chats List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {sessions.map((session) => {
            const isSelected = session.id === activeSessionId;
            const messageCount = session.messages.filter((m) => m.role === "user").length;

            return (
              <motion.div
                key={session.id}
                layout
                onClick={() => handleSelectSession(session.id)}
                className={cn(
                  "group relative p-3 rounded-2xl border cursor-pointer transition-all duration-200",
                  isSelected
                    ? "bg-coral-500/10 border-coral-500/40 shadow-[0_0_15px_rgba(245,143,124,0.12)]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        isSelected ? "bg-coral-400 shadow-[0_0_8px_rgba(245,143,124,0.8)]" : "bg-white/20"
                      )}
                    />
                    <p
                      className={cn(
                        "text-xs font-semibold truncate",
                        isSelected ? "text-white" : "text-white/70 group-hover:text-white"
                      )}
                    >
                      {session.title}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                    title="Delete chat session"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/30 pl-4 mt-1.5">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 text-white/20" />
                    {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                  </span>
                  <span>{session.messages.length} msgs</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info in right panel */}
        <div className="p-3 border-t border-white/5 bg-white/[0.01]">
          <p className="text-[10px] text-white/30 text-center leading-relaxed">
            Chats resume automatically until you log out.
          </p>
        </div>
      </div>
    </div>
  );
}

