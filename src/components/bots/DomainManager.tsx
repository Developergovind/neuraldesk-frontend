'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, Trash2, Shield, ShieldOff, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function DomainManager({ botId }: { botId: string }) {
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bot-domains', botId],
    queryFn: () => api.get(`/bots/${botId}/domains`).then((r) => r.data),
  });

  const { mutate: updateDomains, isPending } = useMutation({
    mutationFn: (payload: { domains: string[]; restrictionEnabled: boolean }) =>
      api.patch(`/bots/${botId}/domains`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bot-domains', botId] });
      toast.success('Domain settings updated');
    },
    onError: () => {
      toast.error('Failed to update domain settings');
    },
  });

  const domains: string[] = data?.domains || [];
  const restrictionEnabled: boolean = data?.restrictionEnabled || false;

  function validateDomain(d: string): boolean {
    // Allow: example.com, *.example.com, www.example.com
    return /^(\*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/i.test(d.trim());
  }

  function addDomain() {
    const d = newDomain.trim().toLowerCase();
    if (!d) return;
    if (!validateDomain(d)) {
      setError('Invalid domain format. Use: example.com or *.example.com');
      return;
    }
    if (domains.includes(d)) {
      setError('Domain already added.');
      return;
    }
    setError('');
    updateDomains({ domains: [...domains, d], restrictionEnabled });
    setNewDomain('');
  }

  function removeDomain(d: string) {
    updateDomains({ domains: domains.filter((x) => x !== d), restrictionEnabled });
  }

  function toggleRestriction() {
    updateDomains({ domains, restrictionEnabled: !restrictionEnabled });
  }

  return (
    <div
      className="rounded-3xl p-8"
      style={{
        background: 'rgba(13,13,26,0.6)',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.2)',
            }}
          >
            <Shield size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-heading font-bold text-lg">Domain Security</h3>
            <p className="text-white/40 text-xs">Control which websites can embed your bot</p>
          </div>
        </div>

        {/* Toggle restriction on/off */}
        <button
          onClick={toggleRestriction}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          style={{
            background: restrictionEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${restrictionEnabled ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: restrictionEnabled ? '#10b981' : 'rgba(255,255,255,0.4)',
          }}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : restrictionEnabled ? (
            <>
              <Shield size={14} /> Protection ON
            </>
          ) : (
            <>
              <ShieldOff size={14} /> Protection OFF
            </>
          )}
        </button>
      </div>

      {/* Status Banner */}
      <div
        className="mb-8 p-4 rounded-2xl flex items-start gap-3 transition-all duration-500"
        style={{
          background: restrictionEnabled ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.05)',
          border: `1px solid ${restrictionEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
        }}
      >
        <div className="mt-0.5">
          {restrictionEnabled ? (
            <Check size={16} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={16} className="text-amber-400" />
          )}
        </div>
        <div>
          <p
            className="text-xs font-medium leading-relaxed"
            style={{
              color: restrictionEnabled ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)',
            }}
          >
            {restrictionEnabled
              ? domains.length === 0
                ? 'Security alert: Protection is ON but no domains are whitelisted. Your bot is currently blocked on all websites! Add your domain below to fix this.'
                : `Security active: Your bot will only load on the ${domains.length} verified domain(s) listed below.`
              : 'Warning: Protection is OFF. Anyone can copy your embed code and use your bot on their own website. We recommend enabling domain restriction for production.'}
          </p>
        </div>
      </div>

      {/* Add domain input */}
      <div className="mb-8">
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">
          Whitelist New Domain
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <Globe
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-cyan-400"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            />
            <input
              value={newDomain}
              onChange={(e) => {
                setNewDomain(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && addDomain()}
              placeholder="e.g. yourwebsite.com"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none text-white placeholder-white/20 transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
              }}
            />
          </div>
          <button
            onClick={addDomain}
            disabled={!newDomain || isPending}
            className="px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: newDomain ? 'linear-gradient(135deg, #00d4ff, #7c3aed)' : 'rgba(255,255,255,0.05)',
              color: newDomain ? '#fff' : 'rgba(255,255,255,0.2)',
              boxShadow: newDomain ? '0 10px 20px -5px rgba(0,212,255,0.3)' : 'none',
            }}
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add
          </button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-bold text-red-400 mt-2 ml-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Domains list */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 block">
          Authorized Domains
        </label>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              />
            ))}
          </div>
        ) : domains.length === 0 ? (
          <div
            className="py-12 text-center rounded-2xl border border-dashed border-white/5"
            style={{ background: 'rgba(255,255,255,0.01)' }}
          >
            <Globe size={32} className="mx-auto mb-3 opacity-10" />
            <p className="text-white/20 text-sm font-medium">No domains whitelisted yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="popLayout">
              {domains.map((domain) => (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="flex items-center justify-between px-5 py-4 rounded-2xl group transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
                    <span className="text-white/70 text-sm font-mono tracking-tight">{domain}</span>
                  </div>
                  <button
                    onClick={() => removeDomain(domain)}
                    className="text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-all p-2 rounded-xl active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-8 p-4 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Wildcard Support</h4>
        <p className="text-[11px] text-white/20 leading-relaxed">
          Add <code className="text-cyan-400/50 bg-white/5 px-1.5 py-0.5 rounded">mysite.com</code> for exact domain
          matching. Use <code className="text-cyan-400/50 bg-white/5 px-1.5 py-0.5 rounded">*.mysite.com</code> to
          automatically authorize all subdomains (e.g. app.mysite.com, shop.mysite.com).
        </p>
      </div>
    </div>
  );
}
