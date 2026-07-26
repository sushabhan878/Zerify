'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, Send, ArrowRight } from 'lucide-react';

export default function BrandAiRecommendationsSection() {
  const recommendations = [
    { name: 'Sarah Jenkins', handle: '@sarah_creativ', score: 99, roi: '4.2x ROI', matchReason: '98% audience alignment with tech-focused 18-34 demographics.', estCost: '$2,500' },
    { name: 'Marcus Vance', handle: '@marcus_vfit', score: 96, roi: '3.8x ROI', matchReason: 'High engagement rate on product unboxing reels.', estCost: '$1,800' },
    { name: 'Elena Rostova', handle: '@elena_glow', score: 93, roi: '3.5x ROI', matchReason: 'Strong aesthetic match for consumer electronics & desk setups.', estCost: '$2,100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/40 backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">AI Creator Matchmaker</h2>
            <p className="text-xs text-slate-300">Predictive AI algorithms matched with your brand requirements and campaign KPIs</p>
          </div>
        </div>
      </div>

      {/* AI Recommendations List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>Top Match Candidates</span>
        </h3>

        {recommendations.map((creator, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-500/40 transition-all"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[10px] font-black text-white">
                  {creator.score}% AI Match
                </span>
                <span className="text-xs font-bold text-emerald-400">{creator.roi}</span>
              </div>
              <h4 className="text-base font-extrabold text-white">{creator.name} <span className="text-xs font-semibold text-purple-400">({creator.handle})</span></h4>
              <p className="text-xs text-slate-300">{creator.matchReason}</p>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Est. Fee</span>
                <span className="text-base font-black text-emerald-400">{creator.estCost}</span>
              </div>

              <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-extrabold text-white flex items-center gap-2 transition-all shadow-lg shadow-purple-950/50">
                <Send className="w-3.5 h-3.5" />
                <span>Send Direct Offer</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
