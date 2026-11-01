'use client';

import React from 'react';
import { Users, Sparkles, Send, CheckCircle2, Target } from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';

interface ShortlistKpiBannerProps {
  applications: CampaignApplicationItem[];
  campaignsCount: number;
}

export default function ShortlistKpiBanner({
  applications,
  campaignsCount,
}: ShortlistKpiBannerProps) {
  const totalShortlisted = applications.length;

  const totalOffersSent = applications.filter(
    (a) => a.status === 'OFFER_SENT' || (a.offers && a.offers.length > 0),
  ).length;

  const totalAccepted = applications.filter(
    (a) => a.status === 'OFFER_ACCEPTED',
  ).length;

  const avgMatchScore =
    totalShortlisted > 0
      ? Math.round(
          applications.reduce(
            (acc, curr) => acc + (curr.matchSnapshot?.score || 90),
            0,
          ) / totalShortlisted,
        )
      : 92;

  const kpis = [
    {
      label: 'Shortlisted Creators',
      val: String(totalShortlisted),
      subtext: 'Across all active campaigns',
      icon: Users,
      color: 'text-purple-400 light:text-purple-600',
      bg: 'bg-purple-500/10 border-purple-500/20 light:bg-purple-50 light:border-purple-200',
    },
    {
      label: 'Active Campaigns',
      val: String(campaignsCount),
      subtext: 'With shortlisted rosters',
      icon: Target,
      color: 'text-indigo-400 light:text-indigo-600',
      bg: 'bg-indigo-500/10 border-indigo-500/20 light:bg-indigo-50 light:border-indigo-200',
    },
    {
      label: 'Avg Match Score',
      val: `${avgMatchScore}%`,
      subtext: 'AI profile & audience fit',
      icon: Sparkles,
      color: 'text-amber-400 light:text-amber-600',
      bg: 'bg-amber-500/10 border-amber-500/20 light:bg-amber-50 light:border-amber-200',
    },
    {
      label: 'Offers Dispatched',
      val: String(totalOffersSent),
      subtext: `${totalAccepted} accepted contracts`,
      icon: Send,
      color: 'text-emerald-400 light:text-emerald-600',
      bg: 'bg-emerald-500/10 border-emerald-500/20 light:bg-emerald-50 light:border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 light:bg-white border border-white/10 light:border-slate-200/80 backdrop-blur-xl space-y-2 hover:border-purple-500/30 light:hover:border-purple-300 transition-all shadow-md shadow-purple-950/10 light:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-500">
                {kpi.label}
              </span>
              <div className={`p-2 rounded-xl border ${kpi.bg}`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-xl sm:text-2xl font-black text-white light:text-slate-900 block">
                {kpi.val}
              </span>
              <span className="text-[11px] font-medium text-slate-400 light:text-slate-500 block truncate">
                {kpi.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
