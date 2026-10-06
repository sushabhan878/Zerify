'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles } from 'lucide-react';

export interface GrowthDataItem {
  period: string;
  followers: string;
  height: string;
  isAi?: boolean;
}

interface AudienceGrowthChartProps {
  growthData?: GrowthDataItem[];
}

export default function AudienceGrowthChart({ growthData: propGrowthData }: AudienceGrowthChartProps) {
  const defaultGrowthData: GrowthDataItem[] = [
    { period: 'Jan', followers: '410K', height: '55%' },
    { period: 'Feb', followers: '425K', height: '62%' },
    { period: 'Mar', followers: '438K', height: '70%' },
    { period: 'Apr', followers: '452K', height: '78%' },
    { period: 'May', followers: '468K', height: '86%' },
    { period: 'Jun', followers: '485K', height: '95%' },
    { period: 'Jul (AI Est)', followers: '512K', height: '100%', isAi: true },
  ];

  const data = propGrowthData && propGrowthData.length > 0 ? propGrowthData : defaultGrowthData;

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
      {/* Background subtle ambient grid/glow */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none opacity-20" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 shrink-0" />
            <span>Audience Growth & AI Prediction</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical follower growth across connected platforms with AI forecast
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 self-start sm:self-auto shrink-0 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Forecast: +5.5% Next Month</span>
        </div>
      </div>

      {/* Bar visual */}
      <div className="pt-6 pb-2 px-2 flex items-end justify-between gap-3 h-52 border-b border-white/10 relative z-10">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <span className="text-[11px] font-bold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.followers}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: item.height }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`w-full rounded-t-xl transition-all ${
                item.isAi
                  ? 'bg-gradient-to-t from-pink-600/80 to-purple-500/90 border-t border-x border-pink-400/50 shadow-lg shadow-pink-950/40'
                  : 'bg-gradient-to-t from-purple-900/60 to-indigo-500/70 hover:to-indigo-400 border-t border-x border-purple-400/30'
              }`}
            />
            <span className={`text-[11px] sm:text-xs font-bold ${item.isAi ? 'text-pink-300' : 'text-slate-400'}`}>
              {item.period}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 relative z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Historical Snapshots
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> AI Projected Trend
        </span>
      </div>
    </div>
  );
}
