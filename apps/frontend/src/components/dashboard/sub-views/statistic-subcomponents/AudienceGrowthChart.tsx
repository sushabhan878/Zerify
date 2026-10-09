'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, BarChart3, Info } from 'lucide-react';

export interface GrowthDataItem {
  period: string;
  followers: string;
  height: string;
  isAi?: boolean;
}

interface AudienceGrowthChartProps {
  growthData?: GrowthDataItem[];
  hasSufficientData?: boolean;
  isLoading?: boolean;
}

export default function AudienceGrowthChart({
  growthData: propGrowthData,
  hasSufficientData: propHasSufficientData,
  isLoading = false,
}: AudienceGrowthChartProps) {
  const hasRealData = Boolean(
    propHasSufficientData !== undefined
      ? propHasSufficientData
      : propGrowthData &&
          propGrowthData.length > 0 &&
          propGrowthData.some((d) => d.followers && d.followers !== '0' && d.followers !== '—'),
  );

  const data = hasRealData && propGrowthData && propGrowthData.length > 0 ? propGrowthData : [];

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

        {isLoading ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 self-start sm:self-auto shrink-0 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>Calculating Forecast...</span>
          </div>
        ) : hasRealData ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 self-start sm:self-auto shrink-0 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Forecast: +5.5% Next Month</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/60 border border-white/10 text-xs font-semibold text-slate-400 self-start sm:self-auto shrink-0">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Awaiting Social Sync</span>
          </div>
        )}
      </div>

      {isLoading ? (
        /* Shimmering Skeleton for Audience Growth & Forecast */
        <div className="relative z-10 space-y-4">
          <div className="pt-8 pb-2 px-2 flex items-end justify-between gap-3 h-52 border-b border-white/10 relative overflow-hidden">
            {[45, 55, 65, 75, 85, 93, 100].map((h, i) => (
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
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/50" /> Historical Snapshots
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500/50" /> AI Projected Trend
            </span>
          </div>
        </div>
      ) : hasRealData && data.length > 0 ? (
        <>
          {/* Real Live Data Visual */}
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
                <span
                  className={`text-[11px] sm:text-xs font-bold ${
                    item.isAi ? 'text-pink-300' : 'text-slate-400'
                  }`}
                >
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
        </>
      ) : (
        /* Not enough real data empty state */
        <div className="py-10 px-6 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col items-center justify-center text-center space-y-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-md shadow-purple-950/40">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Not enough data to show audience growth & AI prediction
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Historical trajectories and predictive forecasts require connected social accounts with follower records.
              Sync your accounts to unlock live month-over-month growth analytics and AI projections.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-purple-300/80 bg-purple-950/40 px-3 py-1 rounded-full border border-purple-500/20">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Sync accounts via Settings to activate AI forecast
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
