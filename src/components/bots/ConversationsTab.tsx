'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Clock, User, Bot, Search, 
         ChevronRight, Zap, TrendingUp, Calendar, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { api } from '@/lib/api'
import { useConversations, useConversationThread, useConversationStats } from '@/lib/hooks/useConversations'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

interface ConversationsTabProps {
  botId: string
}

// ─── Stats Cards ────────────────────────────────────────────
function StatsCards({ botId }: { botId: string }) {
  const { data } = useConversationStats(botId)

  const stats = [
    { label: 'Total Sessions', value: data?.totalSessions ?? 0, icon: MessageSquare, color: '#00d4ff' },
    { label: 'Total Messages', value: data?.totalMessages ?? 0, icon: TrendingUp, color: '#7c3aed' },
    { label: 'Avg / Session', value: data?.avgMessagesPerSession?.toFixed(1) ?? '0', icon: Zap, color: '#00d4ff' },
    { label: 'Sessions Today', value: data?.sessionsToday ?? 0, icon: Calendar, color: '#7c3aed' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl p-4 border"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon size={14} style={{ color: stat.color }} />
            <span className="text-xs text-white/40">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Session Card ────────────────────────────────────────────
function SessionCard({
  session, isSelected, onClick
}: {
  session: any, isSelected: boolean, onClick: () => void
}) {
  const initials = session.visitorName ? session.visitorName.slice(0, 2).toUpperCase() : '??'
  
  return (
    <motion.div
      layout
      onClick={onClick}
      className="p-4 rounded-xl border cursor-pointer transition-all mb-2"
      style={{
        background: isSelected
          ? 'rgba(0, 212, 255, 0.08)'
          : 'rgba(255,255,255,0.03)',
        borderColor: isSelected
          ? 'rgba(0, 212, 255, 0.3)'
          : 'rgba(255,255,255,0.06)',
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
             style={{ 
               background: 'rgba(0,212,255,0.15)', 
               color: '#00d4ff',
               border: '1px solid rgba(0,212,255,0.25)' 
             }}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-sm font-semibold text-white truncate">
              {session.visitorName || 'Anonymous Visitor'}
            </p>
            <span className="text-[10px] text-white/30 whitespace-nowrap">
              {formatDistanceToNow(new Date(session.startedAt), { addSuffix: false })}
            </span>
          </div>
          
          {session.visitorEmail && (
            <p className="text-[11px] truncate mb-1.5" style={{ color: 'rgba(0,212,255,0.6)' }}>
              {session.visitorEmail}
            </p>
          )}

          <p className="text-xs text-white/40 truncate">
            "{session.firstQuestion || 'No messages yet'}"
          </p>
          
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-white/20 flex items-center gap-1">
              <MessageSquare size={10} />
              {session.messageCount} messages
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: session.status === 'closed' ? 'rgba(248,113,113,0.12)' : 'rgba(34,197,94,0.12)',
                color: session.status === 'closed' ? '#f87171' : '#22c55e',
                border: `1px solid ${session.status === 'closed' ? 'rgba(248,113,113,0.25)' : 'rgba(34,197,94,0.25)'}`,
              }}>
              {session.status === 'closed' ? '🔒 Closed' : '🟢 Active'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Message Bubble ──────────────────────────────────────────
function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: isUser
            ? 'rgba(124, 58, 237, 0.3)'
            : 'rgba(0, 212, 255, 0.2)',
          border: `1px solid ${isUser ? 'rgba(124,58,237,0.4)' : 'rgba(0,212,255,0.3)'}`,
        }}
      >
        {isUser
          ? <User size={12} style={{ color: '#7c3aed' }} />
          : <Bot size={12} style={{ color: '#00d4ff' }} />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isUser
              ? 'rgba(124, 58, 237, 0.2)'
              : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isUser ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.08)'}`,
            color: 'rgba(255,255,255,0.9)',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          }}
        >
          {message.content}
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-white/25">
            {format(new Date(message.createdAt), 'h:mm a')}
          </span>
          {message.responseTimeMs && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(0,212,255,0.4)' }}>
              <Zap size={9} />
              {message.responseTimeMs < 1000
                ? `${message.responseTimeMs}ms`
                : `${(message.responseTimeMs / 1000).toFixed(1)}s`}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function ConversationsTab({ botId }: ConversationsTabProps) {
  const queryClient = useQueryClient()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'closed'>('all')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Sessions list
  const { data: sessionsData, isLoading } = useConversations(botId, page, debouncedSearch)

  // Selected session messages
  const { data: threadData } = useConversationThread(botId, selectedSessionId)

  return (
    <div>
      {/* Stats */}
      <StatsCards botId={botId} />

      <div className="flex items-center gap-2 mb-4">
        {['all', 'active', 'closed'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f as any)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
            style={{
              background: activeFilter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeFilter === f ? '#fff' : 'rgba(255,255,255,0.4)',
              border: activeFilter === f ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
      </div>

      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row gap-4 h-[600px]">

        {/* Left: Sessions List */}
        <div className="w-full lg:w-2/5 overflow-y-auto pr-1 flex flex-col">
          {isLoading ? (
            // Skeleton
            Array.from({length: 5}).map((_, i) => (
              <div key={i} className="h-16 rounded-xl mb-2 animate-pulse"
                   style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))
          ) : sessionsData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare size={32} className="text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No conversations yet</p>
              <p className="text-white/25 text-xs mt-1">
                Conversations will appear here once users start chatting
              </p>
            </div>
          ) : (
            <>
              {sessionsData?.data
                ?.filter((s: any) => activeFilter === 'all' ? true : s.status === activeFilter)
                ?.map((session: any) => (
                  <SessionCard
                    key={session.sessionId}
                    session={session}
                    isSelected={selectedSessionId === session.sessionId}
                    onClick={() => setSelectedSessionId(session.sessionId)}
                  />
                ))}
              {/* Pagination */}
              {sessionsData?.totalPages > 1 && (
                <div className="flex gap-2 mt-3 justify-center">
                  {Array.from({ length: sessionsData.totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: page === i + 1
                          ? 'rgba(0,212,255,0.2)'
                          : 'rgba(255,255,255,0.05)',
                        color: page === i + 1 ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${page === i + 1 ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Message Thread */}
        <div
          className="flex-1 rounded-xl overflow-hidden flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {!selectedSessionId ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <MessageSquare size={24} style={{ color: '#00d4ff' }} />
              </div>
              <p className="text-white/50 font-medium">Select a conversation</p>
              <p className="text-white/25 text-sm mt-1">
                Click any session on the left to view the full chat
              </p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="px-4 py-3 border-b flex items-center gap-3"
                   style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                     style={{ 
                       background: 'rgba(0,212,255,0.15)', 
                       color: '#00d4ff',
                       border: '1px solid rgba(0,212,255,0.25)' 
                     }}>
                  {threadData?.session?.visitorName?.slice(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {threadData?.session?.visitorName || 'Anonymous Visitor'}
                  </p>
                  <div className="flex items-center gap-3">
                    {threadData?.session?.visitorEmail && (
                      <p className="text-[11px]" style={{ color: 'rgba(0,212,255,0.7)' }}>
                        ✉ {threadData.session.visitorEmail}
                      </p>
                    )}
                    <p className="text-[11px] text-white/30">
                      {threadData?.session?.startedAt
                        ? format(new Date(threadData.session.startedAt), 'MMM d, h:mm a')
                        : ''}
                      · {threadData?.messages?.length ?? 0} messages
                    </p>
                  </div>
                </div>
              </div>

              {/* Closed Banner */}
              {threadData?.session?.status === 'closed' && (
                <div className="px-4 py-2 flex items-center gap-2 text-xs"
                  style={{ background: 'rgba(248,113,113,0.06)', borderBottom: '1px solid rgba(248,113,113,0.15)' }}>
                  <span style={{ color: '#f87171' }}>🔒 Chat ended</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/40">
                    {({
                      user_ended: 'User ended the chat',
                      inactivity: 'Closed due to inactivity',
                      tab_closed: 'User closed the tab',
                      disconnect: 'Connection lost',
                      agent_ended: 'Agent ended the chat',
                    } as any)[threadData.session.closeReason] || 'Chat ended'}
                  </span>
                  {threadData.session.closedAt && (
                    <span className="text-white/25 ml-auto">
                      {format(new Date(threadData.session.closedAt), 'MMM d, h:mm a')}
                    </span>
                  )}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence>
                  {threadData?.messages?.map((msg: any) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </AnimatePresence>
              </div>

              <div className="p-4 border-t bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] text-white/30 text-center italic">
                  This is a read-only history view. To message the visitor in real-time, please use the <a href="/dashboard/inbox" className="text-[#00d4ff] hover:underline">Live Inbox</a>.
                </p>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

