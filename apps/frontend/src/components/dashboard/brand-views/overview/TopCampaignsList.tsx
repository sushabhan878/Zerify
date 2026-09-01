'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Eye, Heart, DollarSign } from 'lucide-react';

interface TopCampaign {
  rank: number;
  id: string;
  title: string;
  category: string;
  engagementRate: string;
  reach: string;
  spend: string;
  badgeColor: string;
}

interface TopCampaignsListProps {
  onViewCampaigns?: () => void;
}

export default function TopCampaignsList({ onViewCampaigns }: TopCampaignsListProps) {
  const campaigns: TopCampaign[] = [
    {
      rank: 1,
      id: 'summer-skincare',
      title: 'Summer Skincare Launch',
      category: 'Beauty & Wellness',
      engagementRate: '8.4%',
      reach: '840K',
      spend: '$14.2K',
      badgeColor: 'from-amber-400 to-amber-600',
    },
    {
      rank: 2,
      id: 'new-product-launch',
      title: 'New Product Launch',
      category: 'Tech Hardware & AI',
      engagementRate: '7.9%',
      reach: '620K',
      spend: '$10.5K',
      badgeColor: 'from-slate-300 to-slate-500',
    },
    {
      rank: 3,
      id: 'brand-awareness',
      title: 'Brand Awareness Campaign',
      category: 'Lifestyle & Fashion',
      engagementRate: '6.8%',
      reach: '510K',
      spend: '$8.8K',
      badgeColor: 'from-amber-600 to-amber-800',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-white">Top Performing Campaigns</h3>
        </div>

        {onViewCampaigns && (
          <button
            onClick={onViewCampaigns}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {campaigns.map((camp, idx) => (
          <motion.div
            key={camp.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 group"
          >
            {/* Left info & rank */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${camp.badgeColor} text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm`}
              >
                #{camp.rank}
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  {camp.title}
                </h4>
                <span className="text-[10px] text-slate-400 truncate block">
                  {camp.category}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> Reach
                </span>
                <span className="text-xs font-bold text-slate-300">{camp.reach}</span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                  Engagement
                </span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {camp.engagementRate}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
