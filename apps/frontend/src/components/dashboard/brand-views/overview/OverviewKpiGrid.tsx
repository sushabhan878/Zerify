'use client';

import { motion } from 'framer-motion';
import { Megaphone, DollarSign, Eye, Heart, TrendingUp, Inbox, Users, CheckCircle2 } from 'lucide-react';
import { OverviewCampaign } from '@/services/brand-overview.service';
import { useCurrency } from '@/context/CurrencyContext';

export default function OverviewKpiGrid({ campaigns, isLoading }: {
  campaigns: OverviewCampaign[];
  isLoading: boolean;
}) {
  const { convert, format } = useCurrency();
  const applications = campaigns.flatMap((c) => c.applications);
  const participants = campaigns.flatMap((c) => c.participants);
  const activeCreators = new Set(participants
    .filter((p) => ['CONFIRMED', 'PARTICIPANT_ACTIVE'].includes(p.status))
    .map((p) => p.influencerProfileId)).size;
  const activeCampaigns = campaigns.filter((c) => ['OPEN', 'FILLING', 'ACTIVE'].includes(c.status)).length;
  const pending = applications.filter((a) => ['APPLIED', 'UNDER_REVIEW'].includes(a.status)).length;
  const completed = participants.flatMap((p) => p.deliverables)
    .filter((d) => ['PUBLISHED', 'VERIFIED'].includes(d.status)).length;
  const kpis = [
    { label: 'Active Campaigns', value: String(activeCampaigns), detail: `${campaigns.length} campaigns in total`, icon: Megaphone, color: 'text-purple-400' },
    { label: 'Creator Payments', value: format(campaigns.reduce((sum, c) => sum + convert(c.paidOutAmount, c.currency), 0)), detail: 'Paid out · excludes planned budgets', icon: DollarSign, color: 'text-indigo-400' },
    { label: 'Total Reach', value: '—', detail: 'Campaign reach not available', icon: Eye, color: 'text-pink-400' },
    { label: 'Engagement Rate', value: '—', detail: 'Campaign engagement not available', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Total Engagement', value: '—', detail: 'Campaign interactions not available', icon: Heart, color: 'text-rose-400' },
    { label: 'Applications Received', value: String(applications.length), detail: `${pending} awaiting review`, icon: Inbox, color: 'text-amber-400' },
    { label: 'Active Creators', value: String(activeCreators), detail: 'Unique confirmed & active creators', icon: Users, color: 'text-cyan-400' },
    { label: 'Published Deliverables', value: String(completed), detail: 'Published or verified submissions', icon: CheckCircle2, color: 'text-teal-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy={isLoading}>
      {kpis.map(({ label, value, detail, icon: Icon, color }, index) => (
        <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.04 }}
          className="p-4 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/30 transition-colors group">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
            <div className={`p-2 rounded-xl bg-slate-950/60 border border-white/10 ${color}`}><Icon className="w-4 h-4" /></div>
          </div>
          {isLoading ? <div className="h-8 w-24 rounded-lg bg-white/10 animate-pulse" /> : <div className="text-2xl font-black text-white break-words">{value}</div>}
          <p className="text-[11px] font-medium text-slate-400 mt-1">{isLoading ? 'Loading records…' : detail}</p>
        </motion.div>
      ))}
    </div>
  );
}
