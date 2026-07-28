'use client';

import React from 'react';
import { TrendingUp, Eye, Globe, ArrowUpRight, Smartphone, Monitor } from 'lucide-react';

export default function TrafficView() {
  const sources = [
    { name: 'YouTube Video Placements', percent: 45, color: 'bg-purple-500' },
    { name: 'Instagram Reels & Stories', percent: 32, color: 'bg-pink-500' },
    { name: 'TikTok Creator Videos', percent: 15, color: 'bg-indigo-500' },
    { name: 'Direct Referral & Links', percent: 8, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <span>Traffic & Referral Analytics</span>
        </h2>
        <p className="text-xs text-slate-400">Track visitor sources, channel breakdown, and audience engagement</p>
      </div>

      {/* Traffic KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Impressions', val: '1.42M', change: '+24.5%', icon: Eye, color: 'text-purple-400' },
          { title: 'Click-Through Rate', val: '4.82%', change: '+3.1%', icon: TrendingUp, color: 'text-pink-400' },
          { title: 'Mobile Traffic', val: '78.4%', change: '+5.6%', icon: Smartphone, color: 'text-indigo-400' },
          { title: 'Desktop Traffic', val: '21.6%', change: '-1.2%', icon: Monitor, color: 'text-emerald-400' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">{kpi.title}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{kpi.val}</span>
                <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Channel Breakdown Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>Traffic Source Share</span>
        </h3>

        <div className="space-y-3">
          {sources.map((src) => (
            <div key={src.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">{src.name}</span>
                <span className="text-white font-black">{src.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${src.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${src.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
