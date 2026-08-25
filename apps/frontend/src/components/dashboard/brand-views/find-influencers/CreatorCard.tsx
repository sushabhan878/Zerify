'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Sparkles,
  Send,
  Heart,
  CheckCircle,
  MapPin,
} from 'lucide-react';

export interface CreatorItem {
  id: string;
  name: string;
  handle: string;
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

function PlatformBadge({ platform }: { platform: string }) {
  const p = platform.toLowerCase();

  if (p.includes('youtube')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold tracking-wide shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <span>YouTube</span>
      </span>
    );
  }

  if (p.includes('instagram')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-500/10 border border-pink-500/25 text-pink-400 text-xs font-bold tracking-wide shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        <span>Instagram</span>
      </span>
    );
  }

  if (p.includes('tiktok')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold tracking-wide shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46V12.9a8.28 8.28 0 0 0 5.73 2.25V11.7a4.84 4.84 0 0 1-3.77-1.57A4.85 4.85 0 0 1 19.59 6.69z"/>
        </svg>
        <span>TikTok</span>
      </span>
    );
  }

  if (p.includes('twitter') || p.includes(' x')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-white/15 text-slate-200 text-xs font-bold tracking-wide shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span>Twitter / X</span>
      </span>
    );
  }

  if (p.includes('linkedin')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold tracking-wide shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
        <span>LinkedIn</span>
      </span>
    );
  }

  if (p.includes('twitch')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-bold tracking-wide shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
        </svg>
        <span>Twitch</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-bold tracking-wide">
      {platform}
    </span>
  );
}

