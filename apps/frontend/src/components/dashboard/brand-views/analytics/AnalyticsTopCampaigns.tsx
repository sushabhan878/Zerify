'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Eye, Heart, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';

interface CampaignPerformanceItem {
  rank: number;
  id: string;
  name: string;
  category: string;
  reach: string;
  engagement: string;
  er: string;
  roi: string;
  badgeBg: string;
}

export default function AnalyticsTopCampaigns() {
  const campaigns: CampaignPerformanceItem[] = [
    {
      rank: 1,
      id: 'summer-skincare',
      name: 'Summer Skincare Launch',
      category: 'Beauty & Wellness',
      reach: '840K',
      engagement: '68K',
      er: '8.1%',
      roi: '4.2x',
      badgeBg: 'from-amber-400 to-amber-600',
    },
    {
      rank: 2,
      id: 'new-product-launch',
      name: 'New Product Launch',
      category: 'Consumer AI & Tech',
      reach: '620K',
      engagement: '47K',
      er: '7.6%',
      roi: '3.8x',
      badgeBg: 'from-slate-300 to-slate-500',
    },
    {
      rank: 3,
      id: 'brand-awareness',
      name: 'Brand Awareness',
      category: 'Lifestyle & Fashion',
      reach: '510K',
      engagement: '31K',
      er: '6.2%',
      roi: '3.1x',
      badgeBg: 'from-amber-600 to-amber-800',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-white">Top Performing Campaigns</h3>
        </div>
        <span className="text-xs font-bold text-slate-400">Ranked by overall ER & Reach</span>
      </div>

      <div className="space-y-3">
        {campaigns.map((camp, idx) => (
          <motion.div
            key={camp.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="p-4 rounded-xl bg-slate-950/60 border border-white/5 hover:border-purple-500/30 transition-all group space-y-3"
          >
            {/* Top row: Title & Rank */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${camp.badgeBg} text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm`}
                >
                  #{camp.rank}
                </span>
                <div className="truncate">
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                    {camp.name}
                  </h4>
                  <span className="text-[10.5px] text-slate-400 truncate block">
                    {camp.category}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Est. ROI
                </span>
                <span className="text-xs font-black text-emerald-400 flex items-center justify-end gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {camp.roi}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Reach
                </span>
                <span className="text-xs font-black text-sky-300">{camp.reach}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Engagement
                </span>
                <span className="text-xs font-black text-pink-300">{camp.engagement}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  ER
                </span>
                <span className="text-xs font-black text-emerald-400">{camp.er}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
