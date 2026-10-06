'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Send,
  Gift,
  Clock,
  Bookmark,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

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
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onViewBrief: (campaign: CampaignItem) => void;
  onApply: (campaign: CampaignItem) => void;
}

export default function CampaignCard({
  campaign,
  isSaved = false,
  onToggleSave,
  onViewBrief,
  onApply,
}: CampaignCardProps) {
  const { formatBudgetCompact } = useCurrency();
  const isBrandTruncated = (campaign.brandName || '').length > 16;
  const displayBrandName = isBrandTruncated
    ? `${campaign.brandName.slice(0, 16)}...`
    : campaign.brandName;

  const isTitleTruncated = (campaign.title || '').length > 28;
  const displayTitle = isTitleTruncated
    ? `${campaign.title.slice(0, 28)}...`
    : campaign.title;

  const SOCIAL_ICONS: Record<string, string> = {
    youtube: '/social/youtube.png',
    instagram: '/social/instagram.png',
    twitter: '/social/twitter.png',
    x: '/social/twitter.png',
    linkedin: '/social/linkedin.png',
    facebook: '/social/facebook.png',
    threads: '/social/threads.png',
    tiktok: '/social/tik-tok.png',
  };

  const getSocialIconSrc = (platform: string): string => {
    const p = platform.toLowerCase().trim();
    if (p.includes('youtube')) return SOCIAL_ICONS.youtube;
    if (p.includes('instagram')) return SOCIAL_ICONS.instagram;
    if (p.includes('twitter') || p === 'x') return SOCIAL_ICONS.twitter;
    if (p.includes('linkedin')) return SOCIAL_ICONS.linkedin;
    if (p.includes('facebook')) return SOCIAL_ICONS.facebook;
    if (p.includes('threads')) return SOCIAL_ICONS.threads;
    if (p.includes('tiktok') || p.includes('tik-tok') || p.includes('tik tok')) return SOCIAL_ICONS.tiktok;
    return SOCIAL_ICONS.instagram;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative mt-4 rounded-3xl bg-slate-950/70 border border-purple-500/20 hover:border-purple-500/40 p-6 sm:p-7 flex flex-col justify-between backdrop-blur-2xl shadow-xl shadow-purple-950/20 transition-all duration-300 overflow-visible space-y-6 sm:space-y-7"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all pointer-events-none" />

      {/* Floating Match Rate Badge Overlapping Top-Right Corner */}
      {typeof campaign.matchScore === 'number' && (
        <div
          className="absolute right-6 sm:right-8 z-30 pointer-events-none"
          style={{ top: '-20px', transform: 'translateY(-50%)' }}
        >
          <span
            className={`px-4 sm:px-5 py-2 rounded-full border text-xs sm:text-sm md:text-sm font-black tracking-wide text-white flex items-center gap-2 shadow-2xl ring-4 ring-[#080B14] group-hover:scale-105 transition-all duration-300 ${campaign.matchScore >= 90
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 border-emerald-400/50 shadow-emerald-950/80 group-hover:shadow-emerald-600/40'
              : campaign.matchScore >= 75
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 border-purple-400/50 shadow-purple-950/80 group-hover:shadow-purple-600/40'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border-blue-400/50 shadow-blue-950/80 group-hover:shadow-blue-600/40'
              }`}
          >
            <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white animate-pulse shrink-0" />
            <span>{campaign.matchScore}% Match</span>
          </span>
        </div>
      )}

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
            <div className="space-y-0.5 min-w-0">
              <div className="relative group/brand flex items-center gap-1.5">
                <span
                  title={isBrandTruncated ? campaign.brandName : undefined}
                  className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors cursor-default"
                >
                  {displayBrandName}
                </span>
                {campaign.isVerifiedBrand && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                )}
                {isBrandTruncated && (
                  <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/brand:flex items-center px-2.5 py-1 rounded-lg bg-slate-900/95 border border-purple-500/30 text-xs font-semibold text-white shadow-xl shadow-purple-950/60 whitespace-nowrap z-30 pointer-events-none">
                    {campaign.brandName}
                  </div>
                )}
              </div>
              <span className="text-xs text-purple-300/80 font-medium block truncate">
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

            {/* Save / Bookmark Campaign Button */}
            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(campaign.id);
                }}
                type="button"
                className={`p-2 rounded-xl border transition-all ${isSaved
                  ? 'bg-purple-600/30 border-purple-400/60 text-purple-300 shadow-md shadow-purple-950/40'
                  : 'bg-slate-900/80 border-purple-500/20 text-slate-400 hover:text-white hover:border-purple-400/40 hover:bg-slate-800'
                  }`}
                title={isSaved ? 'Remove from saved' : 'Save campaign'}
                aria-label={isSaved ? 'Remove from saved' : 'Save campaign'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-purple-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Middle Content Row: Title, Description, Platforms & Compensation */}
        <div className="grid md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left / Title & Description (col-span-8) */}
          <div className="md:col-span-8 space-y-3">
            <h3
              title={campaign.title}
              className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-200 transition-colors leading-snug"
            >
              {displayTitle}
            </h3>
            <p
              title={campaign.description}
              className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal"
            >
              {campaign.description}
            </p>

            {/* Overlapping Platform Images with Thinner Purple Gradient Border (balanced size & 70% visible) */}
            <div className="flex items-center gap-2.5 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Platforms:
              </span>
              <div className="flex items-center -space-x-2 isolate">
                {(campaign.targetPlatforms || []).map((p, idx) => {
                  const iconSrc = getSocialIconSrc(p);
                  return (
                    <div
                      key={p}
                      title={p}
                      style={{ zIndex: 10 + idx }}
                      className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full p-[1px] bg-gradient-to-tr from-purple-600 via-indigo-500 to-purple-400 shadow-sm transition-transform duration-200 hover:scale-125 hover:z-30 cursor-pointer shrink-0"
                    >
                      <div className="w-full h-full rounded-full bg-[#090C15] flex items-center justify-center p-0.5 overflow-hidden">
                        <img
                          src={iconSrc}
                          alt={p}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right / Compensation & Free Product (col-span-4) */}
          <div className="md:col-span-4 flex flex-col md:items-end justify-center space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-purple-400/90 tracking-wider block">
              Compensation
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatBudgetCompact(campaign.payoutAmount)}
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
          className="group/brief w-full py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/40 text-slate-300 hover:text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:shadow-md hover:shadow-purple-950/30 active:scale-[0.98]"
        >
          <span>View Brief</span>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/brief:text-purple-300 group-hover/brief:translate-x-1.5 group-hover/brief:-translate-y-1.5 group-hover/brief:scale-110 transition-all duration-200 shrink-0" />
        </button>

        {campaign.isApplied ? (
          <button
            onClick={() => onViewBrief(campaign)}
            type="button"
            className="group/applied w-full py-3 px-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-300 hover:text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all duration-200 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover/applied:scale-125 group-hover/applied:rotate-12 transition-transform duration-200 shrink-0" />
            <span>Applied</span>
          </button>
        ) : (
          <button
            onClick={() => onApply(campaign)}
            type="button"
            className="group/apply w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-purple-950/40 hover:shadow-purple-900/60 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 group-hover/apply:translate-x-1.5 group-hover/apply:-translate-y-1 group-hover/apply:scale-110 transition-transform duration-200 shrink-0" />
            <span>Apply Now</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
