'use client';

import { Megaphone, ArrowRight } from 'lucide-react';
import { OverviewCampaign } from '@/services/brand-overview.service';
import { useCurrency } from '@/context/CurrencyContext';
import OverviewPanel from './OverviewPanel';

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'text-slate-300 bg-slate-500/10 border-slate-400/20',
  OPEN: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  FILLING: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
  ACTIVE: 'text-purple-200 bg-purple-500/15 border-purple-500/30',
  COMPLETED: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25',
  PAUSED: 'text-orange-300 bg-orange-500/10 border-orange-500/25',
  CANCELLED: 'text-rose-300 bg-rose-500/10 border-rose-500/25',
};

const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube', TWITTER: 'X', TIKTOK: 'TikTok', LINKEDIN: 'LinkedIn', FACEBOOK: 'Facebook',
};

export default function TopCampaignsList({ campaigns, isLoading, onViewCampaigns }: {
  campaigns: OverviewCampaign[];
  isLoading: boolean;
  onViewCampaigns?: () => void;
}) {
  const { convertAndFormat } = useCurrency();
  return (
    <OverviewPanel title="Recent Campaigns" description="Your five most recently created campaigns" icon={Megaphone}
      action={onViewCampaigns && <button onClick={onViewCampaigns} className="text-xs font-bold text-purple-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg inline-flex items-center gap-1 group">View all<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></button>}>
      {isLoading ? <div className="h-44 rounded-xl bg-white/5 animate-pulse" /> : campaigns.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No campaigns yet</p>
      ) : <div className="space-y-3">{campaigns.slice(0, 5).map((campaign) => {
        const creators = campaign.participants.filter((p) => p.status !== 'PARTICIPANT_CANCELLED').length;
        const traction = campaign.applications.length > 0 ? Math.min(100, Math.round(creators / campaign.applications.length * 100)) : 0;
        const statusClass = STATUS_STYLES[campaign.status] ?? STATUS_STYLES.DRAFT;
        return (
          <div key={campaign.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-purple-500/30 transition-colors space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600/25 to-indigo-600/15 border border-purple-500/25 text-purple-200 flex items-center justify-center font-black text-sm shrink-0">
                {(campaign.title || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white break-words min-w-0">{campaign.title || '—'}</h3>
                  <span className={`text-[10px] font-bold rounded-lg px-2 py-1 border shrink-0 ${statusClass}`}>{campaign.status.replaceAll('_', ' ')}</span>
                </div>
                {campaign.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {campaign.platforms.slice(0, 3).map((platform) => (
                      <span key={platform} className="text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-md px-1.5 py-0.5">
                        {PLATFORM_LABELS[platform.toUpperCase()] ?? platform}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="text-slate-400">Applications<strong className="block text-slate-200 mt-1">{campaign.applications.length}</strong></div>
              <div className="text-slate-400">Creators<strong className="block text-slate-200 mt-1">{creators}</strong></div>
              <div className="text-slate-400">Paid out<strong className="block text-slate-200 mt-1 break-words">{convertAndFormat(campaign.paidOutAmount, campaign.currency)}</strong></div>
            </div>
            {campaign.applications.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Application to creator conversion</span>
                  <span className="font-bold text-slate-400">{traction}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${traction}%` }} />
                </div>
              </div>
            )}
          </div>
        );
      })}</div>}
    </OverviewPanel>
  );
}
