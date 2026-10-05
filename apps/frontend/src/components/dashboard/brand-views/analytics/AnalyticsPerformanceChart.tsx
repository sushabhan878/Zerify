'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart2, TrendingUp, Sparkles } from 'lucide-react';

export default function AnalyticsPerformanceChart() {
  const [activeMetric, setActiveMetric] = useState<'reach' | 'engagement' | 'er'>('reach');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const dataPoints = [
    { label: 'Week 1', reach: '340K', engagement: '28K', er: '8.2%', reachHeight: '45%', engHeight: '52%' },
    { label: 'Week 2', reach: '520K', engagement: '41K', er: '7.9%', reachHeight: '68%', engHeight: '64%' },
    { label: 'Week 3', reach: '480K', engagement: '36K', er: '7.5%', reachHeight: '62%', engHeight: '58%' },
    { label: 'Week 4', reach: '710K', engagement: '55K', er: '7.7%', reachHeight: '88%', engHeight: '82%' },
    { label: 'Week 5', reach: '620K', engagement: '49K', er: '7.9%', reachHeight: '78%', engHeight: '74%' },
    { label: 'Week 6 (Peak)', reach: '840K', engagement: '68K', er: '8.1%', reachHeight: '100%', engHeight: '95%' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white">Performance Over Time</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Weekly velocity and content performance across all connected marketing channels
          </p>
        </div>

        {/* Metric selection pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('reach')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'reach' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reach
          </button>
          <button
            onClick={() => setActiveMetric('engagement')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'engagement' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Engagement
          </button>
          <button
            onClick={() => setActiveMetric('er')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'er' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Engagement Rate
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative pt-6 pb-2 px-3 h-56 flex items-end justify-between gap-4 border-b border-white/10">
        {dataPoints.map((item, idx) => {
          const height =
            activeMetric === 'reach'
              ? item.reachHeight
              : activeMetric === 'engagement'
              ? item.engHeight
              : `${parseFloat(item.er) * 10}%`;

          const valueDisplay =
            activeMetric === 'reach'
              ? item.reach
              : activeMetric === 'engagement'
              ? item.engagement
              : item.er;

          const barColor =
            activeMetric === 'reach'
              ? 'from-sky-600/70 via-indigo-600/80 to-cyan-400'
              : activeMetric === 'engagement'
              ? 'from-pink-600/70 via-purple-600/80 to-pink-400'
              : 'from-emerald-600/70 via-teal-600/80 to-emerald-400';

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredPoint(idx)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
            >
              {/* Floating Tooltip */}
              {hoveredPoint === idx && (
                <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/20 shadow-2xl text-[11px] font-bold text-white whitespace-nowrap pointer-events-none">
                  <div className="text-purple-300 font-extrabold">{item.label}</div>
                  <div className="text-slate-300">
                    Reach: <span className="text-sky-300">{item.reach}</span> | Eng: <span className="text-pink-300">{item.engagement}</span> ({item.er})
                  </div>
                </div>
              )}

              {/* Value on top of bar */}
              <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {valueDisplay}
              </span>

              {/* Animated Bar with gradient */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className={`w-full max-w-[28px] rounded-t-xl bg-gradient-to-t ${barColor} shadow-lg hover:brightness-125 transition-all`}
              />

              {/* X-Axis Label */}
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors truncate">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Showing weekly data aggregated across 3 verified social networks</span>
        </span>
        <span className="text-emerald-400 font-bold">+18.5% Growth Trajectory</span>
      </div>
    </div>
  );
}
