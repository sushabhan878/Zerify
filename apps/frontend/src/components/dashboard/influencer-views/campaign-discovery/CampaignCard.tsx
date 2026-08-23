'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Send,
  Video,
  Instagram,
  Youtube,
  Gift,
  Clock,
  Twitter,
  Linkedin,
  Tv,
} from 'lucide-react';

export interface CampaignItem {
  id: string;
  title: string;
  brandName: string;
  brandLogo: string;
  category: string;
  industry: string;
  coverImage: string;
  description: string;
  payoutAmount: string;
  payoutModel: 'Fixed Fee' | 'Paid + Commission' | 'Product Barter';
  hasFreeProduct?: boolean;
  freeProductValue?: string;
  deliverables: string[];
  targetPlatforms: ('Instagram' | 'YouTube' | 'TikTok' | 'LinkedIn' | 'Twitter')[];
  creatorTiers: string[];
  slotsTotal: number;
  slotsFilled: number;
  deadline: string;
  daysRemaining: number;
  matchScore: number;
  audienceMatchScore: number;
  nicheMatchScore: number;
  isVerifiedBrand: boolean;
  isEscrowGuaranteed: boolean;
  requirements: string[];
  dos: string[];
  donts: string[];
  moodboardImages?: string[];
}

interface CampaignCardProps {
  campaign: CampaignItem;
  onViewBrief: (campaign: CampaignItem) => void;
  onApply: (campaign: CampaignItem) => void;
}

export default function CampaignCard({
  campaign,
  onViewBrief,
  onApply,
}: CampaignCardProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-400" />;
      case 'YouTube':
        return <Youtube className="w-3.5 h-3.5 text-rose-500" />;
      case 'TikTok':
        return <Video className="w-3.5 h-3.5 text-cyan-400" />;
      case 'LinkedIn':
        return <Linkedin className="w-3.5 h-3.5 text-blue-400" />;
      case 'Twitter':
        return <Twitter className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Video className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-3xl bg-slate-950/70 border border-purple-500/20 hover:border-purple-500/40 p-5 sm:p-6 flex flex-col justify-between backdrop-blur-2xl shadow-xl shadow-purple-950/20 transition-all duration-300 overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all pointer-events-none" />

      <div>
        {/* Top Header Row: Brand Logo, Name, Category & Match Score */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-purple-500/20 overflow-hidden shrink-0 shadow-md">
              <img
                src={campaign.brandLogo}
                alt={campaign.brandName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  {campaign.brandName}
                </span>
                {campaign.isVerifiedBrand && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                )}
              </div>
              <span className="text-xs text-purple-300/70 font-medium">{campaign.category}</span>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 shadow-sm shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span className="text-xs font-black text-purple-200">{campaign.matchScore}%</span>
          </div>
        </div>

        {/* 1. Title & Description */}
        <div className="space-y-1 mb-3.5">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
            {campaign.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {campaign.description}
          </p>
        </div>

        {/* 2. Platforms Icons */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Platforms:
          </span>
          <div className="flex items-center gap-1.5">
            {campaign.targetPlatforms.map((p) => (
              <span
                key={p}
                title={p}
                className="p-1.5 rounded-lg bg-slate-900/80 border border-purple-500/20 text-purple-300 hover:border-purple-400/40 transition-colors"
              >
                {getPlatformIcon(p)}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Highlighted Compensation & Free Product */}
        <div className="flex items-end justify-between gap-3 mb-3 pt-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-400/80 tracking-wider block mb-0.5">
              Compensation
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {campaign.payoutAmount}
            </span>
          </div>

          {campaign.hasFreeProduct && (
            <div className="text-right pb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600/20 border border-purple-500/30 text-xs font-bold text-purple-200 shadow-sm">
                <Gift className="w-3.5 h-3.5 text-purple-300" />
                <span>+ Free Product</span>
              </span>
              {campaign.freeProductValue && (
                <span className="text-[11px] text-slate-400 block mt-1">
                  Valued at {campaign.freeProductValue}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 4. Ends in .. days (clean, no bar, no 0/.. spots) */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Ends in {campaign.daysRemaining} days</span>
        </div>
      </div>

      {/* Card Action Buttons (no top divider line) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => onViewBrief(campaign)}
          type="button"
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/40 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>View Brief</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => onApply(campaign)}
          type="button"
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/40 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="w-3 h-3" />
          <span>Apply Now</span>
        </button>
      </div>
    </motion.div>
  );
}
