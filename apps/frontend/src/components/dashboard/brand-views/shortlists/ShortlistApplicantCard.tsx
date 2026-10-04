'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  ArrowRight,
  CheckCircle2,
  BadgeCheck,
  RefreshCw,
  Target,
} from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';
import { CreatorItem, PlatformBadge } from '../find-influencers/CreatorCard';
import { mapApplicationToCreator } from '../campaigns/mapApplicationToCreator';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface ShortlistApplicantCardProps {
  application: CampaignApplicationItem;
  hasWorkedWithBrand?: boolean;
  onViewDetails: (app: CampaignApplicationItem) => void;
  onViewProfile?: (creator: CreatorItem) => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onReject?: (appId: string) => void;
  viewMode?: 'grid' | 'list';
  onFilterByCampaign?: (campaignId: string) => void;
}

function formatMaxOneDecimal(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val.toString() : val.toFixed(1);
  }
  return String(val).replace(/(\d+)\.(\d+)/g, (_, intPart, decPart) => {
    if (decPart.length <= 1) return `${intPart}.${decPart}`;
    const num = parseFloat(`${intPart}.${decPart}`);
    return num.toFixed(1);
  });
}

function BrandWorkedRibbonBadge({ size = 'default' }: { size?: 'default' | 'small' }) {
  const isSmall = size === 'small';
  return (
    <div
      className="relative group/ribbon flex items-center justify-center shrink-0 cursor-help select-none"
      title="Previously collaborated with your brand"
    >
      <svg
        className={`${
          isSmall ? 'w-8 h-9' : 'w-11 h-12 sm:w-12 sm:h-13'
        } drop-shadow-[0_4px_12px_rgba(168,85,247,0.55)] transition-transform duration-300 group-hover/ribbon:scale-115`}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="purpleRibbonLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>
          <linearGradient id="purpleRibbonRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>
          <linearGradient id="purpleRosette" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="45%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>
          <linearGradient id="purpleRosetteInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3E8FF" />
            <stop offset="60%" stopColor="#E9D5FF" />
            <stop offset="100%" stopColor="#D8B4FE" />
          </linearGradient>
          <linearGradient id="purpleStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7E22CE" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>

        {/* Dual Ribbon Tails with notched V-cut */}
        <polygon
          points="36,60 16,108 34,94 48,108 44,60"
          fill="url(#purpleRibbonLeft)"
        />
        <polygon
          points="56,60 52,108 66,94 84,108 64,60"
          fill="url(#purpleRibbonRight)"
        />

        {/* Scalloped Rosette Medal Circle */}
        <path
          d="M 50 6
             L 56.5 8.5 L 63.5 7 L 68.5 12 L 75.5 13 L 78.5 20 L 85.5 23.5 L 86.5 31 L 92.5 36.5 L 91 44 L 95 50.5 L 91 57 L 92.5 64.5 L 86.5 70 L 85.5 77.5 L 78.5 81 L 75.5 88 L 68.5 89 L 63.5 94 L 56.5 92.5 L 50 95 L 43.5 92.5 L 36.5 94 L 31.5 89 L 24.5 88 L 21.5 81 L 14.5 77.5 L 13.5 70 L 7.5 64.5 L 9 57 L 5 50.5 L 9 44 L 7.5 36.5 L 13.5 31 L 14.5 23.5 L 21.5 20 L 24.5 13 L 31.5 12 L 36.5 7 L 43.5 8.5 Z"
          fill="url(#purpleRosette)"
          stroke="#FAF5FF"
          strokeWidth="1.8"
        />

        {/* Outer Circular Ring on Rosette */}
        <circle cx="50" cy="50.5" r="28" fill="none" stroke="#7E22CE" strokeWidth="1.5" />

        {/* Inner Disc */}
        <circle cx="50" cy="50.5" r="24.5" fill="url(#purpleRosetteInner)" stroke="#9333EA" strokeWidth="1.5" />

        {/* Center 5-Pointed Star */}
        <polygon
          points="50,30 55,42 68,43 58,52 61,65 50,58 39,65 42,52 32,43 45,42"
          fill="url(#purpleStarGrad)"
        />
      </svg>

      {/* Hover Floating Tooltip */}
      <div className="absolute top-full left-0 mt-1 hidden group-hover/ribbon:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/95 border border-purple-500/40 text-[10px] font-black text-purple-200 shadow-xl whitespace-nowrap z-50 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Worked with Brand</span>
      </div>
    </div>
  );
}

