'use client';

import React from 'react';
import {
  Activity,
  Inbox,
  Users,
  Megaphone,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { OverviewCampaign } from '@/services/brand-overview.service';
import OverviewPanel from './OverviewPanel';

interface ActivityItem {
  id: string;
  category: 'COLLABORATION' | 'APPLICATION' | 'CAMPAIGN';
  badgeLabel: string;
  title: string;
  subtitle: string;
  date: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_CONFIG = {
  COLLABORATION: {
    badge: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
    iconBg: 'bg-gradient-to-tr from-emerald-600/25 via-teal-600/20 to-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-950/40',
    dot: 'bg-emerald-400',
  },
  APPLICATION: {
    badge: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
    iconBg: 'bg-gradient-to-tr from-amber-600/25 via-orange-600/20 to-amber-500/15 border-amber-500/30 text-amber-300 shadow-md shadow-amber-950/40',
    dot: 'bg-amber-400',
  },
  CAMPAIGN: {
    badge: 'bg-purple-500/15 border-purple-400/30 text-purple-300',
    iconBg: 'bg-gradient-to-tr from-purple-600/25 via-indigo-600/20 to-purple-500/15 border-purple-500/30 text-purple-300 shadow-md shadow-purple-950/40',
    dot: 'bg-purple-400',
  },
};

function formatRelative(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor(
    (startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86_400_000
  );

  if (diffDays <= 0) {
    return `Today · ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function RecentActivityFeed({
  campaigns,
  isLoading,
}: {
  campaigns: OverviewCampaign[];
  isLoading: boolean;
}) {
  const activities: ActivityItem[] = campaigns
    .flatMap((campaign) => [
      {
        id: `campaign-${campaign.id}`,
        category: 'CAMPAIGN' as const,
        badgeLabel: 'Campaign',
        title: campaign.title || 'Untitled Campaign',
        subtitle: `Campaign created · ${campaign.status.replace(/_/g, ' ')}`,
        date: campaign.createdAt,
        icon: Megaphone,
      },
      ...campaign.applications.map((app) => ({
        id: `application-${app.id}`,
        category: 'APPLICATION' as const,
        badgeLabel: 'New Pitch',
        title: campaign.title || 'Campaign Pitch',
        subtitle: 'New application received for review',
        date: app.submittedAt,
        icon: Inbox,
      })),
      ...campaign.participants.map((p) => ({
        id: `participant-${p.id}`,
        category: 'COLLABORATION' as const,
        badgeLabel: 'Collaboration',
        title: p.name || 'Verified Creator',
        subtitle: `Joined ${campaign.title || 'campaign'} collaboration`,
        date: p.joinedAt,
        icon: Users,
      })),
    ])
    .filter((item) => Number.isFinite(new Date(item.date).getTime()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <OverviewPanel
      title="Recent Activity"
      description="Real-time timeline of your campaign milestones, creator pitches, and confirmed collaborations"
      icon={Activity}
      badge={
        activities.length > 0 && !isLoading ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Feed</span>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse flex items-center gap-3.5 h-20"
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="py-12 px-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-md shadow-purple-950/40">
            <Activity className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm sm:text-base font-bold text-white">No activity recorded yet</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When creators apply to your campaigns or active deals move forward, updates will appear here in real time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {activities.map((item) => {
            const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.CAMPAIGN;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="group/item relative flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-950/50 hover:bg-slate-900/80 border border-white/5 hover:border-purple-500/30 backdrop-blur-xl shadow-sm hover:shadow-lg hover:shadow-purple-950/20 transition-all duration-200"
              >
                {/* Left: Glowing Icon Avatar */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover/item:scale-105 ${config.iconBg}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border shadow-sm ${config.badge}`}
                      >
                        {item.badgeLabel}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover/item:text-purple-200 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[280px] sm:max-w-[340px]">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right: Relative Timestamp */}
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-[11px] font-medium pl-2">
                  <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                  <time dateTime={item.date} title={new Date(item.date).toLocaleString()} className="whitespace-nowrap">
                    {formatRelative(new Date(item.date))}
                  </time>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </OverviewPanel>
  );
}
