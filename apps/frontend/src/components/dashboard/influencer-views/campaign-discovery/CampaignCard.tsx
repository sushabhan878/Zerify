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
  rawDeliverables?: any[];
  productDetails?: any;
  requirementDetails?: any;
  applicationsCount?: number;
  brandLocation?: string;
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
  isApplied?: boolean;
  applicationStatus?: string;
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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-3xl bg-slate-950/70 border border-purple-500/20 hover:border-purple-500/40 p-6 sm:p-7 flex flex-col justify-between backdrop-blur-2xl shadow-xl shadow-purple-950/20 transition-all duration-300 overflow-hidden space-y-6 sm:space-y-7"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all pointer-events-none" />

      <div className="space-y-5 sm:space-y-6">
        {/* Top Header Row: Brand Info (Left) and Badges (Right) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-purple-500/20 overflow-hidden shrink-0 shadow-md">
              <img
                src={campaign.brandLogo}
                alt={campaign.brandName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {campaign.brandName}
                </span>
                {campaign.isVerifiedBrand && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                )}
              </div>
              <span className="text-xs text-purple-300/80 font-medium block">
                {campaign.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Deadline Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-purple-500/20 text-xs font-semibold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ends in {campaign.daysRemaining} days</span>
            </div>

            {/* Match Score Badge */}
            <div className="px-3 py-1 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center gap-1.5 text-xs font-black text-purple-200 shadow-sm">
              <Sparkles className="w-3 h-3 text-purple-300 animate-pulse" />
              <span>{campaign.matchScore}%</span>
            </div>
          </div>
        </div>

        {/* Middle Content Row: Title, Description, Platforms & Compensation */}
        <div className="grid md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left / Title & Description (col-span-8) */}
          <div className="md:col-span-8 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-200 transition-colors leading-snug">
              {campaign.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal">
              {campaign.description}
            </p>

            {/* Platform Tag Icons */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Platforms:
              </span>
              <div className="flex items-center gap-2">
                {campaign.targetPlatforms.map((p) => (
                  <span
                    key={p}
                    title={p}
                    className="p-2 rounded-xl bg-slate-900/80 border border-purple-500/20 text-purple-300 hover:border-purple-400/40 transition-colors shadow-sm"
                  >
                    {getPlatformIcon(p)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right / Compensation & Free Product (col-span-4) */}
          <div className="md:col-span-4 flex flex-col md:items-end justify-center space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-purple-400/90 tracking-wider block">
              Compensation
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {campaign.payoutAmount}
            </span>

            {campaign.hasFreeProduct && (
              <div className="md:text-right pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500/30 text-xs font-bold text-purple-200 shadow-sm">
                  <Gift className="w-3.5 h-3.5 text-purple-300" />
                  <span>+ Free Product</span>
                </span>
                {campaign.freeProductValue && (
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {campaign.freeProductValue}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Buttons (Spacious Layout) */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 pt-2">
        <button
          onClick={() => onViewBrief(campaign)}
          type="button"
          className="w-full py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/40 text-slate-300 hover:text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span>View Brief</span>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </button>

        {campaign.isApplied ? (
          <button
            disabled
            type="button"
            className="w-full py-3 px-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-default"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Applied</span>
          </button>
        ) : (
          <button
            onClick={() => onApply(campaign)}
            type="button"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Apply Now</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
