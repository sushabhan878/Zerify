'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Eye, TrendingUp } from 'lucide-react';

export default function StepTwoVerify() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Left Column: Visual Container with Pastel Purple Frame (Alternating!) */}
      <div className="lg:col-span-6 lg:order-1 order-2">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-[2.5rem] bg-gradient-to-br from-purple-500/20 via-indigo-600/10 to-transparent p-6 sm:p-10 border border-purple-500/30 shadow-2xl overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Embedded UI Analytics Card Mockup */}
          <div className="relative rounded-2xl bg-slate-950/90 border border-white/15 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Analytics Verification
              </span>
              <span className="text-xs font-semibold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30">
                TikTok Live API
              </span>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900/80 border border-white/10 p-3 rounded-xl">
                <p className="text-base sm:text-xl font-black text-white">18.4K</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-purple-400" /> Followers
                </p>
              </div>
              <div className="bg-slate-900/80 border border-white/10 p-3 rounded-xl">
                <p className="text-base sm:text-xl font-black text-white">4.8K</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3 text-indigo-400" /> Avg Views
                </p>
              </div>
              <div className="bg-slate-900/80 border border-white/10 p-3 rounded-xl">
                <p className="text-base sm:text-xl font-black text-emerald-400">4.2%</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Engagement
                </p>
              </div>
            </div>

            {/* Audience Location Progress Bars */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-200">Audience Location Breakdown</p>
              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1 text-[11px]">
                    <span>🇺🇸 United States</span>
                    <span>54%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                    <div className="bg-purple-500 h-full rounded-full w-[54%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1 text-[11px]">
                    <span>🇬🇧 United Kingdom</span>
                    <span>22%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                    <div className="bg-indigo-500 h-full rounded-full w-[22%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Step Info (Alternating!) */}
      <div className="lg:col-span-6 space-y-5 lg:order-2 order-1">
        <span className="text-xs font-black uppercase tracking-widest text-purple-400">
          02 / VIEW AND VERIFY
        </span>
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.18] [font-family:'Playfair_Display',Georgia,serif]">
          See Exactly Who You Are Hiring Before Any Money Moves.
        </h3>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Every creator profile shows verified engagement rate, average views over the last 30 days, audience demographics (age, gender, location breakdown), starting price per content type, and portfolio. Zerify pulls this data directly from connected platform accounts, so what you see reflects actual performance, not self-reported numbers.
        </p>
      </div>
    </div>
  );
}
