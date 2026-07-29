'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Eye, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function StepTwoVerify() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      {/* Left Column: Floating Overlapping Analytics UI (No Background Box!) */}
      <div className="lg:col-span-6 lg:order-1 order-2 relative flex justify-center items-center py-6">
        {/* Background Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Main Floating Glass Panel: Analytics Verification */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 rounded-3xl bg-slate-900/95 border-2 border-purple-500/40 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Live Verified Stats</h4>
                  <p className="text-[10px] text-slate-400">Direct API Integration</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                100% Authentic
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950/80 border border-white/10 p-3 rounded-2xl">
                <p className="text-lg font-black text-white">18.4K</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-purple-400" /> Followers
                </p>
              </div>
              <div className="bg-slate-950/80 border border-white/10 p-3 rounded-2xl">
                <p className="text-lg font-black text-white">4.8K</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3 text-indigo-400" /> Avg Views
                </p>
              </div>
              <div className="bg-slate-950/80 border border-white/10 p-3 rounded-2xl">
                <p className="text-lg font-black text-emerald-400">4.2%</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Eng. Rate
                </p>
              </div>
            </div>

            {/* Audience Location Bars */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-200">Verified Audience Locations</p>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1 text-[11px]">
                    <span>🇺🇸 United States</span>
                    <span>54%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full w-[54%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1 text-[11px]">
                    <span>🇬🇧 United Kingdom</span>
                    <span>22%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full w-[22%]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Overlapping Floating Badge Chip (Top Right) */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 -right-6 z-30 px-4 py-2.5 rounded-2xl bg-slate-950/90 border border-purple-500/50 backdrop-blur-2xl shadow-2xl flex items-center gap-2 text-xs font-bold text-white"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Zero Self-Reported Metrics</span>
          </motion.div>

          {/* Overlapping Floating Badge Chip (Bottom Left) */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-6 -left-6 z-30 px-4 py-2.5 rounded-2xl bg-slate-950/90 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl flex items-center gap-2 text-xs font-bold text-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Live Account Sync</span>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Step Details */}
      <div className="lg:col-span-6 space-y-6 lg:order-2 order-1">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 uppercase tracking-widest backdrop-blur-md">
          <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          <span>02 / VIEW AND VERIFY</span>
        </div>

        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] [font-family:'Playfair_Display',Georgia,serif]">
          See Exactly Who You Are Hiring Before Any Money Moves.
        </h3>

        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Every creator profile shows verified engagement rate, average views over the last 30 days, audience demographics (age, gender, location breakdown), starting price per content type, and portfolio. Zerify pulls this data directly from connected platform accounts, so what you see reflects actual performance, not self-reported numbers.
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 30-Day Avg Views
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Direct Portfolio Pull
          </span>
        </div>
      </div>
    </div>
  );
}
