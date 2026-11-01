'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Building2, CalendarDays, Loader2, Sparkles } from 'lucide-react';

export interface ActiveCampaignItem {
  id: string | number; campaignId?: string; title: string; brand: string; logoUrl?: string; industry: string;
  stage: 'IN_PRODUCTION' | 'CONTENT_REVIEW' | 'READY_TO_PUBLISH' | 'COMPLETED';
  deadline: string; payout: string; payoutAmount?: number;
  originalPayout?: string; originalPayoutAmount?: number; originalCurrency?: string;
  progress: number;
  deliverables: { title: string; completed: boolean }[]; verifiedBrand: boolean; contractBrief: string;
  action?: string; message?: string; state?: string; overdue?: boolean;
}

export default function ActiveCampaignCard({
  campaign: c,
  onUploadSubmit,
}: {
  campaign: ActiveCampaignItem;
  onUploadSubmit: (id: string | number) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const complete = c.deliverables.filter((d) => d.completed).length;
  const isOverdue = c.overdue || c.state === 'ACTION_REQUIRED';

  const handleClick = () => {
    setIsLoading(true);
    onUploadSubmit(c.id);
  };

  const getActionConfig = () => {
    if (c.state === 'DELETED') return { label: 'View Records', className: 'bg-slate-900/90 hover:bg-slate-800 border border-rose-500/25 text-slate-300 hover:text-white', iconClass: 'text-rose-400' };
    if (c.stage === 'COMPLETED' || c.state === 'COMPLETED') {
      return {
        label: 'View Brief',
        className:
          'bg-slate-900/90 light:bg-white hover:bg-purple-950/50 light:hover:bg-slate-50 border border-purple-500/25 light:border-slate-200 hover:border-purple-400/50 light:hover:border-slate-300 text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 shadow-sm hover:shadow-md hover:shadow-purple-950/40',
        iconClass: 'text-purple-400 light:text-purple-600 group-hover/action:text-purple-300 light:group-hover/action:text-purple-700',
      };
    }
    if (c.stage === 'CONTENT_REVIEW' || c.state === 'UNDER_REVIEW') {
      return {
        label: 'View Submission',
        className:
          'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white keep-white shadow-lg shadow-purple-950/50 hover:shadow-purple-900/70',
        iconClass: 'text-white/90',
      };
    }
    if (c.stage === 'READY_TO_PUBLISH' || c.state === 'AWAITING_PUBLICATION') {
      return {
        label: 'Submit Published URL',
        className:
          'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white keep-white shadow-lg shadow-purple-950/50 hover:shadow-purple-900/70',
        iconClass: 'text-white/90',
      };
    }
    if (c.state === 'REVISION_REQUIRED') {
      return {
        label: 'Fix & Resubmit',
        className:
          'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:via-pink-500 hover:to-purple-500 text-white keep-white shadow-lg shadow-rose-950/50 hover:shadow-rose-900/70',
        iconClass: 'text-white/90',
      };
    }
    return {
      label: 'Submit Deliverable',
      className:
        'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white keep-white shadow-lg shadow-purple-950/50 hover:shadow-purple-900/70',
      iconClass: 'text-white/90',
    };
  };

  const actionConfig = getActionConfig();

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-visible mt-4 rounded-2xl bg-slate-950/45 light:bg-white border border-white/10 light:border-slate-200/90 backdrop-blur-xl shadow-xl light:shadow-sm p-5 sm:p-6 pr-6 sm:pr-8 hover:border-purple-500/40 light:hover:border-purple-300 light:hover:shadow-md transition-all group space-y-4"
    >
      {/* Floating Status Badge Overlapping Top-Right Corner */}
      <div
        className="absolute right-6 sm:right-8 z-20 pointer-events-none flex items-center gap-2"
        style={{ top: '0px', transform: 'translateY(-50%)' }}
      >
        {isOverdue && (
          <span className="px-3 py-1 rounded-full border border-rose-400/50 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white keep-white text-xs font-black tracking-wide shadow-xl shadow-rose-950/80 ring-4 ring-[#080B14] light:ring-white flex items-center gap-1">
            ⚠ Overdue
          </span>
        )}
        <span
          className={`px-3.5 sm:px-4 py-1.5 rounded-full border text-xs sm:text-sm font-black tracking-wide text-white keep-white flex items-center gap-1.5 shadow-xl ring-4 ring-[#080B14] light:ring-white ${
            /REVISION|REJECT|CANCEL|FAIL/.test(c.state || c.stage)
              ? 'border-rose-400/50 bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-950/80'
              : /VERIFIED|COMPLETED|APPROVED/.test(c.state || c.stage)
              ? 'border-emerald-400/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 shadow-emerald-950/80'
              : 'border-purple-400/50 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 shadow-purple-950/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
          <span>{(c.state || c.stage).replace(/_/g, ' ')}</span>
        </span>
      </div>

      {/* Header Row: Logo covering text height (Left) and Campaign Value (Right) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3.5 sm:gap-4 items-stretch min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center overflow-hidden rounded-2xl border border-purple-500/30 light:border-slate-200 bg-gradient-to-br from-purple-900/60 to-slate-900 light:from-purple-50 light:to-indigo-50 shadow-md">
            {c.logoUrl ? (
              <img src={c.logoUrl} alt={`${c.brand} logo`} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-purple-300 light:text-purple-600" />
            )}
          </div>
          <div className="min-w-0 flex flex-col justify-between py-0.5">
            <p className="text-xs font-bold text-purple-300 light:text-purple-700">{c.brand}</p>
            <h3 className="text-base sm:text-lg font-bold text-white light:text-slate-900 truncate leading-snug">
              {c.title}
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500 font-medium">
              {c.industry}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right self-end sm:self-center">
          <span className="text-2xl sm:text-3xl font-black text-white light:text-slate-900 tracking-tight">
            {c.payout}
          </span>
          {c.originalPayout && (
            <span className="block text-[11px] font-semibold text-slate-400 light:text-slate-500">
              ≈ {c.originalPayout}
            </span>
          )}
        </div>
      </header>

      {/* Deliverables Section */}
      <div className="space-y-1.5">
        <p className="text-xs text-slate-400 light:text-slate-500 font-medium">Deliverables</p>
        <div className="flex flex-wrap gap-2">
          {c.deliverables.map((d, i) => (
            <span
              key={i}
              className={`rounded-lg border px-2.5 py-1.5 text-xs ${
                d.completed
                  ? 'border-emerald-500/20 light:border-emerald-200 bg-emerald-500/10 light:bg-emerald-50 text-emerald-200 light:text-emerald-700'
                  : 'border-white/10 light:border-slate-200 bg-slate-900/60 light:bg-slate-50 text-slate-300 light:text-slate-700'
              }`}
            >
              {d.completed ? '✓ ' : ''}
              {d.title}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 light:text-slate-500">
          <span>{complete} / {c.deliverables.length} deliverables complete</span>
          <span className="font-semibold text-purple-300 light:text-purple-700">{c.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-900 light:bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${c.progress}%` }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400"
          />
        </div>
      </div>

      {/* Footer: Submission Deadline and Interactive Action Buttons with Hover-Expanding Icons */}
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 light:border-slate-200 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300 light:text-slate-600">
            <CalendarDays className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-400 light:text-rose-600' : 'text-amber-400 light:text-amber-600'}`} />
            Submission Due: <strong className={isOverdue ? 'text-rose-300 light:text-rose-700 font-bold' : 'text-white light:text-slate-900 font-bold'}>{c.deadline}</strong>
          </span>
          {c.message && (
            <>
              <span className="text-slate-700 light:text-slate-300 hidden sm:inline">|</span>
              <p className={`${isOverdue || c.state === 'REVISION_REQUIRED' ? 'text-amber-200 light:text-amber-700 font-medium' : 'text-slate-400 light:text-slate-600'}`}>
                {c.message}
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          disabled={isLoading}
          onClick={handleClick}
          className={`group/action inline-flex items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:cursor-wait ${actionConfig.className}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0 text-white" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>{actionConfig.label}</span>
              <ArrowUpRight className={`h-4 w-4 transition-all duration-200 shrink-0 group-hover/action:translate-x-1 group-hover/action:-translate-y-1 group-hover/action:scale-125 ${actionConfig.iconClass}`} />
            </>
          )}
        </button>
      </footer>
    </motion.article>
  );
}
