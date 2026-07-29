'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function EngagementAnalyticsCard() {
  const metrics = [
    { label: 'Likes & Reactions', val: '98.4K', sub: '7.8% per post', icon: Heart, color: 'text-rose-400' },
    { label: 'Comments & Discussions', val: '14.2K', sub: '1.2% per post', icon: MessageCircle, color: 'text-indigo-400' },
    { label: 'Content Shares', val: '18.6K', sub: 'High Virality', icon: Share2, color: 'text-purple-400' },
    { label: 'Saves & Bookmarks', val: '11.4K', sub: '2.3x Benchmark', icon: Bookmark, color: 'text-amber-400' },
  ];

  const videoStats = [
    { label: 'Avg Watch Time', val: '42 sec' },
    { label: 'Reel Completion Rate', val: '68.5%' },
    { label: 'Story Completion Rate', val: '84.2%' },
    { label: 'Save Rate', val: '3.4%' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-400" />
          <span>Engagement Deep Dive</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Interaction breakdown across likes, saves, and video watch completion</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1 shadow-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{m.label}</span>
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
              <div className="text-xl font-black text-white">{m.val}</div>
              <span className="text-[10px] font-bold text-emerald-400">{m.sub}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-white/10 space-y-2">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <PlayCircle className="w-3.5 h-3.5 text-purple-400" />
          <span>Video & Content Retention Metrics</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {videoStats.map((vs, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
              <div className="text-sm font-extrabold text-white">{vs.val}</div>
              <div className="text-[10px] text-slate-400 font-medium">{vs.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
