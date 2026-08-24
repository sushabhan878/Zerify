'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Sparkles,
  Send,
  Heart,
  Eye,
  CheckCircle,
  TrendingUp,
  DollarSign,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export interface CreatorItem {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  avatarBg?: string;
  category: string;
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

export default function CreatorCard({
  creator,
  viewMode,
  onInvite,
  onViewProfile,
  onToggleBookmark,
}: CreatorCardProps) {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
      >
        {/* Creator Identity */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`w-12 h-12 rounded-full ${creator.avatarBg || 'bg-purple-600'} text-white font-black text-base flex items-center justify-center border border-white/20 shadow-md`}
            >
              {creator.name.charAt(0)}
            </div>
            {creator.isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center border border-slate-950">
                <CheckCircle className="w-3 h-3" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                onClick={() => onViewProfile(creator)}
                className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors cursor-pointer truncate"
              >
                {creator.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-[10px] font-black text-purple-300">
                {creator.matchScore}% Match
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
              <span className="text-purple-400 font-semibold">{creator.handle}</span>
              <span>•</span>
              <span className="text-slate-300 font-medium">{creator.category}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-slate-400">
                <MapPin className="w-2.5 h-2.5" />
                {creator.location}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-center shrink-0">
          <div>
            <span className="text-[9.5px] text-slate-500 font-bold uppercase block">Reach</span>
            <span className="text-xs font-black text-white">{creator.reach}</span>
          </div>
          <div>
            <span className="text-[9.5px] text-slate-500 font-bold uppercase block">Eng. Rate</span>
            <span className="text-xs font-black text-emerald-400">{creator.engRate}</span>
          </div>
          <div>
            <span className="text-[9.5px] text-slate-500 font-bold uppercase block">Rating</span>
            <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              {creator.rating}
            </span>
          </div>
          <div>
            <span className="text-[9.5px] text-slate-500 font-bold uppercase block">From</span>
            <span className="text-xs font-black text-purple-300">{creator.startingRate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onViewProfile(creator)}
            type="button"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
          >
            Media Kit
          </button>

          <button
            onClick={() => onInvite(creator)}
            type="button"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/40"
          >
            <Send className="w-3 h-3" />
            <span>Invite</span>
          </button>

          <button
            onClick={() => onToggleBookmark(creator.id)}
            type="button"
            className={`p-2 rounded-xl border transition-colors ${
              creator.isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${creator.isBookmarked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all group"
    >
      {/* Top Header: Avatar, Name, Match Badge & Bookmark */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div
              className={`w-12 h-12 rounded-full ${creator.avatarBg || 'bg-purple-600'} text-white font-black text-base flex items-center justify-center border border-white/20 shadow-md`}
            >
              {creator.name.charAt(0)}
            </div>
            {creator.isVerified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center border border-slate-950 shadow-sm">
                <CheckCircle className="w-3 h-3" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3
                onClick={() => onViewProfile(creator)}
                className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors cursor-pointer"
              >
                {creator.name}
              </h3>
            </div>
            <span className="text-[11px] text-purple-400 font-semibold block">{creator.handle}</span>
            <span className="text-[10.5px] text-slate-400">{creator.category}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-[10px] font-black text-purple-300 shadow-sm">
            {creator.matchScore}% Match
          </span>
          <button
            onClick={() => onToggleBookmark(creator.id)}
            type="button"
            className={`p-1.5 rounded-xl border transition-colors ${
              creator.isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${creator.isBookmarked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bio snippet */}
      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
        {creator.bio}
      </p>

      {/* Platform Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {creator.platforms.map((plat) => (
          <span
            key={plat}
            className="px-2 py-0.5 rounded-md bg-slate-950/70 border border-white/5 text-[10px] font-bold text-slate-300"
          >
            {plat}
          </span>
        ))}
        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-amber-400" />
          {creator.rating}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-center text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Reach</span>
          <span className="font-black text-white">{creator.reach}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Engagement</span>
          <span className="font-black text-emerald-400">{creator.engRate}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Starts at</span>
          <span className="font-black text-purple-300">{creator.startingRate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-1 flex items-center gap-2">
        <button
          onClick={() => onViewProfile(creator)}
          type="button"
          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors"
        >
          View Media Kit
        </button>

        <button
          onClick={() => onInvite(creator)}
          type="button"
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-950/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </div>
    </motion.div>
  );
}
