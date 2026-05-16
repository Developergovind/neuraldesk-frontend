"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { PaperAirplaneIcon, UserIcon } from "@heroicons/react/24/solid";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function LiveChat({ botId, botName, accentColor, greeting }: { botId: string; botName: string; accentColor: string; greeting: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([{ role: "assistant", content: greeting }]);

    // Create session
    api.post(`/chat/${botId}/session`).then(({ data }) => {
      setSessionId(data.sessionId);
    });

    // Setup socket
    const s = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5001", {
      transports: ["websocket"],
    });

    s.on("chunk", (data) => {
      setIsTyping(false);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, content: last.content + data.text }];
        }
        return [...prev, { role: "assistant", content: data.text }];
      });
    });

    s.on("typing", () => setIsTyping(true));
    
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [botId, greeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || !sessionId || !socket) return;

    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsTyping(true);

    socket.emit("message", {
      botId,
      sessionId,
      text,
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-obsidian-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ backgroundColor: accentColor }}>
          {botName[0]}
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">{botName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Live Preview</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex items-start gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10",
              m.role === "user" ? "bg-white/5" : "bg-white/10"
            )}>
              {m.role === "user" ? <UserIcon className="w-4 h-4 text-white/40" /> : <span className="text-[10px] font-bold" style={{ color: accentColor }}>{botName[0]}</span>}
            </div>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
              m.role === "user" 
                ? "bg-white/5 text-white border border-white/10 rounded-tr-none" 
                : "bg-white/[0.02] text-white/90 border border-white/5 rounded-tl-none"
            )}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-white/20 ml-11">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white/[0.01] border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="w-full h-12 pl-4 pr-14 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105 active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            <PaperAirplaneIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
