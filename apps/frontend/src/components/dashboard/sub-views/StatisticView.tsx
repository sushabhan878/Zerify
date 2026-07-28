'use client';

import React from 'react';
import { BarChart3, DollarSign, Award, ArrowUpRight, Target } from 'lucide-react';

export default function StatisticView() {
  const stats = [
    { label: 'Total Campaign ROI', val: '4.25x', sub: 'vs 3.1x target', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Cost Per Engagement', val: '$0.18', sub: '-14% reduction', icon: Target, color: 'text-purple-400' },
    { label: 'Earned Media Value', val: '$48,250', sub: '+32% growth', icon: Award, color: 'text-pink-400' },
    { label: 'Conversion Rate', val: '6.4%', sub: '+1.8% benchmark', icon: BarChart3, color: 'text-indigo-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span>Performance & Campaign Statistics</span>
        </h2>
        <p className="text-xs text-slate-400">Comprehensive breakdown of ROI, cost benchmarks, and media value</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">{st.label}</span>
                <Icon className={`w-4 h-4 ${st.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{st.val}</span>
                <span className="text-[11px] font-extrabold text-purple-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {st.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white">Campaign Benchmark Summary</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your influencer campaigns performed in the top 5% of all tech & consumer AI brand campaigns this quarter.
          Media reach exceeded predictions by 38%, generating 48,250 USD in earned media value.
        </p>
      </div>
    </div>
  );
}
