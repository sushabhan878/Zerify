'use client';

import { motion } from 'framer-motion';
import { Megaphone, DollarSign, Inbox, Users, CheckCircle2, Handshake, Clock3, Coins } from 'lucide-react';
import { OverviewCampaign } from '@/services/brand-overview.service';
import { useCurrency } from '@/context/CurrencyContext';

const ACTIVE_PARTICIPANT_STATUSES = ['CONFIRMED', 'PARTICIPANT_ACTIVE'];
const PENDING_APPLICATION_STATUSES = ['APPLIED', 'UNDER_REVIEW'];
const IN_PROGRESS_DELIVERABLE_STATUSES = ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'READY_TO_PUBLISH'];

export default function OverviewKpiGrid({ campaigns, isLoading }: {
  campaigns: OverviewCampaign[];
  isLoading: boolean;
}) {
  const { convert, format } = useCurrency();

  const applications = campaigns.flatMap((c) => c.applications);
  const participants = campaigns.flatMap((c) => c.participants).filter((p) => p.status !== 'PARTICIPANT_CANCELLED');
  const deliverables = participants.flatMap((p) => p.deliverables);

  const activeCampaigns = campaigns.filter((c) => ['OPEN', 'FILLING', 'ACTIVE'].includes(c.status)).length;
  const totalPaid = campaigns.reduce((sum, c) => sum + convert(c.paidOutAmount, c.currency), 0);
  const fundedCampaigns = campaigns.filter((c) => c.paidOutAmount > 0).length;
  const avgSpend = fundedCampaigns > 0 ? totalPaid / fundedCampaigns : 0;
  const activeCreators = new Set(participants
    .filter((p) => ACTIVE_PARTICIPANT_STATUSES.includes(p.status))
    .map((p) => p.influencerProfileId)).size;
  const pending = applications.filter((a) => PENDING_APPLICATION_STATUSES.includes(a.status)).length;
  const published = deliverables.filter((d) => ['PUBLISHED', 'VERIFIED'].includes(d.status)).length;
  const inProgress = deliverables.filter((d) => IN_PROGRESS_DELIVERABLE_STATUSES.includes(d.status)).length;

  const kpis = [
    { label: 'Active Campaigns', value: String(activeCampaigns), change: campaigns.length > 0 ? `${campaigns.length} created in total` : 'No campaigns yet', icon: Megaphone, color: 'text-purple-400' },
    { label: 'Creator Payments', value: format(totalPaid), change: 'Lifetime paid to creators', icon: DollarSign, color: 'text-indigo-400' },
    { label: 'Collaborations Started', value: String(participants.length), change: 'Creators joined campaigns', icon: Handshake, color: 'text-cyan-400' },
    { label: 'Applications Received', value: String(applications.length), change: pending > 0 ? `${pending} awaiting review` : 'All reviewed', icon: Inbox, color: 'text-amber-400' },
    { label: 'Active Creators', value: String(activeCreators), change: 'Unique confirmed creators', icon: Users, color: 'text-emerald-400' },
    { label: 'Published Deliverables', value: String(published), change: 'Published or verified posts', icon: CheckCircle2, color: 'text-teal-400' },
    { label: 'Deliverables In Progress', value: String(inProgress), change: inProgress > 0 ? 'Awaiting publication' : 'Nothing in the pipeline', icon: Clock3, color: 'text-rose-400' },
    { label: 'Avg. Spend per Campaign', value: format(Math.round(avgSpend)), change: fundedCampaigns > 0 ? `Across ${fundedCampaigns} funded campaigns` : 'No funded campaigns yet', icon: Coins, color: 'text-violet-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy={isLoading}>
      {kpis.map(({ label, value, change, icon: Icon, color }, index) => (
        <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.04 }}
          className="p-4 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/30 transition-all group relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
            <div className={`${color} shrink-0 group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          {isLoading
            ? <div className="h-8 w-24 rounded-lg bg-white/10 animate-pulse" />
            : <div className="text-2xl font-black text-white break-words">{value}</div>}
          <span className="text-[11px] font-bold text-emerald-400 mt-1 inline-block">
            {isLoading ? 'Loading records…' : change}
          </span>
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'linear', delay: index * 0.08 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
