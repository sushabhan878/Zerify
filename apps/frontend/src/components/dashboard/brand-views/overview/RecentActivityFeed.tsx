'use client';

import { Activity, Inbox, Users, Megaphone } from 'lucide-react';
import { OverviewCampaign } from '@/services/brand-overview.service';
import OverviewPanel from './OverviewPanel';

const EVENT_STYLES: Record<string, { iconBg: string; rail: string }> = {
  'Campaign created': { iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300', rail: 'bg-purple-500/40' },
  'Application received': { iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300', rail: 'bg-amber-500/40' },
  'Collaboration started': { iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300', rail: 'bg-cyan-500/40' },
};

function formatRelative(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86_400_000);
  if (diffDays <= 0) return `Today · ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

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
      {isLoading ? <div className="h-44 rounded-xl bg-white/5 animate-pulse" /> : activities.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No activity recorded yet</p>
      ) : (
        <div className="relative">
          <div className="absolute left-[21px] top-4 bottom-4 w-px bg-gradient-to-b from-purple-500/40 via-white/10 to-transparent" aria-hidden />
          <div className="space-y-1">{activities.map(({ id, title, description, date, icon: Icon }) => {
            const style = EVENT_STYLES[title] ?? EVENT_STYLES['Campaign created'];
            return (
              <div key={id} className="relative flex items-start gap-3.5 p-2.5 rounded-2xl hover:bg-white/[0.02] transition-colors">
                <div className={`relative z-10 p-2 rounded-xl border backdrop-blur-xl shrink-0 ${style.iconBg}`}><Icon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5">
                    <h3 className="text-xs font-bold text-white">{title}</h3>
                    <time dateTime={date} className="text-[10px] font-semibold text-slate-500" title={new Date(date).toLocaleString()}>{formatRelative(new Date(date))}</time>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 break-words">{description || '—'}</p>
                </div>
              </div>
            );
          })}</div>
        </div>
      )}
    </OverviewPanel>
  );
}
