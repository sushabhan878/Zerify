'use client';

import React, { useState } from 'react';
import { ArrowLeft, Share2, Heart, Plus } from 'lucide-react';
import { CreatorItem } from '../CreatorCard';

interface ProfileHeaderProps {
  creator: CreatorItem;
  onBack: () => void;
  onInvite: (creator: CreatorItem) => void;
  onToggleBookmark: (creatorId: string) => void;
}

export default function ProfileHeader({
  creator,
  onBack,
  onInvite,
  onToggleBookmark,
}: ProfileHeaderProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  const roleTitle = creator.role || `${creator.category} Content Creator`;

  const handleHeartClick = () => {
    setIsLiking(true);
    setTimeout(() => setIsLiking(false), 400);
    onToggleBookmark(creator.id);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Back Navigation Bar */}
      <div>
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Influencers</span>
        </button>
      </div>

      {/* Main Title & Action Buttons Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {roleTitle}
        </h1>

        <div className="flex items-center gap-3 shrink-0">
          {/* Share Button */}
          <button
            onClick={handleShare}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all relative shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share</span>
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-purple-600 text-[10px] text-white font-bold whitespace-nowrap shadow-md">
                Copied!
              </span>
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={handleHeartClick}
            type="button"
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              creator.isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/20'
                : 'bg-slate-900/90 text-slate-200 border-white/10 hover:text-rose-400 hover:border-rose-500/30'
            } ${isLiking ? 'scale-110' : ''}`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                creator.isBookmarked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
            <span>{creator.isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Invite to Campaign Button */}
          <button
            onClick={() => onInvite(creator)}
            type="button"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] border border-pink-400/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Invite to Campaign</span>
          </button>
        </div>
      </div>
    </div>
  );
}
