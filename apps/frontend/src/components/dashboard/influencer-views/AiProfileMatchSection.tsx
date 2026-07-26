'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AiProfileMatchSection() {
  const matches = [
    { title: 'Velox Tech Sponsor', brand: 'Velox Systems', score: 99, rate: '$3,200', tag: 'High Conversion Potential', reason: 'High alignment with your tech review audience and video engagement.' },
    { title: 'Summer Glow Campaign', brand: 'Lumina Beauty', score: 95, rate: '$1,800', tag: 'Aesthetic Alignment', reason: 'Matches your Instagram demographic age group (18-34).' },
    { title: 'FitFuel Protein Launch', brand: 'FitFuel Global', score: 91, rate: '$2,500', tag: 'High Engagement Match', reason: 'Strong audience crossover with lifestyle and fitness content.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-slate-900 border border-purple-500/40 backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">AI Profile Matching Engine</h2>
            <p className="text-xs text-slate-300">Predictive AI algorithms analyze your audience metrics and brand campaign briefs</p>
          </div>
        </div>
      </div>

      {/* Recommended Matches List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>Top AI-Recommended Deals for You</span>
        </h3>

        {matches.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-500/40 transition-all"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] font-black text-white">
                  {item.score}% Match
                </span>
                <span className="text-xs font-bold text-slate-400">{item.brand}</span>
              </div>
              <h4 className="text-base font-extrabold text-white">{item.title}</h4>
              <p className="text-xs text-slate-300">{item.reason}</p>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Suggested Rate</span>
                <span className="text-base font-black text-emerald-400">{item.rate}</span>
              </div>

              <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-extrabold text-white flex items-center gap-2 transition-all shadow-lg shadow-purple-950/50">
                <span>View Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
