'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Building2, CalendarDays } from 'lucide-react';
import { ActionButton, panel, StatusBadge } from './ExecutionUi';

export interface ActiveCampaignItem {
  id: string | number; campaignId?: string; title: string; brand: string; logoUrl?: string; industry: string;
  stage: 'IN_PRODUCTION' | 'CONTENT_REVIEW' | 'READY_TO_PUBLISH' | 'COMPLETED';
  deadline: string; payout: string; payoutAmount?: number; progress: number;
  deliverables: { title: string; completed: boolean }[]; verifiedBrand: boolean; contractBrief: string;
  action?: string; message?: string; state?: string; overdue?: boolean;
}
export default function ActiveCampaignCard({ campaign: c, onUploadSubmit }: { campaign: ActiveCampaignItem; onUploadSubmit: (id: string | number) => void }) {
  const complete = c.deliverables.filter(d => d.completed).length;
  const isOverdue = c.overdue || c.state === 'ACTION_REQUIRED';
  return <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${panel} overflow-hidden p-5 shadow-xl transition hover:border-purple-500/40 sm:p-6`}>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/10">
          {c.logoUrl ? <img src={c.logoUrl} alt={`${c.brand} logo`} className="h-full w-full object-cover" /> : <Building2 className="h-6 w-6 text-purple-300" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-purple-300">{c.brand}</p>
          <h3 className="mt-1 text-lg font-bold text-white">{c.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{c.campaignId ? `#${c.campaignId.slice(0, 8)} · ` : ''}{c.industry}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isOverdue && <span className="inline-flex rounded-full border border-rose-500/40 bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300 animate-pulse">⚠ OVERDUE</span>}
        <StatusBadge status={c.state || c.stage} />
      </div>
    </header>
    <div className="my-5 grid grid-cols-2 gap-4 rounded-xl border border-white/5 bg-slate-950/50 p-4">
      <div>
        <p className="text-xs text-slate-400">Submission deadline</p>
        <p className={`mt-1 flex items-center gap-2 text-sm font-semibold ${isOverdue ? 'text-rose-300 font-bold' : 'text-white'}`}>
          <CalendarDays className="h-4 w-4" />{c.deadline}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400">Campaign value</p>
        <p className="mt-1 text-lg font-bold text-emerald-300">{c.payout}</p>
      </div>
    </div>
    <div className="space-y-1.5">
      <p className="text-xs text-slate-400 font-medium">Deliverables</p>
      <div className="flex flex-wrap gap-2">
        {c.deliverables.map((d, i) => (
          <span key={i} className={`rounded-lg border px-2.5 py-1.5 text-xs ${d.completed ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-slate-950/50 text-slate-300'}`}>
            {d.completed ? '✓ ' : ''}{d.title}
          </span>
        ))}
      </div>
    </div>
    <div className="mt-5 flex justify-between text-xs text-slate-400">
      <span>{complete} / {c.deliverables.length} deliverables complete</span>
      <span className="font-semibold text-purple-300">{c.progress}%</span>
    </div>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-950">
      <motion.div initial={{ width: 0 }} animate={{ width: `${c.progress}%` }} className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400" />
    </div>
    <footer className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
      <p className={`text-sm ${isOverdue || c.state === 'REVISION_REQUIRED' ? 'text-amber-200 font-medium' : 'text-slate-400'}`}>
        {c.message}
      </p>
      <div className="flex items-center gap-2">
        {c.action && c.action !== 'View Campaign' && (
          <button
            type="button"
            onClick={() => onUploadSubmit(c.id)}
            className="rounded-xl border border-white/10 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            View Brief
          </button>
        )}
        <ActionButton onClick={() => onUploadSubmit(c.id)}>
          {c.action || 'View Campaign'}<ArrowUpRight className="h-4 w-4" />
        </ActionButton>
      </div>
    </footer>
  </motion.article>;
}
