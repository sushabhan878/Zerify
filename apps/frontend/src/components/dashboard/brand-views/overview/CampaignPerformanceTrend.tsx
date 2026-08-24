'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Eye, Heart } from 'lucide-react';

interface TrendDataPoint {
  date: string;
  reach: number;
  reachLabel: string;
  engagement: number;
  engagementLabel: string;
  reachHeight: string;
  engagementHeight: string;
}

export default function CampaignPerformanceTrend() {
  const [metric, setMetric] = useState<'both' | 'reach' | 'engagement'>('both');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const trendData: TrendDataPoint[] = [
    { date: 'Mon', reach: 240, reachLabel: '240K', engagement: 22, engagementLabel: '22K', reachHeight: '48%', engagementHeight: '36%' },
    { date: 'Tue', reach: 310, reachLabel: '310K', engagement: 29, engagementLabel: '29K', reachHeight: '62%', engagementHeight: '46%' },
    { date: 'Wed', reach: 280, reachLabel: '280K', engagement: 26, engagementLabel: '26K', reachHeight: '56%', engagementHeight: '42%' },
    { date: 'Thu', reach: 420, reachLabel: '420K', engagement: 38, engagementLabel: '38K', reachHeight: '84%', engagementHeight: '65%' },
    { date: 'Fri', reach: 490, reachLabel: '490K', engagement: 45, engagementLabel: '45K', reachHeight: '96%', engagementHeight: '76%' },
    { date: 'Sat', reach: 450, reachLabel: '450K', engagement: 41, engagementLabel: '41K', reachHeight: '88%', engagementHeight: '70%' },
    { date: 'Sun', reach: 520, reachLabel: '520K', engagement: 49, engagementLabel: '49K', reachHeight: '100%', engagementHeight: '84%' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white">Campaign Performance Trend</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated Reach and Engagement trajectories across active campaigns
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setMetric('both')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
              metric === 'both' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMetric('reach')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all flex items-center gap-1 ${
              metric === 'reach' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Reach</span>
          </button>
          <button
            onClick={() => setMetric('engagement')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all flex items-center gap-1 ${
              metric === 'engagement' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Engagement</span>
          </button>
        </div>
      </div>

      {/* Chart Visualization Area */}
      <div className="relative pt-6 pb-2 px-2 h-52 flex items-end justify-between gap-3 border-b border-white/10">
        {trendData.map((item, idx) => (
          <div
            key={item.date}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative"
          >
            {/* Tooltip on hover */}
            {hoveredIndex === idx && (
              <div className="absolute -top-10 z-20 px-2.5 py-1 rounded-lg bg-slate-950 border border-white/20 shadow-xl text-[10.5px] font-bold text-white whitespace-nowrap pointer-events-none">
                <span className="text-sky-300">Reach: {item.reachLabel}</span> | <span className="text-pink-300">Eng: {item.engagementLabel}</span>
              </div>
            )}

            {/* Bars */}
            <div className="w-full flex items-end justify-center gap-1 h-full">
              {(metric === 'both' || metric === 'reach') && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: item.reachHeight }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="w-full max-w-[18px] rounded-t-lg bg-gradient-to-t from-sky-600/60 via-sky-500/80 to-cyan-400 hover:brightness-125 transition-all shadow-md shadow-sky-950/50"
                />
              )}
              {(metric === 'both' || metric === 'engagement') && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: item.engagementHeight }}
                  transition={{ duration: 0.5, delay: idx * 0.05 + 0.05 }}
                  className="w-full max-w-[18px] rounded-t-lg bg-gradient-to-t from-pink-600/60 via-purple-500/80 to-pink-400 hover:brightness-125 transition-all shadow-md shadow-pink-950/50"
                />
              )}
            </div>

            <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">
              {item.date}
            </span>
          </div>
        ))}
      </div>

      {/* Legend & Takeaway */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-semibold">Daily Reach</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
            <span className="text-slate-300 font-semibold">Daily Engagement</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Peak engagement on weekends (+28% surge)</span>
        </div>
      </div>
    </div>
  );
}
