'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
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

  return (
    <OverviewPanel title="Campaign Activity" description="Applications received and collaborations started · last six months" icon={BarChart3}>
      {isLoading ? <div className="h-52 rounded-2xl bg-white/5 animate-pulse" /> : !hasData ? (
        <div className="h-52 flex flex-col items-center justify-center text-center text-slate-400 gap-2"><BarChart3 className="w-8 h-8 text-purple-400/60" /><p className="text-sm">No campaign activity in this period</p><span className="text-xs">Applications and collaborations will appear here.</span></div>
      ) : (
        <div className="grid grid-cols-6 gap-3 h-56 border-b border-white/10" role="img" aria-label={points.map((p) => `${p.fullLabel}: ${p.applications} applications, ${p.collaborations} collaborations`).join('; ')}>
          {points.map((point) => (
            <div key={point.fullLabel} className="flex flex-col items-center min-w-0 h-full">
              <div className="flex-1 w-full flex items-end justify-center gap-1.5 min-h-0" title={`${point.fullLabel}: ${point.applications} applications, ${point.collaborations} collaborations`}>
                {[{ value: point.applications, color: 'from-purple-600 to-purple-400' }, { value: point.collaborations, color: 'from-indigo-600 to-cyan-400' }].map((bar, i) => (
                  <div key={i} className="h-full flex-1 max-w-10 flex flex-col justify-end items-center gap-1">
                    <span className="text-[10px] text-slate-400">{bar.value}</span>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${bar.value / max * 80}%` }} transition={{ duration: 0.5 }} className={`w-full rounded-t-lg bg-gradient-to-t ${bar.color}`} />
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-slate-400 py-3">{point.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-5 text-xs text-slate-400"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-400" />Applications</span><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400" />Collaborations</span></div>
    </OverviewPanel>
  );
}
