'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CampaignQuickFilterState {
  category: string;
  deliverableType: string;
  payoutModel: string;
}

interface CampaignQuickFiltersProps {
  filters: CampaignQuickFilterState;
  onChange: (key: keyof CampaignQuickFilterState, val: string) => void;
}

export const CAMPAIGN_CATEGORIES = [
  'All Campaigns',
  'Tech & AI',
  'Fashion & Apparel',
  'Beauty & Skincare',
  'Fitness & Wellness',
  'Gaming & Esports',
  'Finance & Crypto',
  'Food & Beverage',
  'Travel & Lifestyle',
];

export const DELIVERABLE_TYPES = [
  'All Deliverables',
  'Instagram Reel',
  'YouTube Dedicated',
  'YouTube Integration',
  'TikTok Video',
  'Carousel Post',
  'Story Series',
  'UGC Video',
];

export const PAYOUT_MODELS = [
  'All Payouts',
  'Fixed Fee',
  'Paid + Commission',
  'Product Barter',
];

export default function CampaignQuickFilters({
  filters,
  onChange,
}: CampaignQuickFiltersProps) {
  return (
    <div className="space-y-2.5">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CAMPAIGN_CATEGORIES.map((cat) => {
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange('category', cat)}
              type="button"
              className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCampaignCat"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md border border-purple-400/40"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Deliverable Type Pills Sub-bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0 mr-1">
          Deliverable:
        </span>
        {DELIVERABLE_TYPES.map((type) => {
          const isActive = filters.deliverableType === type;
          return (
            <button
              key={type}
              onClick={() => onChange('deliverableType', type)}
              type="button"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-900/40 border border-white/5'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
