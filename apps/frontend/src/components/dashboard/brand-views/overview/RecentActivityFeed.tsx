'use client';

import { Activity, Inbox, Users, Megaphone } from 'lucide-react';
import { OverviewCampaign } from '@/services/brand-overview.service';
import OverviewPanel from './OverviewPanel';

export default function RecentActivityFeed({ campaigns, isLoading }: {
  campaigns: OverviewCampaign[];
  isLoading: boolean;
}) {
  const activities = campaigns.flatMap((campaign) => [
    { id: `campaign-${campaign.id}`, title: 'Campaign created', description: campaign.title, date: campaign.createdAt, icon: Megaphone },
    ...campaign.applications.map((application) => ({
      id: `application-${application.id}`, title: 'Application received',
      description: campaign.title, date: application.submittedAt, icon: Inbox,
    })),
    ...campaign.participants.map((participant) => ({
      id: `participant-${participant.id}`, title: 'Collaboration started',
      description: `${participant.name || '—'} · ${campaign.title}`, date: participant.joinedAt, icon: Users,
    })),
  ]).filter((item) => Number.isFinite(new Date(item.date).getTime()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  return (
    <OverviewPanel title="Recent Activity" description="Latest recorded campaign and collaboration events" icon={Activity}>
      {isLoading ? <div className="h-40 rounded-xl bg-white/5 animate-pulse" /> : activities.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No activity recorded yet</p>
      ) : <div className="space-y-3">{activities.map(({ id, title, description, date, icon: Icon }) => (
        <div key={id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-purple-500/30 transition-colors">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/10 text-purple-400 shrink-0"><Icon className="w-4 h-4" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap justify-between gap-1">
              <h3 className="text-xs font-bold text-white">{title}</h3>
              <time dateTime={date} className="text-[10px] text-slate-500" title={new Date(date).toLocaleString()}>{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
            </div>
            <p className="text-xs text-slate-400 mt-1 break-words">{description || '—'}</p>
          </div>
        </div>
      ))}</div>}
    </OverviewPanel>
  );
}
