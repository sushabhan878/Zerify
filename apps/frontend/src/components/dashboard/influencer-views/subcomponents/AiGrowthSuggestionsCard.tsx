'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ShieldCheck, DollarSign } from 'lucide-react';

export default function AiGrowthSuggestionsCard() {
  const suggestions = [
    {
      title: 'Connect TikTok Account',
      impact: '+25% Brand Match Rate',
      desc: 'Brands looking for multi-platform creators in Tech & Fitness',
      icon: TrendingUp,
      badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Update Rate Card Pricing',
      impact: '+18% Est. Revenue',
      desc: 'Your engagement rate (6.8%) supports premium reel rate tier',
      icon: DollarSign,
      badgeColor: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    },
    {
      title: 'Complete Profile Verification',
      impact: 'Instant Trust Badge',
      desc: 'Verified profiles get 3x faster response times from top brands',
      icon: ShieldCheck,
      badgeColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Growth Insights</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Automated suggestions to maximize your deal conversion</p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((sug, idx) => {
          const Icon = sug.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="p-4 rounded-xl bg-slate-950/60 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 shrink-0 mt-0.5 sm:mt-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>{sug.title}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${sug.badgeColor}`}>
                      {sug.impact}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{sug.desc}</p>
                </div>
              </div>

              <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md hover:scale-105 transition-all shrink-0">
                Optimize
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
