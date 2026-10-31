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
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 light:bg-purple-50 border border-purple-500/20 light:border-purple-200 text-xs font-bold text-purple-300 light:text-purple-700 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />
          <span>Peak: {busiest.fullLabel}</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/60 light:bg-slate-100 border border-white/10 light:border-slate-200 text-xs font-semibold text-slate-400 light:text-slate-600">
          <Info className="w-3.5 h-3.5" />
          <span>6-Month Window</span>
        </div>
      )}>
      {isLoading ? (
        <div className="relative overflow-hidden pt-8 pb-2 px-2 flex items-end justify-between gap-3 h-60 border-b border-white/10 light:border-slate-200">
          {[45, 55, 65, 75, 85, 93].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div style={{ height: `${h}%` }} className="w-full rounded-t-xl animate-pulse bg-gradient-to-t from-purple-900/30 to-indigo-500/40 light:from-purple-200 light:to-indigo-300 border-t border-x border-purple-500/20 light:border-purple-300" />
              <div className="h-3 w-8 rounded bg-white/10 light:bg-slate-200 animate-pulse" />
            </div>
          ))}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          />
        </div>
      ) : !hasData ? (
        <div className="py-10 px-6 rounded-2xl bg-white/[0.02] light:bg-slate-50/50 border border-white/5 light:border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 light:bg-purple-100 border border-purple-500/20 light:border-purple-200 flex items-center justify-center text-purple-400 light:text-purple-600 shadow-md shadow-purple-950/40 light:shadow-purple-500/10">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-sm sm:text-base font-bold text-white light:text-slate-900">No campaign activity in this period</h3>
            <p className="text-xs text-slate-400 light:text-slate-500 leading-relaxed">
              Applications and collaborations from your campaigns will appear here as creators apply and join.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-purple-300/80 light:text-purple-700 bg-purple-950/40 light:bg-purple-100/70 px-3 py-1 rounded-full border border-purple-500/20 light:border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-400 light:text-purple-600" />
            Create a campaign to start tracking activity
          </span>
        </div>
      ) : (
        <>
          <div className="pt-3 pb-2 px-2 flex items-end justify-between gap-3 h-56 sm:h-60 border-b border-white/10 light:border-slate-200" role="img" aria-label={points.map((p) => `${p.fullLabel}: ${p.applications} applications, ${p.collaborations} collaborations`).join('; ')}>
            {points.map((point, idx) => {
              const maxVal = Math.max(point.applications, point.collaborations);
              const maxPercent = (maxVal / max) * 100;

              return (
                <div key={point.fullLabel} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group min-w-0">
                  <div className="w-full flex-1 relative flex items-end justify-center gap-1.5 min-h-0" title={`${point.fullLabel}: ${point.applications} applications, ${point.collaborations} collaborations`}>
                    {/* Hover count pill sitting just on top of the taller bar */}
                    <div
                      className="absolute pointer-events-none transition-all duration-200 opacity-0 group-hover:opacity-100 z-20 -translate-x-1/2 left-1/2"
                      style={{
                        bottom: maxVal > 0 ? `calc(${maxPercent}% + 6px)` : '12px',
                      }}
                    >
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/95 light:bg-slate-900 border border-purple-500/40 text-[10px] font-bold text-purple-200 whitespace-nowrap shadow-lg backdrop-blur-md block">
                        {point.applications} · {point.collaborations}
                      </span>
                    </div>

                    {/* Applications Bar (with visible 6px baseline for 0) */}
                    <div className="h-full flex-1 max-w-10 flex flex-col justify-end items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: point.applications > 0 ? `${(point.applications / max) * 100}%` : '6px' }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        className={`w-full rounded-t-lg border-t border-x transition-all ${
                          point.applications > 0
                            ? 'bg-gradient-to-t from-purple-900/60 to-indigo-500/70 group-hover:to-indigo-400 border-purple-400/40 shadow-sm shadow-purple-950/40 light:from-purple-500 light:to-indigo-500 light:border-purple-400/30'
                            : 'h-1.5 bg-purple-950/60 light:bg-slate-200 border-purple-500/30 light:border-slate-300'
                        }`}
                      />
                    </div>

                    {/* Collaborations Bar (with visible 6px baseline for 0) */}
                    <div className="h-full flex-1 max-w-10 flex flex-col justify-end items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: point.collaborations > 0 ? `${(point.collaborations / max) * 100}%` : '6px' }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        className={`w-full rounded-t-lg border-t border-x transition-all ${
                          point.collaborations > 0
                            ? 'bg-gradient-to-t from-cyan-900/50 to-cyan-500/70 group-hover:to-cyan-400 border-cyan-400/40 shadow-sm shadow-cyan-950/40 light:from-cyan-500 light:to-teal-500 light:border-cyan-400/30'
                            : 'h-1.5 bg-cyan-950/60 light:bg-slate-200 border-cyan-500/30 light:border-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold transition-colors ${busiest === point ? 'text-purple-300 light:text-purple-700' : 'text-slate-400 group-hover:text-slate-200 light:text-slate-500 light:group-hover:text-slate-900'}`}>
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 light:text-slate-600 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" /> Applications</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" /> Collaborations</span>
          </div>
        </>
      )}
    </OverviewPanel>
  );
}
