"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Check } from "lucide-react";
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
    <div className="absolute bottom-4 right-4 z-20">
      <motion.button
        onClick={() => setIsOpen(true)}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ background: accentColor }}
        className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute inset-0 rounded-full border border-white/50 animate-ping" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="absolute bottom-16 right-0 w-[320px] md:w-[400px] h-[500px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[#080810]/95 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col max-md:fixed max-md:inset-3 max-md:w-auto max-md:h-auto"
          >
            <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full text-white font-bold flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{botName}</p>
                <p className="text-[11px] text-emerald-400">Online</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="ml-auto text-white/40 hover:text-white">
                ✕
              </button>
            </div>

            <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, index) => (
                <div key={`${msg.role}-${index}`} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-cyan-500/30 text-white border border-cyan-400/40"
                        : "bg-white/6 text-white/90 border border-white/10"
                    }`}
                  >
                    {msg.text}
                    {msg.streaming && <span className="ml-1 animate-pulse">▋</span>}
                  </div>
                </div>
              ))}

              {showQuestions && suggestedQuestions.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {suggestedQuestions.slice(0, 4).map((question) => (
                    <button
                      key={question}
                      onClick={() => sendMessage(question)}
                      className="text-left text-xs text-white/80 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:border-cyan-400/50 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/6 border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-1">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10 bg-white/5 flex items-center gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none border border-white/10 focus:border-cyan-400/50 placeholder-white/30"
              />
              <button
                onClick={() => sendMessage()}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white disabled:opacity-40"
                style={{ backgroundColor: accentColor }}
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
