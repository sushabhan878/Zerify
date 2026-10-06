'use client';

import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

export default function EngagementAnalyticsCard() {
  const metrics = [
    {
      label: 'Likes & Reactions',
      val: '98.4K',
      sub: '7.8% per post',
      icon: Heart,
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/15',
      borderColor: 'border-rose-500/30',
    },
    {
      label: 'Comments & Discussions',
      val: '14.2K',
      sub: '1.2% per post',
      icon: MessageCircle,
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/15',
      borderColor: 'border-indigo-500/30',
    },
    {
      label: 'Content Shares',
      val: '18.6K',
      sub: 'High Virality',
      icon: Share2,
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/15',
      borderColor: 'border-purple-500/30',
    },
    {
      label: 'Saves & Bookmarks',
      val: '11.4K',
      sub: '2.3x Benchmark',
      icon: Bookmark,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/15',
      borderColor: 'border-amber-500/30',
    },
  ];

  const videoStats = [
    { label: 'Avg Watch Time', val: '42 sec' },
    { label: 'Reel Completion Rate', val: '68.5%' },
    { label: 'Story Completion Rate', val: '84.2%' },
    { label: 'Save Rate', val: '3.4%' },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
      <div>
        <h3 className="text-base font-bold text-white">
          Engagement Deep Dive
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Interaction breakdown across likes, saves, and video watch completion
        </p>
      </div>

      {/* Main Metrics: Displayed without cards, with clear prominent icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 py-1">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="flex items-center gap-3.5 group">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${m.badgeBg} ${m.borderColor} ${m.color} shadow-sm group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-400 block truncate">
                  {m.label}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
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

      {/* Video & Content Retention: No cards, separated by vertical lines */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <span className="text-xs font-bold text-slate-300 block">
          Video & Content Retention Metrics
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y divide-white/10 sm:divide-y-0 sm:divide-x sm:divide-white/10 py-1">
          {videoStats.map((vs, idx) => (
            <div
              key={idx}
              className={`py-2 px-3 text-center ${
                idx % 2 === 1 ? 'border-l border-white/10 sm:border-l-0' : ''
              }`}
            >
              <div className="text-base sm:text-lg font-black text-white tracking-tight">
                {vs.val}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                {vs.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
