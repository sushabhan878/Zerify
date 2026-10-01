'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

export default function ContentOptimizeCard() {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/30 via-white/10 to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_60px_rgba(168,85,247,0.25)] transition-all duration-500 group"
    >
      {/* Overlapping Floating Tag Badge */}
      <div className="absolute -top-4 left-6 z-30 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 border border-purple-500/40 text-[11px] font-bold text-purple-300 tracking-wider uppercase backdrop-blur-2xl shadow-xl">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
        </span>
        <BarChart3 className="w-3.5 h-3.5" />
        <span>ANALYTICS DASHBOARD</span>
      </div>

      <div className="rounded-[23px] bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 h-full pt-8">
        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight group-hover:text-purple-300 transition-colors">
          Track campaign ROI & performance analytics.
        </h3>

        {/* 16:9 Video Box */}
        <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-white/10 overflow-hidden shadow-2xl group-hover:border-purple-500/40 transition-colors">
          <video
            src="/3.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-2xl transform transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed">
          Monitor impressions, engagement rates, click-throughs, and total media value in one unified analytics dashboard.
        </p>
      </div>
    </motion.div>
  );
}
