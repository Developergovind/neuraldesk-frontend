'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Clock, Download, Search, User } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'

export default function LeadsTab({ botId }: { botId: string }) {
  const [search, setSearch] = useState('')

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['bot-leads', botId],
    queryFn: () => api.get(`/bots/${botId}/leads`).then(r => r.data),
  })

  const filtered = leads.filter((l: any) =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  )

  // CSV export
  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Total Sessions',
                     'Total Messages', 'First Seen', 'Last Seen', 'Last Question']
    const rows = filtered.map((l: any) => [
      l.name, l.email || '', l.totalSessions, l.totalMessages,
      format(new Date(l.firstSeen), 'yyyy-MM-dd'),
      format(new Date(l.lastSeen), 'yyyy-MM-dd'),
      `"${(l.lastQuestion || '').replace(/"/g, '""')}"`,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `leads-${botId}-${Date.now()}.csv`; a.click()
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-white font-semibold text-base">
            Captured Leads
          </h3>
          <p className="text-white/40 text-xs mt-0.5">
            {leads.length} unique visitors who chatted with your bot
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                     transition-all hover:opacity-80"
          style={{ background: 'rgba(0,212,255,0.1)',
                   border: '1px solid rgba(0,212,255,0.25)',
                   color: '#00d4ff' }}
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.04)',
                   border: '1px solid rgba(255,255,255,0.08)',
                   color: 'white' }}
        />
      </div>

      {/* Leads Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({length: 5}).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse"
                 style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <User size={36} style={{ color: 'rgba(255,255,255,0.15)' }} className="mb-3" />
          <p className="text-white/40">No leads captured yet</p>
          <p className="text-white/25 text-xs mt-1">
            Leads appear when visitors enter their name in the chat widget
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead: any, i: number) => (
            <motion.div
              key={lead.email || lead.name + i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{ background: 'rgba(255,255,255,0.03)',
                       borderColor: 'rgba(255,255,255,0.07)' }}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0"
                   style={{ background: 'rgba(0,212,255,0.12)',
                            border: '1px solid rgba(0,212,255,0.2)',
                            color: '#00d4ff' }}>
                {lead.name?.slice(0,2).toUpperCase()}
              </div>

              {/* Name + Email */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{lead.name}</p>
                {lead.email ? (
                  <p className="text-xs flex items-center gap-1 mt-0.5"
                     style={{ color: 'rgba(0,212,255,0.6)' }}>
                    <Mail size={10} /> {lead.email}
                  </p>
                ) : (
                  <p className="text-xs text-white/25 mt-0.5">No email provided</p>
                )}
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">
                    {lead.totalSessions}
                  </p>
                  <p className="text-white/30 text-xs">sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">
                    {lead.totalMessages}
                  </p>
                  <p className="text-white/30 text-xs">messages</p>
                </div>
                <div className="text-center">
                  <p className="text-white/50 text-xs">Last seen</p>
                  <p className="text-white text-xs font-medium">
                    {formatDistanceToNow(new Date(lead.lastSeen), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Last Question */}
              <div className="hidden lg:block max-w-[200px]">
                <p className="text-white/30 text-xs mb-1">Last question</p>
                <p className="text-white/60 text-xs truncate">
                  "{lead.lastQuestion || '—'}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
