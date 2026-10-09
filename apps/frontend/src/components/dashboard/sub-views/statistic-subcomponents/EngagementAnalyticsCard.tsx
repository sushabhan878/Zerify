'use client';

import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

export interface DeepDiveData {
  likesAndReactions?: { val: string; sub: string };
  commentsAndDiscussions?: { val: string; sub: string };
  contentShares?: { val: string; sub: string };
  savesAndBookmarks?: { val: string; sub: string };
  videoRetention?: {
    avgWatchTime?: string;
    reelCompletionRate?: string;
    storyCompletionRate?: string;
    saveRate?: string;
  };
}

interface EngagementAnalyticsCardProps {
  deepDive?: DeepDiveData;
  isLoading?: boolean;
}

export default function EngagementAnalyticsCard({ deepDive, isLoading = false }: EngagementAnalyticsCardProps) {
  const metrics = [
    {
      label: 'Likes & Reactions',
      val: deepDive?.likesAndReactions?.val ?? '0',
      sub: deepDive?.likesAndReactions?.sub ?? '0 per post',
      icon: Heart,
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/15',
      borderColor: 'border-rose-500/30',
    },
    {
      label: 'Comments & Discussions',
      val: deepDive?.commentsAndDiscussions?.val ?? '0',
      sub: deepDive?.commentsAndDiscussions?.sub ?? '0 per post',
      icon: MessageCircle,
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/15',
      borderColor: 'border-indigo-500/30',
    },
    {
      label: 'Content Shares',
      val: deepDive?.contentShares?.val ?? '0',
      sub: deepDive?.contentShares?.sub ?? '0 shares',
      icon: Share2,
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/15',
      borderColor: 'border-purple-500/30',
    },
    {
      label: 'Saves & Bookmarks',
      val: deepDive?.savesAndBookmarks?.val ?? '0',
      sub: deepDive?.savesAndBookmarks?.sub ?? '0 saves',
      icon: Bookmark,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/15',
      borderColor: 'border-amber-500/30',
    },
  ];

  const videoStats = [
    { label: 'Avg Watch Time', val: deepDive?.videoRetention?.avgWatchTime ?? '0 sec' },
    { label: 'Reel Completion Rate', val: deepDive?.videoRetention?.reelCompletionRate ?? '0%' },
    { label: 'Story Completion Rate', val: deepDive?.videoRetention?.storyCompletionRate ?? '0%' },
    { label: 'Save Rate', val: deepDive?.videoRetention?.saveRate ?? '0%' },
  ];

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-8">
      {/* Background subtle ambient grid/glow */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none opacity-20" />

      {/* Header with Icon & Matching Analytics Text Size */}
      <div className="relative z-10 space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
          <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-pink-400 shrink-0" />
          <span>Engagement Deep Dive</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Interaction breakdown across likes, saves, and video watch completion
        </p>
      </div>

      {/* Main Metrics: Spacious grid with generous gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 py-2 relative z-10">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-2 rounded-2xl relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-white/10 animate-pulse shrink-0" />
                <div className="min-w-0 space-y-2 flex-1">
                  <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-white/15 rounded animate-pulse" />
                </div>
              </div>
            ))
          : metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${m.badgeBg} ${m.borderColor} ${m.color} shadow-md group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-xs font-semibold text-slate-400 block truncate">
                      {m.label}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {m.val}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        {m.sub}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Video & Content Retention: Enhanced spacing separated by vertical lines */}
      <div className="pt-6 border-t border-white/10 space-y-4 relative z-10">
        <span className="text-xs sm:text-sm font-bold text-slate-300 block">
          Video & Content Retention Metrics
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y divide-white/10 sm:divide-y-0 sm:divide-x sm:divide-white/10 py-2">
          {isLoading
            ? [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`py-3 px-4 sm:px-6 text-center space-y-2 ${
                    i % 2 === 0 ? 'border-l border-white/10 sm:border-l-0' : ''
                  }`}
                >
                  <div className="h-6 w-16 mx-auto bg-white/15 rounded animate-pulse" />
                  <div className="h-3 w-20 mx-auto bg-white/10 rounded animate-pulse" />
                </div>
              ))
            : videoStats.map((vs, idx) => (
                <div
                  key={idx}
                  className={`py-3 px-4 sm:px-6 text-center space-y-1 ${
                    idx % 2 === 1 ? 'border-l border-white/10 sm:border-l-0' : ''
                  }`}
                >
                  <div className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {vs.val}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {vs.label}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
