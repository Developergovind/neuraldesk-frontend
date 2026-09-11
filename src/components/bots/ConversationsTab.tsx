'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MessageSquare, Clock, User, Bot, Search, 
         ChevronRight, Zap, TrendingUp, Calendar, Send, Loader2, Trash2, AlertTriangle, X } from 'lucide-react'
import { safeFormat, safeFormatDistanceToNow } from '@/lib/utils'
import { api } from '@/lib/api'
import { useConversations, useConversationThread, useConversationStats, useDeleteConversation, useClearAllConversations } from '@/lib/hooks/useConversations'
import { useQueryClient } from '@tanstack/react-query'
import { PageLoader } from '@/components/ui/Loader'
import toast from 'react-hot-toast'

interface ConversationsTabProps {
  botId: string
}

// ─── Stats Cards ────────────────────────────────────────────
function StatsCards({ botId }: { botId: string }) {
  const { data } = useConversationStats(botId)

  const stats = [
    { label: 'Total Sessions', value: data?.totalSessions ?? 0, icon: MessageSquare, color: '#F58F7C' },
    { label: 'Total Messages', value: data?.totalMessages ?? 0, icon: TrendingUp, color: '#F2C4CE' },
    { label: 'Avg / Session', value: data?.avgMessagesPerSession?.toFixed(1) ?? '0', icon: Zap, color: '#F58F7C' },
    { label: 'Sessions Today', value: data?.sessionsToday ?? 0, icon: Calendar, color: '#F2C4CE' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl p-3 sm:p-4 border"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <stat.icon size={14} style={{ color: stat.color }} />
            <span className="text-[11px] sm:text-xs text-white/40 truncate">{stat.label}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Session Card ────────────────────────────────────────────
function SessionCard({
  session, isSelected, onClick, onDelete
}: {
  session: any, isSelected: boolean, onClick: () => void, onDelete: (e: React.MouseEvent) => void
}) {
  const initials = session.visitorName ? session.visitorName.slice(0, 2).toUpperCase() : '??'
  
  return (
    <motion.div
      layout
      onClick={onClick}
      className="group relative p-4 rounded-xl border cursor-pointer transition-all mb-2"
      style={{
        background: isSelected
          ? 'rgba(245, 143, 124, 0.1)'
          : 'rgba(255,255,255,0.03)',
        borderColor: isSelected
          ? 'rgba(245, 143, 124, 0.35)'
          : 'rgba(255,255,255,0.06)',
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
             style={{ 
               background: 'rgba(245,143,124,0.18)', 
               color: '#F58F7C',
               border: '1px solid rgba(245,143,124,0.3)' 
             }}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-sm font-semibold text-white truncate">
              {session.visitorName || 'Anonymous Visitor'}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-white/30 whitespace-nowrap">
                {safeFormatDistanceToNow(session.startedAt, { addSuffix: false })}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(e)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all ml-0.5"
                title="Delete this conversation"
                aria-label="Delete conversation"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          
          {session.visitorEmail && (
            <p className="text-[11px] truncate mb-1.5" style={{ color: 'rgba(245,143,124,0.75)' }}>
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
            ? 'rgba(242, 196, 206, 0.25)'
            : 'rgba(245, 143, 124, 0.2)',
          border: `1px solid ${isUser ? 'rgba(242,196,206,0.4)' : 'rgba(245,143,124,0.35)'}`,
        }}
      >
        {isUser
          ? <User size={12} style={{ color: '#F2C4CE' }} />
          : <Bot size={12} style={{ color: '#F58F7C' }} />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isUser
              ? 'rgba(242, 196, 206, 0.15)'
              : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isUser ? 'rgba(242,196,206,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: 'rgba(255,255,255,0.9)',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          }}
        >
          {message.content}
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-white/25">
            {safeFormat(message.createdAt, 'h:mm a')}
          </span>
          {message.responseTimeMs && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(245,143,124,0.6)' }}>
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
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'closed'>('all')

  // Deletion modals state
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; name: string } | null>(null)
  const [showClearAllModal, setShowClearAllModal] = useState(false)

  const deleteConversation = useDeleteConversation(botId)
  const clearAllConversations = useClearAllConversations(botId)

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

  const handleDeleteConfirmed = () => {
    if (!sessionToDelete) return
    const id = sessionToDelete.id
    deleteConversation.mutate(id, {
      onSuccess: () => {
        if (selectedSessionId === id) {
          setSelectedSessionId(null)
        }
        setSessionToDelete(null)
      },
    })
  }

  const handleClearAllConfirmed = () => {
    clearAllConversations.mutate(undefined, {
      onSuccess: () => {
        setSelectedSessionId(null)
        setShowClearAllModal(false)
      },
    })
  }

  const filteredList = sessionsData?.data?.filter((s: any) => 
    activeFilter === 'all' ? true : s.status === activeFilter
  ) || []

  return (
    <div>
      {/* Stats */}
      <StatsCards botId={botId} />

      {/* Filter and Clear All Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
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

        {sessionsData?.data && sessionsData.data.length > 0 && (
          <button
            onClick={() => setShowClearAllModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all self-start sm:self-auto"
            title="Clear all conversations for this bot"
          >
            <Trash2 size={12} />
            <span>Clear History</span>
          </button>
        )}
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
          onFocus={e => (e.target.style.borderColor = 'rgba(245,143,124,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
      </div>

      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-[500px] h-auto lg:h-[600px]">

        {/* Left: Sessions List */}
        <div className={`w-full lg:w-2/5 overflow-y-auto pr-1 flex flex-col ${selectedSessionId ? 'hidden lg:flex' : 'flex'}`}>
          {isLoading ? (
            <PageLoader
              text="Loading Conversations..."
              subtext="Retrieving visitor sessions and chat threads"
              minHeight="min-h-[260px]"
            />
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <MessageSquare size={32} className="text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No conversations yet</p>
              <p className="text-white/25 text-xs mt-1">
                Conversations will appear here once visitors start chatting
              </p>
            </div>
          ) : (
            <>
              {filteredList.map((session: any) => (
                <SessionCard
                  key={session.sessionId}
                  session={session}
                  isSelected={selectedSessionId === session.sessionId}
                  onClick={() => setSelectedSessionId(session.sessionId)}
                  onDelete={(e) => {
                    setSessionToDelete({
                      id: session.sessionId,
                      name: session.visitorName || 'Anonymous Visitor',
                    })
                  }}
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
                          ? 'rgba(245,143,124,0.25)'
                          : 'rgba(255,255,255,0.05)',
                        color: page === i + 1 ? '#F58F7C' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${page === i + 1 ? 'rgba(245,143,124,0.4)' : 'transparent'}`,
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
          className={`flex-1 rounded-2xl overflow-hidden flex flex-col min-h-[450px] ${!selectedSessionId ? 'hidden lg:flex' : 'flex'}`}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {!selectedSessionId ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background: 'rgba(245,143,124,0.1)', border: '1px solid rgba(245,143,124,0.2)' }}>
                <MessageSquare size={24} style={{ color: '#F58F7C' }} />
              </div>
              <p className="text-white/50 font-medium">Select a conversation</p>
              <p className="text-white/25 text-sm mt-1">
                Click any session on the left to view the full chat
              </p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between gap-3"
                   style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedSessionId(null)}
                    className="lg:hidden p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white shrink-0"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                       style={{ 
                         background: 'rgba(245,143,124,0.18)', 
                         color: '#F58F7C',
                         border: '1px solid rgba(245,143,124,0.3)' 
                       }}>
                    {threadData?.session?.visitorName?.slice(0, 2).toUpperCase() || '??'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {threadData?.session?.visitorName || 'Anonymous Visitor'}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      {threadData?.session?.visitorEmail && (
                        <p className="text-[11px] truncate" style={{ color: 'rgba(245,143,124,0.8)' }}>
                          ✉ {threadData.session.visitorEmail}
                        </p>
                      )}
                      <p className="text-[11px] text-white/30">
                        {threadData?.session?.startedAt
                          ? safeFormat(threadData.session.startedAt, 'MMM d, h:mm a')
                          : ''}
                        · {threadData?.messages?.length ?? 0} msgs
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delete Thread Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSessionToDelete({
                        id: selectedSessionId,
                        name: threadData?.session?.visitorName || 'Anonymous Visitor',
                      })
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-white/50 hover:text-red-400 text-xs font-medium transition-all active:scale-95"
                    title="Delete this conversation"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
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
                      {safeFormat(threadData.session.closedAt, 'MMM d, h:mm a')}
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
                  This is a read-only history view. To message the visitor in real-time, please use the <a href="/dashboard/inbox" className="text-coral-400 hover:underline">Live Inbox</a>.
                </p>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Delete Single Conversation Modal */}
      <AnimatePresence>
        {sessionToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSessionToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm p-6 rounded-3xl bg-[#0f0e13] border border-white/10 shadow-2xl z-10 space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-heading font-bold text-white">Delete Conversation?</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  Are you sure you want to delete the conversation with <span className="text-white font-medium">"{sessionToDelete.name}"</span>? All messages in this session will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  disabled={deleteConversation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {deleteConversation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All History Modal */}
      <AnimatePresence>
        {showClearAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearAllModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm p-6 rounded-3xl bg-[#0f0e13] border border-red-500/20 shadow-2xl z-10 space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-heading font-bold text-white">Clear All Conversations?</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  This will permanently delete <span className="text-white font-medium">all past conversation sessions</span> for this assistant. This action cannot be reversed.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowClearAllModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllConfirmed}
                  disabled={clearAllConversations.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {clearAllConversations.isPending ? "Clearing..." : "Clear All"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}


