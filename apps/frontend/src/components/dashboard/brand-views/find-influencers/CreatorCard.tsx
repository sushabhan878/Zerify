'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Sparkles,
  Send,
  Heart,
  BadgeCheck,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export interface CreatorItem {
  id: string;
  name: string;
  handle: string;
  role?: string;
  avatarUrl?: string;
  avatarBg?: string;
  category: string;
  categories?: string[];
  bio: string;
  reach: string;
  reachNumber: number;
  engRate: string;
  engRateNumber: number;
  rating: number;
  startingRate: string;
  rateNumber: number;
  platforms: string[];
  primaryPlatform: string;
  location: string;
  statusText?: string;
  matchScore: number;
  matchReasons: string[];
  isVerified: boolean;
  isBookmarked?: boolean;
  skills: string[];
  topAudienceAge?: string;
  topAudienceGender?: string;
  creatorTier: string;
}

interface CreatorCardProps {
  creator: CreatorItem;
  viewMode: 'grid' | 'list';
  onInvite: (creator: CreatorItem) => void;
  onViewProfile: (creator: CreatorItem) => void;
  onToggleBookmark: (creatorId: string) => void;
}

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

function PlatformBadge({ platform }: { platform: string }) {
  const p = platform.toLowerCase().trim();
  const baseClasses =
    'w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-[#090C15] flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer overflow-hidden bg-slate-900 border border-white/10 hover:ring-purple-400/60';

  let iconSrc: string | null = null;
  if (p.includes('youtube')) iconSrc = SOCIAL_ICONS.youtube;
  else if (p.includes('instagram')) iconSrc = SOCIAL_ICONS.instagram;
  else if (p.includes('twitter') || p === 'x' || p.includes(' x')) iconSrc = SOCIAL_ICONS.twitter;
  else if (p.includes('linkedin')) iconSrc = SOCIAL_ICONS.linkedin;
  else if (p.includes('facebook')) iconSrc = SOCIAL_ICONS.facebook;
  else if (p.includes('threads')) iconSrc = SOCIAL_ICONS.threads;
  else if (p.includes('tiktok') || p.includes('tik-tok') || p.includes('tik tok')) iconSrc = SOCIAL_ICONS.tiktok;

  if (iconSrc) {
    return (
      <span
        title={platform}
        className={`${baseClasses} p-1 hover:scale-115`}
      >
        <img
          src={iconSrc}
          alt={platform}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }

  if (p.includes('twitch')) {
    return (
      <span
        title="Twitch"
        className={`${baseClasses} bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25`}
      >
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      </span>
    );
  }

  return (
    <span
      title={platform}
      className={`${baseClasses} bg-slate-800 border border-white/10 text-slate-200 text-xs font-bold`}
    >
      {platform.charAt(0)}
    </span>
  );
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

export default function CreatorCard({
  creator,
  viewMode = 'grid',
  onInvite,
  onViewProfile,
  onToggleBookmark,
}: CreatorCardProps) {
  const { formatBudget } = useCurrency();
  const [isLiking, setIsLiking] = useState(false);


  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiking(true);
    setTimeout(() => setIsLiking(false), 400);

    onToggleBookmark(creator.id);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      await fetch(`${apiUrl}/brand/saved-creators/${creator.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn('Could not persist bookmark to DB:', err);
    }
  };

  const defaultAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';
  const categoryRaw = creator.category || creator.role || 'Content Creator';
  const categoryDisplay = categoryRaw.length > 24 ? `${categoryRaw.slice(0, 24)}...` : categoryRaw;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => onViewProfile(creator)}
        className="p-5 rounded-3xl bg-[#0a0d14]/95 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 group shadow-xl hover:shadow-purple-950/20 cursor-pointer"
      >
        {/* Creator Identity */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            {creator.avatarUrl ? (
              <img
                src={creator.avatarUrl}
                alt={creator.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-white/15 group-hover:border-purple-500/50 shadow-md transition-colors"
              />
            ) : (
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl ${creator.avatarBg || 'bg-purple-600'} text-white font-black text-xl flex items-center justify-center border-2 border-white/15 shadow-md`}
              >
                {creator.name.charAt(0)}
              </div>
            )}
            {creator.isVerified && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center border-2 border-[#090D16] shadow-sm">
                <BadgeCheck className="w-3.5 h-3.5 fill-white text-purple-600" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                {creator.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[11px] font-black text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                {formatMaxOneDecimal(creator.matchScore)}% Match
              </span>
            </div>

            <div
              title={categoryRaw}
              className="text-xs text-slate-400 font-medium truncate mt-0.5"
            >
              {categoryDisplay}
            </div>

            {/* Overlapping Social Platforms */}
            <div className="flex items-center -space-x-2 isolate mt-2">
              {(creator.platforms && creator.platforms.length > 0
                ? creator.platforms
                : ['YouTube']
              ).map((plat, idx) => (
                <div
                  key={plat}
                  style={{ zIndex: 10 + idx }}
                  className="hover:z-30 transition-transform duration-200 hover:scale-115 hover:-translate-y-0.5"
                >
                  <PlatformBadge platform={plat} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Metric Numbers: Reach, Eng Rate, Rating separated by vertical lines only */}
        <div className="grid grid-cols-3 divide-x divide-white/15 text-center py-1.5 shrink-0">
          {/* REACH */}
          <div className="relative group/metric px-4 py-0.5 flex items-center justify-center cursor-default">
            <span className="text-lg sm:text-xl font-black text-white group-hover/metric:text-purple-300 transition-colors">
              {formatMaxOneDecimal(creator.reach)}
            </span>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0d121f] border border-white/20 text-[11px] font-bold text-slate-200 shadow-xl opacity-0 pointer-events-none group-hover/metric:opacity-100 group-hover/metric:-translate-y-1 transition-all duration-200 z-30 whitespace-nowrap">
              Reach
              <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#0d121f]" />
            </div>
          </div>

          {/* ENG. RATE */}
          <div className="relative group/metric px-4 py-0.5 flex items-center justify-center cursor-default">
            <span className="text-lg sm:text-xl font-black text-emerald-400 group-hover/metric:text-emerald-300 transition-colors">
              {formatMaxOneDecimal(creator.engRate)}
            </span>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0d121f] border border-white/20 text-[11px] font-bold text-slate-200 shadow-xl opacity-0 pointer-events-none group-hover/metric:opacity-100 group-hover/metric:-translate-y-1 transition-all duration-200 z-30 whitespace-nowrap">
              Eng. Rate
              <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#0d121f]" />
            </div>
          </div>

          {/* RATING */}
          <div className="relative group/metric px-4 py-0.5 flex items-center justify-center cursor-default">
            <span className="text-lg sm:text-xl font-black text-amber-400 group-hover/metric:text-amber-300 transition-colors">
              {Number(creator.rating || 5.0).toFixed(1)}
            </span>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0d121f] border border-white/20 text-[11px] font-bold text-slate-200 shadow-xl opacity-0 pointer-events-none group-hover/metric:opacity-100 group-hover/metric:-translate-y-1 transition-all duration-200 z-30 whitespace-nowrap">
              Rating
              <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#0d121f]" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onInvite(creator)}
            type="button"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/25 hover:shadow-purple-600/40 border border-purple-400/20 active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Invite to Campaign</span>
          </button>

          <button
            onClick={handleHeartClick}
            type="button"
            aria-label="Save creator"
            className={`p-2.5 rounded-2xl border transition-all duration-300 ${creator.isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/30'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-rose-400'
              } ${isLiking ? 'scale-125' : ''}`}
          >
            <Heart className={`w-4 h-4 ${creator.isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </motion.div>
    );
  }

  // Redesigned Card (Larger Size & Overlapping Match Badge on Top-Right Corner)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => onViewProfile(creator)}
      className="p-5 sm:p-6 lg:p-7 rounded-[26px] bg-[#090C15]/95 border border-white/[0.08] backdrop-blur-2xl hover:border-purple-500/40 transition-all duration-300 group shadow-2xl hover:shadow-purple-950/30 relative overflow-visible flex flex-col md:flex-row gap-5 lg:gap-6 items-stretch cursor-pointer mt-3"
    >
      {/* Subtle background ambient purple glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />

      {/* Floating Match Rate Badge Overlapping Top-Right Corner */}
      <div className="absolute -top-3.5 right-6 sm:right-8 z-30 pointer-events-none">
        <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 border border-purple-400/50 text-xs sm:text-sm font-black text-white flex items-center gap-1.5 shadow-xl shadow-purple-950/80 ring-4 ring-[#090C15] group-hover:scale-105 group-hover:shadow-purple-600/40 transition-all duration-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-pulse shrink-0" />
          <span>{formatMaxOneDecimal(creator.matchScore)}% Match</span>
        </span>
      </div>

      {/* LEFT COLUMN: Portrait Image with Overlapping Social Badges at Bottom */}
      <div className="relative w-full md:w-[180px] lg:w-[195px] h-[250px] sm:h-[260px] md:h-auto min-h-[240px] lg:min-h-[260px] shrink-0 rounded-2xl overflow-hidden border border-white/10 group-hover:border-purple-500/40 bg-slate-900/60 shadow-md transition-colors flex flex-col justify-end">
        <img
          src={creator.avatarUrl || defaultAvatar}
          alt={creator.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Gradient shadow for icon legibility at bottom of photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

        {/* Overlapping Social Media Logos starting from left with no outer card */}
        <div className="relative z-10 p-3 flex items-center justify-start -space-x-2 isolate">
          {(creator.platforms && creator.platforms.length > 0
            ? creator.platforms
            : ['YouTube']
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

      {/* RIGHT COLUMN: Info, Bio, Metrics & CTA Button */}
      <div className="flex-1 flex flex-col justify-between space-y-3.5 relative z-10 min-w-0 pt-1">
        <div>
          {/* Top Row: Name, Role & Heart Bookmark Button */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl sm:text-[26px] font-black text-white group-hover:text-purple-300 transition-colors tracking-tight leading-snug truncate">
                  {creator.name}
                </h3>
                {creator.isVerified && (
                  <span className="shrink-0 text-purple-400" title="Verified Creator">
                    <BadgeCheck className="w-5 h-5 fill-purple-600 text-[#090C15]" />
                  </span>
                )}
              </div>
              <p
                title={categoryRaw}
                className="text-sm sm:text-[15px] text-slate-300 font-medium truncate whitespace-nowrap"
              >
                {categoryDisplay}
              </p>
            </div>

            <button
              onClick={handleHeartClick}
              type="button"
              aria-label="Bookmark creator"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${creator.isBookmarked
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-lg shadow-rose-500/30'
                  : 'bg-white/[0.03] text-slate-400 border-white/15 hover:border-white/30 hover:text-rose-400'
                } ${isLiking ? 'scale-125' : ''}`}
            >
              <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${creator.isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Bio / Description */}
          <p className="text-sm text-slate-300/90 leading-relaxed mt-2.5 line-clamp-2">
            {creator.bio}
          </p>
        </div>

        {/* Metrics & Action Button */}
        <div className="space-y-4 sm:space-y-5 pt-1">
          <div className="grid grid-cols-3 divide-x divide-white/15 py-1 text-center">
            {/* REACH */}
            <div className="relative group/metric px-2 py-0.5 flex items-center justify-center cursor-default">
              <span className="text-xl sm:text-2xl lg:text-[26px] font-black text-white leading-tight tracking-tight group-hover/metric:text-purple-300 transition-colors">
                {formatMaxOneDecimal(creator.reach)}
              </span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0d121f] border border-white/20 text-[11px] font-bold text-slate-200 shadow-xl opacity-0 pointer-events-none group-hover/metric:opacity-100 group-hover/metric:-translate-y-1 transition-all duration-200 z-30 whitespace-nowrap">
                Reach
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#0d121f]" />
              </div>
            </div>

            {/* ENG. RATE */}
            <div className="relative group/metric px-2 py-0.5 flex items-center justify-center cursor-default">
              <span className="text-xl sm:text-2xl lg:text-[26px] font-black text-emerald-400 leading-tight tracking-tight group-hover/metric:text-emerald-300 transition-colors">
                {formatMaxOneDecimal(creator.engRate)}
              </span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0d121f] border border-white/20 text-[11px] font-bold text-slate-200 shadow-xl opacity-0 pointer-events-none group-hover/metric:opacity-100 group-hover/metric:-translate-y-1 transition-all duration-200 z-30 whitespace-nowrap">
                Eng. Rate
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#0d121f]" />
              </div>
            </div>

            {/* RATING */}
            <div className="relative group/metric px-2 py-0.5 flex items-center justify-center cursor-default">
              <span className="text-xl sm:text-2xl lg:text-[26px] font-black text-amber-400 leading-tight tracking-tight group-hover/metric:text-amber-300 transition-colors">
                {Number(creator.rating || 5.0).toFixed(1)}
              </span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#0d121f] border border-white/20 text-[11px] font-bold text-slate-200 shadow-xl opacity-0 pointer-events-none group-hover/metric:opacity-100 group-hover/metric:-translate-y-1 transition-all duration-200 z-30 whitespace-nowrap">
                Rating
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#0d121f]" />
              </div>
            </div>
          </div>

          {/* Action Button: Invite to Campaign (decreased height) */}
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInvite(creator);
              }}
              type="button"
              className="w-full py-2 sm:py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.98] border border-purple-400/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invite to Campaign</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
