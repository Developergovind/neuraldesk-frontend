'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bot, Circle, Send, User, Zap, Trash2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { api, WS_BASE } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

type SessionMode = 'bot' | 'human' | 'closed';

type LiveSession = {
  sessionId: string;
  sessionDbId?: string;
  visitorName?: string | null;
  visitorEmail?: string | null;
  mode: SessionMode;
  agentName?: string | null;
  messageCount?: number;
  startedAt?: string;
  lastActivityAt?: string;
  botName?: string;
  botId?: string;
  lastMessage?: string | null;
  lastMessageRole?: string | null;
  hasUnread?: boolean;
};

type ChatMessage = {
  id?: string;
  role: 'user' | 'assistant';
  senderType?: 'user' | 'bot' | 'human_agent';
  content: string;
  createdAt?: string;
  visitorName?: string | null;
  agentName?: string | null;
};

function playDashboardSound(type: 'new_message' | 'takeover') {
  try {
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'new_message') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1000, ctx.currentTime + 0.18);
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.35);
      return;
    }

    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Browsers can block Web Audio until a user gesture.
  }
}

export default function LiveInbox() {
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [replyText, setReplyText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [filter, setFilter] = useState<'all' | 'bot' | 'human'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedSessionRef = useRef<string | null>(null);

  const token = typeof window !== 'undefined' ? getAccessToken() || '' : '';

  const { data: activeSessionsResponse, isLoading: isSessionsLoading } = useQuery({
    queryKey: ['active-sessions', page],
    queryFn: () => api.get<{ data: LiveSession[], meta: any }>(`/chat/active-sessions?page=${page}&limit=10`).then(r => r.data),
    refetchInterval: 5000,
  });

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedSession]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!activeSessionsResponse) return;

    setSessions(prev => activeSessionsResponse.data.map(session => ({
      ...session,
      hasUnread: prev.find(s => s.sessionId === session.sessionId)?.hasUnread || false,
    })));
    setPagination(activeSessionsResponse.meta);
  }, [activeSessionsResponse]);

  useEffect(() => {
    if (!token) return;

    const s = io(WS_BASE, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(s);

    s.on('connect', () => {
      s.emit('dashboard:join', { agentToken: token });
    });

    s.on('connect_error', (err) => {
      console.error('LiveInbox Socket connection error:', err);
    });

    s.on('error', (err) => {
      console.error('LiveInbox Socket error:', err);
    });

    s.on('session:update', (data: Partial<LiveSession> & { sessionId: string }) => {
      setSessions(prev => {
        const hasUnread = data.lastMessageRole === 'user' && selectedSessionRef.current !== data.sessionId;
        const exists = prev.some(session => session.sessionId === data.sessionId);
        const next = exists
          ? prev.map(session => (
              session.sessionId === data.sessionId
                ? { ...session, ...data, hasUnread: hasUnread || session.hasUnread }
                : session
            ))
          : [{ mode: 'bot' as const, ...data, hasUnread }, ...prev];

        // If it's a new session and we're on page 1, keep it. Otherwise, it will show up on refetch or if they navigate.
        return next.sort((a, b) =>
          new Date(b.lastActivityAt || b.startedAt || 0).getTime() -
          new Date(a.lastActivityAt || a.startedAt || 0).getTime()
        ).slice(0, 10); // Keep it strictly 10 per page for UI consistency
      });

      if (data.lastMessageRole === 'user') {
        playDashboardSound('new_message');
      }
    });

    s.on('user:message:live', (data: {
      sessionId: string;
      text: string;
      visitorName?: string | null;
      timestamp: string;
    }) => {
      setMessages(prev => ({
        ...prev,
        [data.sessionId]: [
          ...(prev[data.sessionId] || []),
          {
            role: 'user',
            senderType: 'user',
            content: data.text,
            createdAt: data.timestamp,
            visitorName: data.visitorName,
          },
        ],
      }));

      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${data.visitorName || 'Visitor'} sent a message`, {
          body: data.text.substring(0, 80),
          icon: '/favicon.ico',
        });
      }

      setSessions(prev => prev.map(session =>
        session.sessionId === data.sessionId
          ? { ...session, hasUnread: selectedSessionRef.current !== data.sessionId }
          : session
      ));
    });

    s.on('agent:chunk', (data: {
      sessionId: string;
      text: string;
      agentName?: string | null;
      messageId?: string;
    }) => {
      setMessages(prev => ({
        ...prev,
        [data.sessionId]: [
          ...(prev[data.sessionId] || []),
          {
            id: data.messageId,
            role: 'assistant',
            senderType: 'human_agent',
            content: data.text,
            createdAt: new Date().toISOString(),
            agentName: data.agentName,
          },
        ],
      }));
    });

    s.on('session:closed', (data: { sessionId: string; reason: string }) => {
      setSessions(prev => prev.map(session =>
        session.sessionId === data.sessionId
          ? { ...session, mode: 'closed' as const }
          : session
      ));
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token]);

  const loadMessages = async (sessionId: string) => {
    const hist = await api.get<ChatMessage[]>(`/chat/session/${sessionId}/messages`);
    setMessages(prev => ({ ...prev, [sessionId]: hist.data }));
  };

  const handleSessionClick = async (sessionId: string) => {
    setSelectedSession(sessionId);
    setSessions(prev => prev.map(session =>
      session.sessionId === sessionId ? { ...session, hasUnread: false } : session
    ));
    socket?.emit('agent:join', { sessionId, agentToken: token });
    await loadMessages(sessionId);
  };

  const handleTakeover = async (sessionId: string) => {
    socket?.emit('agent:join', { sessionId, agentToken: token });
    socket?.emit('agent:takeover', { sessionId, agentToken: token });
    setSessions(prev => prev.map(session =>
      session.sessionId === sessionId ? { ...session, mode: 'human' } : session
    ));
    setSelectedSession(sessionId);
    playDashboardSound('takeover');
    await loadMessages(sessionId);
  };

  const handleHandback = (sessionId: string) => {
    socket?.emit('agent:handback', { sessionId, agentToken: token });
    setSessions(prev => prev.map(session =>
      session.sessionId === sessionId ? { ...session, mode: 'bot', agentName: null } : session
    ));
  };

  const handleCloseSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to end this chat session?')) return;
    
    try {
      await api.post(`/chat/${currentSession?.botId}/session/${sessionId}/close`, { reason: 'agent_ended' });
      socket?.emit('session:close', { sessionId, reason: 'agent_ended' });
      
      setSessions(prev => prev.map(session =>
        session.sessionId === sessionId ? { ...session, mode: 'closed' } : session
      ));
    } catch (err) {
      console.error('Failed to close session:', err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this chat history?')) return;
    try {
      try {
        if (currentSession?.botId) {
          await api.delete(`/bots/${currentSession.botId}/conversations/${sessionId}`);
        } else {
          await api.delete(`/chat/session/${sessionId}`);
        }
      } catch {
        await api.delete(`/chat/session/${sessionId}`);
      }
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      setSelectedSession(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const sendAgentMessage = () => {
    const text = replyText.trim();
    if (!text || !selectedSession) return;

    socket?.emit('agent:message', {
      sessionId: selectedSession,
      text,
      agentToken: token,
    });
    setReplyText('');
  };

  const currentSession = sessions.find(session => session.sessionId === selectedSession);
  const currentMessages = messages[selectedSession || ''] || [];
  const filteredSessions = sessions.filter(session =>
    filter === 'all' ? true : session.mode === filter
  );

  return (
    <div className="flex h-auto min-h-[calc(100vh-180px)] flex-col gap-4 lg:h-[calc(100vh-160px)] lg:flex-row">
      {/* Sessions Sidebar Column */}
      <div className={`flex w-full flex-col gap-3 lg:w-96 ${selectedSession ? 'hidden lg:flex' : 'flex'}`}>
        <div className="sticky top-0 z-10 mb-1 flex gap-2 bg-obsidian-950/95 py-1">
          {(['all', 'bot', 'human'] as const).map(item => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all"
              style={{
                background: filter === item ? 'rgba(245,143,124,0.18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === item ? 'rgba(245,143,124,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === item ? '#F58F7C' : 'rgba(255,255,255,0.5)',
              }}
            >
              {item === 'all' ? 'All' : item === 'bot' ? 'Bot' : 'Human'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar space-y-2.5">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Circle size={32} className="mb-3 text-white/15" />
              <p className="text-sm text-white/40">No active sessions</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredSessions.map(session => (
                <motion.div
                  key={session.sessionId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleSessionClick(session.sessionId)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border p-3.5 sm:p-4 transition-all hover:scale-[1.01]"
                  style={{
                    background: selectedSession === session.sessionId
                      ? 'rgba(245,143,124,0.08)'
                      : 'rgba(255,255,255,0.03)',
                    borderColor: selectedSession === session.sessionId
                      ? 'rgba(245,143,124,0.35)'
                      : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{
                          background: session.mode === 'closed' ? '#f87171' : session.mode === 'human' ? '#22c55e' : '#F58F7C',
                          boxShadow: `0 0 6px ${session.mode === 'closed' ? '#f87171' : session.mode === 'human' ? '#22c55e' : '#F58F7C'}`,
                        }}
                      />
                      <p className="truncate text-sm font-semibold text-white">
                        {session.visitorName || 'Anonymous Visitor'}
                      </p>
                      {session.hasUnread && (
                        <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                      )}
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                      style={{
                        background: session.mode === 'closed' ? 'rgba(248,113,113,0.15)' : session.mode === 'human' ? 'rgba(34,197,94,0.15)' : 'rgba(245,143,124,0.15)',
                        color: session.mode === 'closed' ? '#f87171' : session.mode === 'human' ? '#22c55e' : '#F58F7C',
                      }}
                    >
                      {session.mode === 'closed' ? 'Closed' : session.mode === 'human' ? 'Agent' : 'Bot'}
                    </span>
                  </div>
                  <p className="truncate pl-4 text-xs text-white/40 leading-relaxed italic">
                    {session.lastMessage || 'Waiting for first message...'}
                  </p>

                  {session.mode === 'bot' && (
                    <button
                      onClick={event => {
                        event.stopPropagation();
                        handleTakeover(session.sessionId);
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 py-1.5 text-xs font-bold text-emerald-500 transition-all hover:bg-emerald-500/20 active:scale-95"
                    >
                      <Zap size={13} />
                      Take Over
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination UI */}
        {pagination.totalPages > 1 && (
          <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60 transition-all hover:bg-white/10 disabled:opacity-30 disabled:grayscale"
            >
              Prev
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    page === i + 1 
                      ? 'bg-coral-500 text-white shadow-[0_0_12px_rgba(245,143,124,0.4)]' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60 transition-all hover:bg-white/10 disabled:opacity-30 disabled:grayscale"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Main Conversation Column */}
      <div className={`flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl relative ${!selectedSession ? 'hidden lg:flex' : 'flex'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-coral-500/[0.03] to-blush-500/[0.03] pointer-events-none" />
        
        {!selectedSession ? (
          <div className="flex h-full flex-col items-center justify-center p-8 sm:p-12 text-center">
            <div className="mb-6 flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-3xl border border-coral-500/20 bg-coral-500/10 shadow-[0_0_30px_rgba(245,143,124,0.15)]">
              <User size={32} className="text-coral-400" />
            </div>
            <h3 className="text-xl font-heading font-bold text-white">Select a Conversation</h3>
            <p className="mt-2 text-sm text-white/40 max-w-xs">Click on a visitor in the sidebar to view history or intervene in real-time.</p>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 bg-white/[0.02] p-4 sm:px-8 sm:py-5 z-10 backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedSession(null)}
                  className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white shrink-0"
                  aria-label="Back to conversations list"
                >
                  <ArrowLeft size={16} />
                </button>

                <div className="relative shrink-0">
                  <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-2xl border border-coral-500/20 bg-coral-500/10 text-sm sm:text-base font-black text-coral-400 shadow-inner">
                    {currentSession?.visitorName?.slice(0, 2).toUpperCase() || '??'}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-obsidian-950 ${currentSession?.mode === 'closed' ? 'bg-red-500' : currentSession?.mode === 'human' ? 'bg-emerald-500' : 'bg-coral-500'}`} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base sm:text-lg font-heading font-bold text-white leading-tight">
                    {currentSession?.visitorName || 'Anonymous Visitor'}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <p
                      className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md truncate max-w-[200px] sm:max-w-none"
                      style={{ 
                        background: currentSession?.mode === 'closed' ? 'rgba(248,113,113,0.1)' : currentSession?.mode === 'human' ? 'rgba(34,197,94,0.1)' : 'rgba(245,143,124,0.12)',
                        color: currentSession?.mode === 'closed' ? '#f87171' : currentSession?.mode === 'human' ? '#22c55e' : '#F58F7C' 
                      }}
                    >
                      {currentSession?.mode === 'closed' ? 'Chat Ended' : currentSession?.mode === 'human' ? 'Human Agent' : 'AI Assistant'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                {currentSession?.mode === 'closed' ? (
                  <button
                    onClick={() => handleDeleteSession(selectedSession)}
                    className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider sm:tracking-widest text-red-400 transition-all active:scale-95"
                    title="Permanently delete this closed chat history"
                  >
                    <Trash2 size={14} />
                    Delete Chat
                  </button>
                ) : (
                  <>
                    {currentSession?.mode === 'bot' ? (
                      <button
                        onClick={() => handleTakeover(selectedSession)}
                        className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider sm:tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 hover:shadow-emerald-500/40 active:scale-95"
                      >
                        <Zap size={14} />
                        Take Over
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHandback(selectedSession)}
                        className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-coral-500 to-blush-500 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider sm:tracking-widest text-white shadow-xl shadow-coral-500/20 transition-all hover:scale-105 hover:shadow-coral-500/40 active:scale-95"
                      >
                        <Bot size={14} />
                        Hand Back
                      </button>
                    )}
                    <button
                      onClick={() => handleCloseSession(selectedSession)}
                      className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-white/5 border border-red-500/20 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider sm:tracking-widest text-red-400 transition-all hover:bg-red-500/10 active:scale-95"
                      title="End this session permanently"
                    >
                      Close Chat
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 space-y-4 sm:space-y-6 overflow-y-auto p-4 sm:p-8 custom-scrollbar scroll-smooth">
              {currentMessages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className="flex h-8 sm:h-9 w-8 sm:w-9 flex-shrink-0 items-center justify-center rounded-xl border text-[10px] font-black shadow-lg"
                    style={{
                      background: msg.role === 'user'
                        ? 'rgba(242,196,206,0.18)'
                        : msg.senderType === 'human_agent'
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(245,143,124,0.18)',
                      color: msg.role === 'user'
                        ? '#F2C4CE'
                        : msg.senderType === 'human_agent'
                          ? '#22c55e'
                          : '#F58F7C',
                      borderColor: msg.role === 'user'
                        ? 'rgba(242,196,206,0.35)'
                        : msg.senderType === 'human_agent'
                          ? 'rgba(34,197,94,0.3)'
                          : 'rgba(245,143,124,0.35)',
                    }}
                  >
                    {msg.role === 'user' ? 'USR' : msg.senderType === 'human_agent' ? 'AGT' : 'BOT'}
                  </div>
                  <div className={`max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.senderType === 'human_agent' && (
                      <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80">
                        {msg.agentName || currentSession?.agentName || 'Agent'}
                      </p>
                    )}
                    <div
                      className="rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-2.5 sm:py-3 text-[13px] leading-relaxed shadow-xl border border-white/5 transition-all hover:border-white/10"
                      style={{
                        background: msg.role === 'user'
                          ? 'rgba(124,58,237,0.08)'
                          : msg.senderType === 'human_agent'
                            ? 'rgba(34,197,94,0.06)'
                            : 'rgba(255,255,255,0.03)',
                        color: 'rgba(255,255,255,0.95)',
                        borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      }}
                    >
                      {msg.content}
                    </div>
                    {msg.createdAt && (
                      <p className="mt-1.5 text-[9px] font-medium text-white/20 uppercase tracking-widest">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Conversation Input Bar */}
            <div className="border-t border-white/5 bg-white/[0.02] p-3.5 sm:p-6 backdrop-blur-md">
              {currentSession?.mode === 'closed' ? (
                <div className="py-3 sm:py-4 text-center rounded-2xl bg-red-500/5 border border-red-500/10">
                  <p className="flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-red-500/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    This chat session is closed
                  </p>
                </div>
              ) : currentSession?.mode === 'human' ? (
                <div className="flex gap-2.5 sm:gap-4">
                  <div className="relative flex-1">
                    <input
                      value={replyText}
                      onChange={event => setReplyText(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          sendAgentMessage();
                        }
                      }}
                      placeholder="Type response as agent..."
                      className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-6 py-3 sm:py-4 text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-white/[0.08] shadow-inner"
                    />
                    <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center gap-2">
                       <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Press Enter</span>
                    </div>
                  </div>
                  <button
                    onClick={sendAgentMessage}
                    disabled={!replyText.trim()}
                    className="flex h-11 w-11 sm:h-[52px] sm:w-[52px] items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 hover:shadow-emerald-500/40 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
              ) : (
                <div className="py-3 sm:py-4 text-center rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                  <p className="flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-coral-500/50 animate-pulse" />
                    AI Assistant is managing this chat
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245,143,124,0.3); }
      `}</style>
    </div>
  );
}