export default function CreatorCard({
  creator,
  viewMode,
  onInvite,
  onViewProfile,
  onToggleBookmark,
}: CreatorCardProps) {
  const [isLiking, setIsLiking] = useState(false);

  const categoryList =
    creator.categories && creator.categories.length > 0
      ? creator.categories
      : [creator.category];

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

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-3xl bg-[#090D16]/90 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 group shadow-xl hover:shadow-purple-950/20"
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
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center border-2 border-[#090D16] shadow-sm">
                <CheckCircle className="w-3.5 h-3.5 fill-white text-purple-600" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3
                onClick={() => onViewProfile(creator)}
                className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors cursor-pointer truncate"
              >
                {creator.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-[11px] font-black text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                {creator.matchScore}% Match
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1" title={creator.location}>
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {creator.location && creator.location.length > 40
                  ? `${creator.location.slice(0, 40)}...`
                  : creator.location}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-nowrap mt-1.5 min-w-0">
              {categoryList.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-semibold text-[11px] shrink-0"
                >
                  {cat}
                </span>
              ))}
              {categoryList.length > 2 && (
                <span
                  className="text-slate-400 text-xs font-black tracking-widest px-0.5 select-none shrink-0"
                  title={categoryList.slice(2).join(', ')}
                >
                  ...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4 Line-Separated Terms with NO Background */}
        <div className="grid grid-cols-4 divide-x divide-white/10 text-center py-2 shrink-0">
          <div className="px-4">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">REACH</span>
            <span className="text-lg font-black text-white">{creator.reach}</span>
          </div>
          <div className="px-4">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">ENG. RATE</span>
            <span className="text-lg font-black text-emerald-400">{creator.engRate}</span>
          </div>
          <div className="px-4">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">RATING</span>
            <span className="text-lg sm:text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {Number(creator.rating || 5.0).toFixed(1)}
            </span>
          </div>
          <div className="px-4">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">STARTS AT</span>
            <span className="text-lg font-black text-purple-300">{creator.startingRate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onViewProfile(creator)}
            type="button"
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition-all"
          >
            View Profile
          </button>

          <button
            onClick={() => onInvite(creator)}
            type="button"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/40 border border-purple-400/20 active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Invite to Campaign</span>
          </button>

          <button
            onClick={handleHeartClick}
            type="button"
            aria-label="Save creator"
            className={`p-2.5 rounded-2xl border transition-all duration-300 ${
              creator.isBookmarked
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

  // Grid View (Exact Match with Increased Avatar and Aligned Layout)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 sm:p-7 rounded-3xl bg-[#090D16]/95 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-5 hover:border-purple-500/40 transition-all duration-300 group shadow-2xl hover:shadow-purple-950/30 relative overflow-hidden"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute -top-24 -right-24 w-52 h-52 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all" />

      {/* Top Header: Avatar, Name, Location, Match & Heart */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-4 sm:gap-4.5 min-w-0">
          {/* Balanced Size Profile Image */}
          <div className="relative shrink-0">
            {creator.avatarUrl ? (
              <img
                src={creator.avatarUrl}
                alt={creator.name}
                className="w-[68px] h-[68px] rounded-2xl object-cover border-2 border-white/15 group-hover:border-purple-500/50 shadow-md transition-colors"
              />
            ) : (
              <div
                className={`w-[68px] h-[68px] rounded-2xl ${creator.avatarBg || 'bg-purple-600'} text-white font-black text-xl flex items-center justify-center border-2 border-white/15 shadow-md`}
              >
                {creator.name.charAt(0)}
              </div>
            )}
            {creator.isVerified && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center border-2 border-[#090D16] shadow-sm">
                <CheckCircle className="w-3.5 h-3.5 fill-white text-purple-600" />
              </span>
            )}
          </div>

          {/* Clean Aligned Text Section */}
          <div className="min-w-0 flex flex-col justify-center">
            <h3
              onClick={() => onViewProfile(creator)}
              className="text-xl sm:text-2xl font-black text-white group-hover:text-purple-300 transition-colors cursor-pointer truncate tracking-tight leading-tight"
            >
              {creator.name}
            </h3>

            <div className="flex items-center gap-1.5 mt-0.5 text-[11.5px] text-slate-400 font-medium" title={creator.location}>
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span>
                {creator.location && creator.location.length > 40
                  ? `${creator.location.slice(0, 40)}...`
                  : creator.location}
              </span>
            </div>

            {/* Show max 2 Niches, then graceful text ellipsis ... */}
            <div className="flex items-center gap-1.5 flex-nowrap mt-1.5 min-w-0">
              {categoryList.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-white/10 text-[11px] font-semibold text-slate-300 shadow-sm shrink-0"
                >
                  {cat}
                </span>
              ))}
              {categoryList.length > 2 && (
                <span
                  className="text-slate-400 text-xs font-black tracking-widest px-0.5 select-none shrink-0"
                  title={categoryList.slice(2).join(', ')}
                >
                  ...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Match Score Badge & Heart Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="px-3 py-1.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-xs font-black text-purple-300 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {creator.matchScore}% Match
          </span>

          <button
            onClick={handleHeartClick}
            type="button"
            aria-label="Bookmark creator"
            className={`p-2.5 rounded-2xl border transition-all duration-300 ${
              creator.isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/40 ring-2 ring-rose-500/30'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-rose-400 hover:border-rose-500/30'
            } ${isLiking ? 'scale-125' : ''}`}
          >
            <Heart className={`w-4 h-4 ${creator.isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Description / Bio */}
      <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed line-clamp-2 relative z-10">
        {creator.bio}
      </p>

      {/* Connected Social Platform Logos Only */}
      <div className="flex items-center gap-2 flex-wrap relative z-10">
        {creator.platforms.map((plat) => (
          <PlatformBadge key={plat} platform={plat} />
        ))}
      </div>

      {/* 4 Terms Separated by Vertical Lines Only (No Horizontal Lines or Box Background) */}
      <div className="grid grid-cols-4 divide-x divide-white/10 py-2.5 my-1 text-center relative z-10">
        <div className="px-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">REACH</span>
          <span className="text-lg sm:text-xl font-black text-white">{creator.reach}</span>
        </div>
        <div className="px-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">ENG. RATE</span>
          <span className="text-lg sm:text-xl font-black text-emerald-400">{creator.engRate}</span>
        </div>
        <div className="px-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">RATING</span>
          <span className="text-lg sm:text-xl font-black text-amber-400 flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {Number(creator.rating || 5.0).toFixed(1)}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">STARTS AT</span>
          <span className="text-lg sm:text-xl font-black text-purple-300">{creator.startingRate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-1 flex items-center gap-3 relative z-10">
        <button
          onClick={() => onViewProfile(creator)}
          type="button"
          className="flex-1 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-purple-500/30 text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-all"
        >
          View Profile
        </button>

        <button
          onClick={() => onInvite(creator)}
          type="button"
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/50 hover:scale-[1.01] active:scale-[0.98] border border-purple-400/20"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
          <span>Invite to Campaign</span>
        </button>
      </div>
    </motion.div>
  );
}
