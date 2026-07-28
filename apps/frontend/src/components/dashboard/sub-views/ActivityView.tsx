'use client';

import React from 'react';
import { Activity, Clock, CheckCircle, Bell, ArrowUpRight, Filter } from 'lucide-react';

export default function ActivityView() {
  const activities = [
    {
      id: 1,
      title: 'Campaign Brief Approved',
      desc: 'Summer Tech Launch campaign brief was verified and published to top creators.',
      time: '12 mins ago',
      type: 'approval',
      icon: CheckCircle,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 2,
      title: 'New Creator Application',
      desc: 'Sarah Jenkins (@sarah_creativ) submitted an offer for Apex Wireless Headphones.',
      time: '45 mins ago',
      type: 'application',
      icon: Activity,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 3,
      title: 'Milestone Escrow Released',
      desc: '$1,200.00 escrow released to Marcus Vance for Instagram Reels deliverable.',
      time: '2 hours ago',
      type: 'payment',
      icon: ArrowUpRight,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 4,
      title: 'New System Notification',
      desc: 'Monthly performance analytics report is ready for download.',
      time: '5 hours ago',
      type: 'system',
      icon: Bell,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span>Real-Time Activity Feed</span>
          </h2>
          <p className="text-xs text-slate-400">Live stream of campaign submissions, offers, and contract updates</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span>Filter Feed</span>
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex items-start justify-between gap-4 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border ${act.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-white group-hover:text-purple-300 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{act.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-500 shrink-0">
                <Clock className="w-3 h-3" />
                <span>{act.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
