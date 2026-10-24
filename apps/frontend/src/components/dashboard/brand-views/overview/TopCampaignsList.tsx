'use client';

import { Megaphone, ArrowRight } from 'lucide-react';
import { OverviewCampaign } from '@/services/brand-overview.service';
import { useCurrency } from '@/context/CurrencyContext';
import OverviewPanel from './OverviewPanel';

export default function TopCampaignsList({ campaigns, isLoading, onViewCampaigns }: {
  campaigns: OverviewCampaign[];
  isLoading: boolean;
  onViewCampaigns?: () => void;
}) {
  const { convertAndFormat } = useCurrency();
  return (
    <OverviewPanel title="Recent Campaigns" description="Your five most recently created campaigns" icon={Megaphone}
      action={onViewCampaigns && <button onClick={onViewCampaigns} className="text-xs font-bold text-purple-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg inline-flex items-center gap-1">View all<ArrowRight className="w-3.5 h-3.5" /></button>}>
      {isLoading ? <div className="h-40 rounded-xl bg-white/5 animate-pulse" /> : campaigns.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No campaigns yet</p>
      ) : <div className="space-y-3">{campaigns.slice(0, 5).map((campaign) => (
        <div key={campaign.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-purple-500/30 transition-colors space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-bold text-white break-words min-w-0">{campaign.title || '—'}</h3>
            <span className="text-[10px] font-semibold text-purple-200 bg-purple-500/10 border border-purple-500/20 rounded-lg px-2 py-1 shrink-0">{campaign.status.replaceAll('_', ' ')}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="text-slate-400">Applications<strong className="block text-slate-200 mt-1">{campaign.applications.length}</strong></div>
            <div className="text-slate-400">Creators<strong className="block text-slate-200 mt-1">{campaign.participants.filter((p) => p.status !== 'PARTICIPANT_CANCELLED').length}</strong></div>
            <div className="text-slate-400">Paid out<strong className="block text-slate-200 mt-1 break-words">{convertAndFormat(campaign.paidOutAmount, campaign.currency)}</strong></div>
          </div>
        </div>
      ))}</div>}
    </OverviewPanel>
  );
}
