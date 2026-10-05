'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Calendar } from 'lucide-react';

export default function AudienceGrowthChart() {
  const growthData = [
    { period: 'Jan', followers: '410K', height: '55%' },
    { period: 'Feb', followers: '425K', height: '62%' },
    { period: 'Mar', followers: '438K', height: '70%' },
    { period: 'Apr', followers: '452K', height: '78%' },
    { period: 'May', followers: '468K', height: '86%' },
    { period: 'Jun', followers: '485K', height: '95%' },
    { period: 'Jul (AI Est)', followers: '512K', height: '100%', isAi: true },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Audience Growth & AI Prediction</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Historical follower growth across connected platforms with AI forecast</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Forecast: +5.5% Next Month</span>
        </div>
      </div>

      {/* Bar visual */}
      <div className="pt-6 pb-2 px-2 flex items-end justify-between gap-3 h-48 border-b border-white/10">
        {growthData.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <span className="text-[10px] font-bold text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <span className={`text-[11px] font-bold ${item.isAi ? 'text-pink-300' : 'text-slate-400'}`}>
              {item.period}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
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
