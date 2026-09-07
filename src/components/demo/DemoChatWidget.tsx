"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Sparkles, X, Bot } from "lucide-react";
import { api, WS_BASE } from "@/lib/api";

interface DemoMessage {
  role: "user" | "bot";
  text: string;
  streaming?: boolean;
}

interface DemoChatWidgetProps {
  botId: string;
  botName: string;
  greeting: string;
  accentColor: string;
  suggestedQuestions?: string[];
  autoOpen?: boolean;
}

export function DemoChatWidget({
  botId,
  botName,
  greeting,
  accentColor,
  suggestedQuestions = [],
  autoOpen = false,
}: DemoChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showPromptBubble, setShowPromptBubble] = useState(true);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
    }
  }, [autoOpen]);

  useEffect(() => {
    setMessages([{ role: "bot", text: greeting }]);
    setShowQuestions(true);

    let mounted = true;
    api
      .post(`/chat/${botId}/session`)
      .then(({ data }) => {
        if (mounted) {
          setSessionId(data.sessionId);
        }
      })
      .catch(() => {
        if (mounted) {
          setMessages((prev) => [
            ...prev,
            { role: "bot", text: "Unable to create demo chat session right now." },
          ]);
        }
      });

    const client = io(WS_BASE, { transports: ["websocket", "polling"] });
    client.on("typing", () => setIsTyping(true));
    client.on("chunk", (data: { text: string }) => {
      setIsTyping(false);
      setMessages((prev) => {
        const copy = [...prev];
        const lastIndex = copy.length - 1;
        if (lastIndex >= 0 && copy[lastIndex].role === "bot" && copy[lastIndex].streaming) {
          copy[lastIndex] = {
            role: "bot",
            text: copy[lastIndex].text + data.text,
            streaming: true,
          };
          return copy;
        }
        return [...copy, { role: "bot", text: data.text, streaming: true }];
      });
    });
    client.on("done", () => {
      setIsTyping(false);
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const copy = [...prev];
        const lastIndex = copy.length - 1;
        if (copy[lastIndex].role === "bot") {
          copy[lastIndex] = { ...copy[lastIndex], streaming: false };
        }
        return copy;
      });
    });
    client.on("error", (data: { message?: string }) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.message || "Something went wrong. Please try again." },
      ]);
    });
    setSocket(client);

    return () => {
      mounted = false;
      client.disconnect();
    };
  }, [botId, greeting]);

  useEffect(() => {
    const element = messagesRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [messages, isTyping]);

  const initials = useMemo(() => botName?.[0] || "N", [botName]);

  const sendMessage = (presetText?: string) => {
    const text = (presetText ?? inputText).trim();
    if (!text || !sessionId || !socket) return;

    setInputText("");
    setShowQuestions(false);
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: "user", text }, { role: "bot", text: "", streaming: true }]);
    socket.emit("message", { botId, sessionId, text });
  };

  return (
    <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30">
      {/* Floating Prompt Teaser Bubble (when closed) */}
      {!isOpen && showPromptBubble && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-16 right-0 w-64 p-3 rounded-2xl bg-[#1E1D22] border border-coral-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-left backdrop-blur-xl flex items-start gap-2.5"
        >
          <div className="w-6 h-6 rounded-full bg-coral-500/20 text-coral-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">Ask our AI Assistant</p>
            <p className="text-[11px] text-white/60 line-clamp-2">Test real-time answers trained on this demo.</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPromptBubble(false);
            }}
            className="text-white/40 hover:text-white/80 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* Launcher Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowPromptBubble(false);
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: `linear-gradient(135deg, ${accentColor}, #F58F7C)`,
          boxShadow: `0 8px 30px ${accentColor}40`,
        }}
        className="h-13 w-13 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-white shadow-xl relative group"
        aria-label="Toggle Demo Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <span className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping opacity-60 pointer-events-none" />
          </>
        )}
      </motion.button>

      {/* Chat Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-[310px] sm:w-[380px] h-[460px] max-w-[calc(100vw-2.5rem)] rounded-2xl bg-[#18171C]/95 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-xl text-white font-bold flex items-center justify-center shadow-md shadow-coral-500/20"
                  style={{ background: accentColor }}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-white tracking-tight">{botName}</p>
                    <span className="px-1.5 py-0.2 rounded bg-coral-500/20 text-[9px] font-medium text-coral-300">
                      RAG AI
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[10px] text-emerald-400 font-medium">Ready & Connected</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Thread */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 custom-scrollbar">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-md shadow-coral-500/20"
                        : "bg-white/[0.06] text-white/90 border border-white/10"
                    }`}
                  >
                    {msg.text}
                    {msg.streaming && <span className="ml-1 animate-pulse text-coral-400">▋</span>}
                  </div>
                </div>
              ))}

              {/* Suggested Questions */}
              {showQuestions && suggestedQuestions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">Suggested Prompts:</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {suggestedQuestions.slice(0, 3).map((question) => (
                      <button
                        key={question}
                        onClick={() => sendMessage(question)}
                        className="text-left text-xs text-white/80 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-coral-500/10 hover:border-coral-400/50 hover:text-white transition-all flex items-center justify-between group"
                      >
                        <span className="truncate">{question}</span>
                        <span className="text-coral-400 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/6 border border-white/10 rounded-2xl px-3.5 py-2 flex items-center gap-1.5">
                    <span className="text-[11px] text-white/50 mr-1">Generating response</span>
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 rounded-full bg-coral-400 animate-bounce"
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-white/[0.03] flex items-center gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about pricing, setup, API..."
                className="flex-1 bg-white/5 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none border border-white/10 focus:border-coral-400/60 focus:bg-white/10 placeholder-white/30 transition-colors"
              />
              <button
                onClick={() => sendMessage()}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white disabled:opacity-30 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
                style={{ background: accentColor }}
                disabled={!inputText.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
