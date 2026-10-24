'use client';

import { Users } from 'lucide-react';
import { OverviewCampaign } from '@/services/brand-overview.service';
import OverviewPanel from './OverviewPanel';

export default function OverviewCreators({ campaigns, isLoading }: { campaigns: OverviewCampaign[]; isLoading: boolean }) {
  const creators = new Map<string, { name: string; campaigns: number; published: number }>();
  campaigns.forEach((campaign) => campaign.participants.forEach((participant) => {
    if (participant.status === 'PARTICIPANT_CANCELLED') return;
    const existing = creators.get(participant.influencerProfileId);
    creators.set(participant.influencerProfileId, {
      name: participant.name || '—',
      campaigns: (existing?.campaigns ?? 0) + 1,
      published: (existing?.published ?? 0) + participant.deliverables.filter((d) => ['PUBLISHED', 'VERIFIED'].includes(d.status)).length,
    });
  }));
  const rows = Array.from(creators.entries()).sort((a, b) => b[1].published - a[1].published || b[1].campaigns - a[1].campaigns).slice(0, 5);

  return (
    <OverviewPanel title="Creator Collaborations" description="Ordered by published deliverables, then campaign count" icon={Users}>
      {isLoading ? <div className="h-40 rounded-xl bg-white/5 animate-pulse" /> : rows.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No creator collaborations yet</p>
      ) : <div className="space-y-3">{rows.map(([id, creator]) => (
        <div key={id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-purple-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center font-bold shrink-0">{creator.name.charAt(0)}</div>
          <div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-white truncate">{creator.name}</h3><p className="text-xs text-slate-400 mt-1">{creator.campaigns} campaign{creator.campaigns === 1 ? '' : 's'}</p></div>
          <div className="text-right shrink-0"><strong className="block text-sm text-emerald-300">{creator.published}</strong><span className="text-[10px] text-slate-400">Published</span></div>
        </div>
      ))}</div>}
    </OverviewPanel>
  );
}