export default function ShortlistApplicantCard({
  application,
  hasWorkedWithBrand,
  onViewDetails,
  onViewProfile,
  onSendOffer,
  viewMode = 'grid',
  onFilterByCampaign,
}: ShortlistApplicantCardProps) {
  const { currency } = useCurrency();
  const [imageError, setImageError] = useState(false);

  const creatorItem = mapApplicationToCreator(application);
  const match = application.matchSnapshot || { score: 92, eligibility: 'ELIGIBLE' };

  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewProfile) {
      onViewProfile(creatorItem);
    }
  };

  const quoteDisplay = application.proposedAmount
    ? formatCurrency(application.proposedAmount, application.proposedCurrency || currency)
    : 'Flexible';

  const hasExistingOffer =
    application.status === 'OFFER_SENT' ||
    Boolean(application.offers && application.offers.length > 0);

  const campaignTitle = application.campaign?.title || 'Active Campaign';
  const campaignId = application.campaignId || application.campaign?.id;
  const matchScore = match.score || creatorItem.matchScore || 95;

  const workedWithBrand = Boolean(
    hasWorkedWithBrand ?? (
      application.hasWorkedWithBrand ||
      application.status === 'OFFER_ACCEPTED' ||
      application.offers?.some((o: any) => o.status === 'ACCEPTED')
    )
  );

  const defaultAvatar =
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleOpenProfile}
        className="p-5 rounded-3xl bg-[#0a0d14]/95 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-[border-color,box-shadow] duration-300 flex flex-col xl:flex-row xl:items-center justify-between gap-5 group shadow-xl hover:shadow-purple-950/20 cursor-pointer"
      >
        {/* Creator Identity */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            {/* Overlapping Ribbon Award Badge */}
            {workedWithBrand && (
              <div className="absolute -top-3 -left-3 z-30 pointer-events-auto">
                <BrandWorkedRibbonBadge size="small" />
              </div>
            )}

            {creatorItem.avatarUrl && !imageError ? (
              <img
                src={creatorItem.avatarUrl}
                alt={creatorItem.name}
                onError={() => setImageError(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-white/15 group-hover:border-purple-500/50 shadow-md transition-colors"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-700 to-pink-700 text-white font-black text-xl flex items-center justify-center border-2 border-white/15 shadow-md">
                {creatorItem.name ? creatorItem.name.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center border-2 border-[#090D16] shadow-sm">
              <BadgeCheck className="w-3.5 h-3.5 fill-white text-purple-600" />
            </span>
          </div>

          <div className="min-w-0 flex flex-col justify-center space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                {creatorItem.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[11px] font-black text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                {formatMaxOneDecimal(matchScore)}% Match
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  campaignId && onFilterByCampaign?.(campaignId);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/30 text-[10.5px] font-bold text-purple-300 transition-colors truncate max-w-[170px]"
                title={`Campaign: ${campaignTitle}`}
              >
                <Target className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                <span className="truncate">{campaignTitle}</span>
              </button>
            </div>

            <div className="text-xs text-slate-300 font-medium truncate">
              {creatorItem.category || 'Content Creator'}
            </div>

            <p className="text-xs text-slate-300/80 italic line-clamp-2 pt-0.5">
              &quot;{application.applicationMessage || creatorItem.bio || 'No pitch description provided.'}&quot;
            </p>

            {/* Overlapping Social Platforms */}
            <div className="flex items-center -space-x-2 isolate pt-1">
              {(creatorItem.platforms && creatorItem.platforms.length > 0
                ? creatorItem.platforms
                : ['YouTube', 'Instagram']
              ).map((plat, idx) => (
                <div key={plat} style={{ zIndex: 10 + idx }}>
                  <PlatformBadge platform={plat} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="flex flex-col items-end justify-center shrink-0 pr-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Pitch Quote
          </span>
          <span className="text-lg sm:text-2xl font-black text-purple-300">
            {quoteDisplay}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails(application)}
            type="button"
            className="group/pitch relative h-9 w-20 sm:w-24 rounded-xl bg-slate-900/90 hover:bg-slate-800 hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/50 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center transition-colors duration-200 shadow-sm hover:shadow-md hover:shadow-purple-900/30 cursor-pointer shrink-0 select-none overflow-hidden"
          >
            <span className="transition-transform duration-200 group-hover/pitch:-translate-x-2">
              Pitch
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400 absolute right-2.5 opacity-0 translate-x-2 group-hover/pitch:opacity-100 group-hover/pitch:translate-x-0 transition-all duration-200" />
          </button>

          {hasExistingOffer && application.status !== 'OFFER_ACCEPTED' ? (
            <button
              onClick={() => onSendOffer(application)}
              type="button"
              className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-xs font-bold text-purple-200 hover:text-white border border-purple-400/30 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Offer</span>
            </button>
          ) : application.status === 'OFFER_ACCEPTED' ? (
            <span className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offer Accepted</span>
            </span>
          ) : (
            <button
              onClick={() => onSendOffer(application)}
              type="button"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/25 hover:shadow-purple-600/40 border border-purple-400/20 active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Offer</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid Mode: Identical layout and aesthetic as CreatorCard in Find Influencers & Saved Creators
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleOpenProfile}
      className="p-5 sm:p-6 lg:p-7 rounded-[26px] bg-[#090C15]/95 border border-white/[0.08] backdrop-blur-2xl hover:border-purple-500/40 transition-[border-color,box-shadow] duration-300 group shadow-2xl hover:shadow-purple-950/30 relative overflow-visible flex flex-col md:flex-row gap-5 lg:gap-6 items-stretch cursor-pointer mt-3"
    >
      {/* Background ambient purple glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />

      {/* Floating Match Rate Badge Overlapping Top-Right Corner */}
      <div className="absolute -top-3.5 right-6 sm:right-8 z-30 pointer-events-none">
        <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 border border-purple-400/50 text-xs sm:text-sm font-black text-white flex items-center gap-1.5 shadow-xl shadow-purple-950/80 ring-4 ring-[#090C15] group-hover:scale-105 group-hover:shadow-purple-600/40 transition-all duration-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-pulse shrink-0" />
          <span>{formatMaxOneDecimal(matchScore)}% Match</span>
        </span>
      </div>

      {/* LEFT COLUMN: Portrait Image with Overlapping Badges */}
      <div className="relative w-full md:w-[180px] lg:w-[195px] h-[250px] sm:h-[260px] md:h-auto min-h-[240px] lg:min-h-[260px] shrink-0 rounded-2xl border border-white/10 group-hover:border-purple-500/40 bg-slate-900/60 shadow-md transition-colors flex flex-col justify-end">
        {/* Overlapping Rosette Ribbon Award Medal on top-left corner */}
        {workedWithBrand && (
          <div className="absolute -top-4 -left-4 z-30 pointer-events-auto">
            <BrandWorkedRibbonBadge />
          </div>
        )}

        {/* Clipped Inner Container for Image and Bottom Shadow */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {creatorItem.avatarUrl && !imageError ? (
            <img
              src={creatorItem.avatarUrl || defaultAvatar}
              alt={creatorItem.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-purple-700 via-indigo-700 to-pink-700 flex items-center justify-center text-white font-black text-4xl">
              {creatorItem.name ? creatorItem.name.charAt(0).toUpperCase() : 'C'}
            </div>
          )}

          {/* Gradient shadow for icon legibility at bottom of photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Overlapping Social Media Logos starting from left with no outer card */}
        <div className="relative z-10 p-3 flex items-center justify-start -space-x-2 isolate">
          {(creatorItem.platforms && creatorItem.platforms.length > 0
            ? creatorItem.platforms
            : ['YouTube', 'Instagram']
          ).map((plat, idx) => (
            <div
              key={plat}
              style={{ zIndex: 10 + idx }}
              className="hover:z-30 transition-transform duration-200 hover:scale-125 hover:-translate-y-1"
            >
              <PlatformBadge platform={plat} />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Info, Pitch, Quote & CTA Actions */}
      <div className="flex-1 flex flex-col justify-between space-y-3.5 relative z-10 min-w-0 pt-1">
        <div className="space-y-2.5">
          {/* Top bar: Campaign tag */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                campaignId && onFilterByCampaign?.(campaignId);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/30 text-[11px] font-bold text-purple-200 transition-colors truncate max-w-[240px] text-left cursor-pointer"
              title={`Campaign: ${campaignTitle}`}
            >
              <Target className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">{campaignTitle}</span>
            </button>
          </div>

          {/* Name & Category without @handle and without Zerify Creator tag */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl sm:text-[26px] font-black text-white group-hover:text-purple-300 transition-colors tracking-tight leading-snug truncate">
                {creatorItem.name}
              </h3>
              {creatorItem.isVerified && (
                <span className="shrink-0 text-purple-400" title="Verified Creator">
                  <BadgeCheck className="w-5 h-5 fill-purple-600 text-[#090C15]" />
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 font-medium truncate whitespace-nowrap mt-0.5">
              {creatorItem.category || 'Content Creator'}
            </p>
          </div>

          {/* Description shown normally in italic and truncated to 2 lines with ellipsis */}
          <p className="text-sm text-slate-300/80 leading-relaxed italic line-clamp-2">
            &quot;{application.applicationMessage || creatorItem.bio || 'No pitch description provided.'}&quot;
          </p>
        </div>

        {/* Pitch Quote Amount & Action Buttons */}
        <div className="space-y-4 pt-1">
          {/* Amount Only Display */}
          <div className="flex items-center justify-between py-2 px-1 border-t border-white/[0.08]">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Pitch Quote
            </span>
            <span className="text-2xl sm:text-[28px] font-black text-purple-300 tracking-tight">
              {quoteDisplay}
            </span>
          </div>

          {/* Action Buttons: Full Pitch + Main Action */}
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onViewDetails(application)}
              type="button"
              className="group/pitch relative h-10 sm:h-11 w-24 sm:w-28 rounded-xl bg-slate-900/90 hover:bg-slate-800 hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/50 text-xs sm:text-sm font-bold text-slate-200 hover:text-white flex items-center justify-center transition-colors duration-200 shadow-sm hover:shadow-md hover:shadow-purple-900/30 cursor-pointer shrink-0 select-none overflow-hidden"
            >
              <span className="transition-transform duration-200 group-hover/pitch:-translate-x-2">
                Pitch
              </span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 absolute right-3 opacity-0 translate-x-2 group-hover/pitch:opacity-100 group-hover/pitch:translate-x-0 transition-all duration-200" />
            </button>

            {hasExistingOffer && application.status !== 'OFFER_ACCEPTED' ? (
              <button
                onClick={() => onSendOffer(application)}
                type="button"
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.98] border border-purple-400/30 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change Offer</span>
              </button>
            ) : application.status === 'OFFER_ACCEPTED' ? (
              <div className="flex-1 py-2 sm:py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Offer Accepted</span>
              </div>
            ) : (
              <button
                onClick={() => onSendOffer(application)}
                type="button"
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.98] border border-purple-400/30 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Offer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
