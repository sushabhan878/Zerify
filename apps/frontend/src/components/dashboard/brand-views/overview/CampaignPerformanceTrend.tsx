'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Info, Sparkles } from 'lucide-react';
import { OverviewCampaign } from '@/services/brand-overview.service';
import OverviewPanel from './OverviewPanel';

export default function CampaignPerformanceTrend({ campaigns, isLoading }: { campaigns: OverviewCampaign[]; isLoading: boolean }) {
  const points = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const start = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const inMonth = (date: string) => new Date(date) >= start && new Date(date) < end;
      return {
        label: start.toLocaleDateString(undefined, { month: 'short' }),
        fullLabel: start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        applications: campaigns.flatMap((c) => c.applications).filter((a) => inMonth(a.submittedAt)).length,
        collaborations: campaigns.flatMap((c) => c.participants).filter((p) => inMonth(p.joinedAt)).length,
      };
    });
  }, [campaigns]);
  const max = Math.max(1, ...points.flatMap((p) => [p.applications, p.collaborations]));
  const hasData = points.some((p) => p.applications || p.collaborations);
  const busiest = hasData ? points.reduce((best, p) => (p.applications + p.collaborations > best.applications + best.collaborations ? p : best), points[0]) : null;

  return (
    <OverviewPanel title="Campaign Activity" description="Applications received and collaborations started · last six months" icon={BarChart3}
      badge={!isLoading && hasData && busiest ? (
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Peak: {busiest.fullLabel}</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/60 border border-white/10 text-xs font-semibold text-slate-400">
          <Info className="w-3.5 h-3.5" />
          <span>6-Month Window</span>
        </div>
      )}>
      {isLoading ? (
        <div className="relative overflow-hidden pt-8 pb-2 px-2 flex items-end justify-between gap-3 h-60 border-b border-white/10">
          {[45, 55, 65, 75, 85, 93].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div style={{ height: `${h}%` }} className="w-full rounded-t-xl animate-pulse bg-gradient-to-t from-purple-900/30 to-indigo-500/40 border-t border-x border-purple-500/20" />
              <div className="h-3 w-8 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          />
        </div>
      ) : !hasData ? (
        <div className="py-10 px-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-md shadow-purple-950/40">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-sm sm:text-base font-bold text-white">No campaign activity in this period</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Applications and collaborations from your campaigns will appear here as creators apply and join.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-purple-300/80 bg-purple-950/40 px-3 py-1 rounded-full border border-purple-500/20">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Create a campaign to start tracking activity
          </span>
        </div>
      ) : (
        <>
          <div className="pt-6 pb-2 px-2 flex items-end justify-between gap-3 h-60 border-b border-white/10" role="img" aria-label={points.map((p) => `${p.fullLabel}: ${p.applications} applications, ${p.collaborations} collaborations`).join('; ')}>
            {points.map((point, idx) => (
              <div key={point.fullLabel} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group min-w-0">
                <span className="text-[11px] font-bold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {point.applications} · {point.collaborations}
                </span>
                <div className="w-full flex-1 flex items-end justify-center gap-1.5 min-h-0" title={`${point.fullLabel}: ${point.applications} applications, ${point.collaborations} collaborations`}>
                  {[{ value: point.applications, barClass: 'bg-gradient-to-t from-purple-900/60 to-indigo-500/70 group-hover:to-indigo-400 border-purple-400/30' },
                    { value: point.collaborations, barClass: 'bg-gradient-to-t from-cyan-900/50 to-cyan-500/70 group-hover:to-cyan-400 border-cyan-400/30' }].map((bar, i) => (
                    <div key={i} className="h-full flex-1 max-w-10 flex flex-col justify-end items-center">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${bar.value / max * 100}%` }} transition={{ duration: 0.5, delay: idx * 0.08 }}
                        className={`w-full rounded-t-xl border-t border-x transition-all ${bar.barClass}`} />
                    </div>
                  ))}
                </div>
                <span className={`text-[11px] sm:text-xs font-bold ${busiest === point ? 'text-purple-300' : 'text-slate-400'}`}>{point.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" /> Applications</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" /> Collaborations</span>
          </div>
        </>
      )}
    </OverviewPanel>
  );
}
