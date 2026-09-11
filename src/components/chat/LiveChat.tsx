"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Send,
  RotateCcw,
  Copy,
  CheckCheck,
  Search,
  PanelLeftClose,
  PanelLeft,
  Bot,
  User,
  AlertCircle,
  Sparkles,
  Clock,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import { api, WS_BASE } from "@/lib/api";
import { cn, safeFormatDistanceToNow, safeFormat, generateUUID } from "@/lib/utils";
import { PageLoader } from "@/components/ui/Loader";
import toast from "react-hot-toast";

export interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  isError?: boolean;
}

export interface StoredChatSession {
  id: string; // local unique ID
  sessionId: string | null; // server sessionId
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

// Safely extract text from any server chunk or payload structure
function extractText(data: any): string {
  if (data === null || data === undefined) return "";
  if (typeof data === "string") return data;
  if (typeof data === "number") return String(data);
  if (typeof data === "object") {
    return (
      data.text ??
      data.chunk ??
      data.content ??
      data.delta ??
      data.message ??
      data.response ??
      data.reply ??
      ""
    );
  }
  return "";
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
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState<StoredChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [lastSentText, setLastSentText] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeSessionIdRef = useRef<string>("");
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const storageKey = `neuraldesk_bot_chats_${botId}`;
  const activeKey = `neuraldesk_active_chat_${botId}`;

  // Keep ref in sync for socket event closures
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // 1. Initial Load of Sessions from LocalStorage (resumes ongoing chats)
  useEffect(() => {
    let initialSessions: StoredChatSession[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialSessions = parsed;
        }
      }
    } catch {
      initialSessions = [];
    }

    if (initialSessions.length === 0) {
      const defaultId = generateUUID();
      initialSessions = [
        {
          id: defaultId,
          sessionId: generateUUID(),
          title: "New Conversation",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              role: "assistant",
              content: greeting || "Hello! How can I assist you today?",
              timestamp: new Date().toISOString(),
            },
          ],
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

  // Filtered Sessions for Sidebar search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.messages.some((m) => m.content.toLowerCase().includes(query))
    );
  }, [sessions, searchQuery]);

  // 3. Socket Connection & Event Handling
  useEffect(() => {
    const s = io(WS_BASE, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    s.on("connect", () => {
      // connected
    });

    s.on("connect_error", (err) => {
      console.warn("LiveChat Socket connection error:", err);
    });

    s.on("typing", () => {
      setIsTyping(true);
    });

    // Handle Streaming Chunks
    s.on("chunk", (data: any) => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
        responseTimeoutRef.current = null;
      }
      setIsTyping(false);

      const chunkText = extractText(data);
      if (!chunkText) return;

      const currentActiveId = activeSessionIdRef.current;
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== currentActiveId) return session;
          const currentMsgs = [...session.messages];
          const last = currentMsgs[currentMsgs.length - 1];

          if (last && last.role === "assistant" && !last.isError) {
            const updatedLast: Message = {
              ...last,
              content: last.content + chunkText,
            };
            return {
              ...session,
              updatedAt: new Date().toISOString(),
              messages: [...currentMsgs.slice(0, -1), updatedLast],
            };
          } else {
            const newAssistantMsg: Message = {
              role: "assistant",
              content: chunkText,
              timestamp: new Date().toISOString(),
            };
            return {
              ...session,
              updatedAt: new Date().toISOString(),
              messages: [...currentMsgs, newAssistantMsg],
            };
          }
        })
      );
    });

    // Handle full completed messages or non-stream responses
    const handleFullResponse = (data: any) => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
        responseTimeoutRef.current = null;
      }
      setIsTyping(false);

      const text = extractText(data);
      if (!text) return;

      const currentActiveId = activeSessionIdRef.current;
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== currentActiveId) return session;
          const currentMsgs = [...session.messages];
          const last = currentMsgs[currentMsgs.length - 1];

          // If last assistant message already matches this or was streaming, update or append
          if (last && last.role === "assistant" && !last.isError) {
            if (last.content.endsWith(text)) {
              return session; // duplicate
            }
            if (last.content.length === 0) {
              return {
                ...session,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...currentMsgs.slice(0, -1),
                  { ...last, content: text },
                ],
              };
            }
          }

          const newAssistantMsg: Message = {
            role: "assistant",
            content: text,
            timestamp: new Date().toISOString(),
          };
          return {
            ...session,
            updatedAt: new Date().toISOString(),
            messages: [...currentMsgs, newAssistantMsg],
          };
        })
      );
    };

    s.on("response", handleFullResponse);
    s.on("message", (data: any) => {
      // If message is from assistant/bot
      if (data && (data.role === "assistant" || data.senderType === "bot" || data.text || data.content)) {
        handleFullResponse(data);
      }
    });

    s.on("done", () => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
        responseTimeoutRef.current = null;
      }
      setIsTyping(false);
    });

    s.on("error", (err: any) => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
        responseTimeoutRef.current = null;
      }
      setIsTyping(false);
      const errMsg =
        typeof err === "string"
          ? err
          : err?.message || "An error occurred while generating the response.";

      toast.error(errMsg);

      const currentActiveId = activeSessionIdRef.current;
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== currentActiveId) return session;
          return {
            ...session,
            messages: [
              ...session.messages,
              {
                role: "assistant",
                content: `⚠️ **Error**: ${errMsg}`,
                timestamp: new Date().toISOString(),
                isError: true,
              },
            ],
          };
        })
      );
    });

    setSocket(s);

    return () => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
      s.disconnect();
    };
  }, [botId]);

  // Ensure server sessionId is provisioned when activeSession changes
  useEffect(() => {
    if (!activeSession || activeSession.sessionId) return;

    api
      .post(`/chat/${botId}/session`)
      .then(({ data }) => {
        if (data?.sessionId) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSession.id ? { ...s, sessionId: data.sessionId } : s
            )
          );
        }
      })
      .catch((err) => {
        console.warn("Session pre-provisioning notice:", err?.message || err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId, activeSession?.id, activeSession?.sessionId]);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, isTyping]);

  // 4. Handler: Start a New Chat
  const handleNewChat = useCallback(async () => {
    const newId = generateUUID();
    const newSessionId = generateUUID();
    
    // Create new blank session
    const newSession: StoredChatSession = {
      id: newId,
      sessionId: newSessionId,
      title: "New Conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          role: "assistant",
          content: greeting || "Hello! How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Prepend new session to the list (ChatGPT style)
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInput("");
    setIsTyping(false);

    // Asynchronously pre-fetch / register server sessionId
    try {
      const { data } = await api.post(`/chat/${botId}/session`, { sessionId: newSessionId });
      if (data?.sessionId) {
        setSessions((prev) =>
          prev.map((s) => (s.id === newId ? { ...s, sessionId: data.sessionId } : s))
        );
      }
    } catch {
      // Handled on first message
    }

    toast.success("New conversation started");
  }, [botId, greeting]);

  // 5. Handler: Select Chat Session
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setInput("");
    setIsTyping(false);
  };

  // 6. Handler: Delete Chat Session
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
        updatedAt: new Date().toISOString(),
        messages: [{ role: "assistant", content: greeting, timestamp: new Date().toISOString() }],
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

  // 7. Handler: Rename Chat Session Title
  const handleStartRename = (session: StoredChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(session.id);
    setEditTitleInput(session.title);
  };

  const handleSaveRename = (sessionId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editTitleInput.trim()) {
      setEditingTitleId(null);
      return;
    }
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, title: editTitleInput.trim() } : s
      )
    );
    setEditingTitleId(null);
    toast.success("Conversation renamed");
  };

  // 8. Handler: Reset Active Chat
  const handleResetActiveChat = async () => {
    if (!activeSession) return;
    try {
      const { data } = await api.post(`/chat/${botId}/session`);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                sessionId: data.sessionId || null,
                title: "New Conversation",
                updatedAt: new Date().toISOString(),
                messages: [{ role: "assistant", content: greeting, timestamp: new Date().toISOString() }],
              }
            : s
        )
      );
      setInput("");
      setIsTyping(false);
      toast.success("Conversation reset");
    } catch {
      toast.error("Failed to reset conversation");
    }
  };

  // 9. Handler: Send Message (Socket + HTTP Fallback + Timeout Safety)
  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || !activeSession) return;

    setLastSentText(textToSend);
    setInput("");
    setIsTyping(true);

    const now = new Date().toISOString();
    const isFirstUserMsg = !activeSession.messages.some((m) => m.role === "user");
    const newTitle = isFirstUserMsg
      ? textToSend.length > 28
        ? textToSend.substring(0, 28) + "..."
        : textToSend
      : activeSession.title;

    // Immediately update UI with user message
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSession.id) return session;
        return {
          ...session,
          title: newTitle,
          updatedAt: now,
          messages: [
            ...session.messages,
            { role: "user", content: textToSend, timestamp: now },
          ],
        };
      })
    );

    // Ensure serverSessionId is a valid UUID format
    let serverSessionId = activeSession.sessionId;
    const isValidUUID =
      serverSessionId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        serverSessionId
      );

    if (!isValidUUID) {
      serverSessionId = generateUUID();
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id ? { ...s, sessionId: serverSessionId } : s
        )
      );
    }

    // Safety timeout: If no chunk/response within 25 seconds, provide fallback response
    if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
    responseTimeoutRef.current = setTimeout(async () => {
      // Attempt HTTP fallback if socket didn't respond
      try {
        const fallbackRes = await api.post(`/chat/${botId}/message`, {
          sessionId: serverSessionId,
          text: textToSend,
        });
        const replyText = extractText(fallbackRes.data);
        if (replyText) {
          setIsTyping(false);
          setSessions((prev) =>
            prev.map((session) => {
              if (session.id !== activeSession.id) return session;
              return {
                ...session,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...session.messages,
                  {
                    role: "assistant",
                    content: replyText,
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
            })
          );
          return;
        }
      } catch {
        // Fallback also failed
      }

      setIsTyping(false);
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== activeSession.id) return session;
          return {
            ...session,
            messages: [
              ...session.messages,
              {
                role: "assistant",
                content:
                  "⚠️ **Response Timeout**: The AI server took too long to reply. Please ensure your backend and AI model (Groq) are reachable.",
                timestamp: new Date().toISOString(),
                isError: true,
              },
            ],
          };
        })
      );
    }, 25000);

    // Emit over WebSocket
    if (socket && socket.connected) {
      socket.emit("message", {
        botId,
        sessionId: serverSessionId,
        text: textToSend,
      });
    } else {
      // If socket disconnected, immediately try HTTP endpoint
      try {
        const res = await api.post(`/chat/${botId}/message`, {
          sessionId: serverSessionId,
          text: textToSend,
        });
        if (responseTimeoutRef.current) {
          clearTimeout(responseTimeoutRef.current);
          responseTimeoutRef.current = null;
        }
        setIsTyping(false);
        const replyText = extractText(res.data);
        if (replyText) {
          setSessions((prev) =>
            prev.map((session) => {
              if (session.id !== activeSession.id) return session;
              return {
                ...session,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...session.messages,
                  {
                    role: "assistant",
                    content: replyText,
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
            })
          );
        }
      } catch (httpErr: any) {
        if (responseTimeoutRef.current) {
          clearTimeout(responseTimeoutRef.current);
          responseTimeoutRef.current = null;
        }
        setIsTyping(false);
        const errorMsg =
          httpErr.response?.data?.message || "Failed to reach AI service.";
        setSessions((prev) =>
          prev.map((session) => {
            if (session.id !== activeSession.id) return session;
            return {
              ...session,
              messages: [
                ...session.messages,
                {
                  role: "assistant",
                  content: `⚠️ **Connection Error**: ${errorMsg}`,
                  timestamp: new Date().toISOString(),
                  isError: true,
                },
              ],
            };
          })
        );
      }
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied to clipboard");
  };

  if (!mounted) {
    return (
      <div className="flex h-[660px] bg-[#121115]/90 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl items-center justify-center">
        <PageLoader
          text="Loading AI Assistant..."
          subtext="Connecting to neural streaming engine and chat sessions"
          minHeight="h-[600px]"
        />
      </div>
    );
  }

  return (
    <div className="flex h-[660px] bg-[#121115]/90 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl relative">
      {/* ── Left Sidebar (ChatGPT-style Conversation History) ──────── */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="h-full flex flex-col bg-[#17161B] border-r border-white/10 shrink-0 select-none overflow-hidden z-20"
          >
            {/* Sidebar Top: New Chat Button & Collapse */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={handleNewChat}
                className="flex-1 flex items-center justify-center gap-2 h-10 px-3.5 rounded-xl bg-gradient-to-r from-coral-500/20 to-blush-500/20 hover:from-coral-500/30 hover:to-blush-500/30 border border-coral-500/30 text-coral-300 hover:text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,143,124,0.15)] active:scale-95 truncate"
                title="Start a new chat session"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">New Chat</span>
              </button>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter for past conversations */}
            <div className="px-3 pt-3 pb-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-white/5 border border-white/5 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-coral-500/40"
                />
              </div>
            </div>

            {/* Conversation History List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-xs">
                  {searchQuery ? "No matching chats found." : "No previous chats."}
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isSelected = session.id === activeSessionId;
                  const isEditing = editingTitleId === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={cn(
                        "group relative flex items-center justify-between gap-2 p-2.5 rounded-xl cursor-pointer transition-all border text-left",
                        isSelected
                          ? "bg-coral-500/15 border-coral-500/40 text-white shadow-[0_0_15px_rgba(245,143,124,0.12)]"
                          : "bg-white/[0.02] border-transparent hover:bg-white/[0.06] text-white/70 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare
                          className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            isSelected ? "text-coral-400" : "text-white/40"
                          )}
                        />

                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleSaveRename(session.id, e)}
                            className="flex items-center gap-1 flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={editTitleInput}
                              onChange={(e) => setEditTitleInput(e.target.value)}
                              onBlur={() => handleSaveRename(session.id)}
                              className="w-full bg-black/40 border border-coral-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate leading-snug">
                              {session.title}
                            </p>
                            <p className="text-[10px] text-white/30 truncate mt-0.5">
                              {safeFormatDistanceToNow(session.updatedAt || session.createdAt, {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action icons on hover */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => handleStartRename(session, e)}
                            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="p-1 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer: Session Count & Status */}
            <div className="p-3 border-t border-white/10 bg-black/20 flex items-center justify-between text-[10px] text-white/40">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>RAG Active</span>
              </span>
              <span>{sessions.length} Saved {sessions.length === 1 ? "Chat" : "Chats"}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Chat Header */}
        <div className="h-16 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between bg-[#151419]/90">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar Open Toggle (when collapsed) */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
                title="Open chat history sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Bot Avatar */}
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-lg shadow-black/30 shrink-0 border border-white/10"
              style={{ background: accentColor }}
            >
              {botName?.[0] || "B"}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-heading font-bold text-white leading-none truncate">
                  {botName}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 truncate max-w-[160px] hidden sm:inline">
                  {activeSession?.title || "Active Conversation"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                  Online &bull; Groq RAG Engine
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Reset Current Chat Button */}
            <button
              onClick={handleResetActiveChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-medium transition-all active:scale-95"
              title="Reset current conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* New Chat Quick Button */}
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-coral-500 to-blush-500 hover:from-coral-600 hover:to-blush-600 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,143,124,0.25)] active:scale-95"
              title="Start a new chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar bg-gradient-to-b from-transparent to-black/20"
        >
          {activeSession?.messages?.map((msg, idx) => {
            const isUser = msg.role === "user";
            const isError = msg.isError;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-start gap-3.5 group",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-xs font-bold shadow-md",
                    isUser
                      ? "bg-coral-500/20 text-coral-300 border-coral-500/30"
                      : "bg-[#25242A] text-white border-white/10"
                  )}
                  style={!isUser ? { background: accentColor } : undefined}
                >
                  {isUser ? <User className="w-4 h-4" /> : botName?.[0] || "B"}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    "relative max-w-[85%] sm:max-w-[78%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg",
                    isUser
                      ? "bg-gradient-to-br from-coral-500/20 to-blush-500/20 text-white border border-coral-500/30 rounded-tr-none"
                      : isError
                      ? "bg-red-500/10 text-red-200 border border-red-500/30 rounded-tl-none"
                      : "bg-[#1E1D23]/90 text-white/90 border border-white/10 rounded-tl-none backdrop-blur-md"
                  )}
                >
                  {/* Markdown Renderer for Assistant, Plain Text for User */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed font-normal">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          code: ({ children }) => (
                            <code className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-coral-300 font-mono text-[11px]">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="p-3 my-2 rounded-xl bg-black/60 border border-white/10 overflow-x-auto custom-scrollbar font-mono text-xs">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Message Footer: Timestamp & Copy Icon */}
                  <div
                    className={cn(
                      "flex items-center gap-2 mt-2 pt-1 border-t border-white/5 text-[10px] text-white/30",
                      isUser ? "justify-end" : "justify-between"
                    )}
                  >
                    <span>
                      {msg.timestamp
                        ? safeFormat(msg.timestamp, "h:mm a")
                        : "Just now"}
                    </span>

                    {!isUser && !isError && (
                      <button
                        onClick={() => handleCopyMessage(msg.content, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1 p-0.5"
                        title="Copy message"
                      >
                        {copiedIndex === idx ? (
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}

                    {isError && (
                      <button
                        onClick={() => handleSend(lastSentText)}
                        className="text-xs text-coral-400 hover:text-coral-300 flex items-center gap-1 font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" /> Retry
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white/10"
                style={{ background: accentColor }}
              >
                {botName?.[0] || "B"}
              </div>
              <div className="p-3.5 rounded-2xl bg-[#1E1D23]/90 border border-white/10 rounded-tl-none flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-coral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#151419]/95 border-t border-white/10">
          <div className="relative flex items-center">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question or continue conversation... (Enter to send)"
              className="w-full min-h-[48px] max-h-[120px] py-3 pl-4 pr-14 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-coral-500/50 focus:bg-white/[0.07] transition-all text-xs sm:text-sm resize-none custom-scrollbar"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2.5 p-2 rounded-xl flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105 active:scale-95 shadow-md text-white"
              style={{ background: accentColor }}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
