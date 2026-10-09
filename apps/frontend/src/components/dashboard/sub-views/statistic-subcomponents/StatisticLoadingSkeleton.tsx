'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Eye, DollarSign } from 'lucide-react';

export default function StatisticLoadingSkeleton() {
  const kpiPlaceholders = [
    { label: 'Total Followers', icon: Users, color: 'text-purple-400/50' },
    { label: 'Total Reach', icon: Eye, color: 'text-pink-400/50' },
    { label: 'Avg Engagement Rate', icon: TrendingUp, color: 'text-emerald-400/50' },
    { label: 'Collaboration Earnings', icon: DollarSign, color: 'text-indigo-400/50' },
    { label: 'Profile Visits', icon: Users, color: 'text-blue-400/50' },
    { label: 'Link Clicks', icon: Eye, color: 'text-amber-400/50' },
    { label: 'Brand Invitations', icon: TrendingUp, color: 'text-teal-400/50' },
    { label: 'Total Likes & Saves', icon: Sparkles, color: 'text-rose-400/50' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards Skeleton (4x2 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiPlaceholders.map((item, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl relative overflow-hidden space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{item.label}</span>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-white/10">
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="h-7 w-24 rounded-lg bg-white/10 animate-pulse" />
              <div className="h-3.5 w-16 rounded-md bg-white/5 animate-pulse" />
            </div>

            {/* Ambient Shimmer Sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'linear', delay: idx * 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* 2. Audience Growth & AI Forecast Card Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-56 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-3 w-72 rounded-md bg-white/5 animate-pulse" />
          </div>
          <div className="h-7 w-36 rounded-full bg-purple-500/10 border border-purple-500/20 animate-pulse" />
        </div>

        {/* Simulated Bar Visual */}
        <div className="pt-8 pb-2 px-2 flex items-end justify-between gap-3 h-52 border-b border-white/10 relative overflow-hidden">
          {[48, 58, 68, 76, 85, 92, 100].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                style={{ height: `${h}%` }}
                className={`w-full rounded-t-xl animate-pulse ${
                  i === 6
                    ? 'bg-gradient-to-t from-pink-600/30 to-purple-500/40 border-t border-x border-pink-500/30'
                    : 'bg-gradient-to-t from-purple-900/30 to-indigo-500/40 border-t border-x border-purple-500/20'
                }`}
              />
              <div className="h-3 w-8 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/[0.04] to-transparent pointer-events-none"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
          <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
        </div>
      </div>

      {/* 3. Deep Dive Full-Width Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="h-6 w-48 rounded-lg bg-white/10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-4 p-2 rounded-2xl bg-white/5 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-white/10 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="h-6 w-16 bg-white/15 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Demographics Full-Width Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="h-6 w-32 rounded-lg bg-white/10 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-8 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-6 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
          <div className="flex flex-col items-center justify-center space-y-3 pt-2">
            <div className="w-32 h-32 rounded-full border-8 border-white/10 animate-pulse" />
            <div className="h-3 w-28 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
