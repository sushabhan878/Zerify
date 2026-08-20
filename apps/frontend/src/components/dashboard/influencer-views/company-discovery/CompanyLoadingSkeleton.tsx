'use client';

import React from 'react';
import LottieLoader from '@/components/ui/LottieLoader';
import { Sparkles } from 'lucide-react';

export default function CompanyLoadingSkeleton() {
  return (
    <div className="space-y-6 relative">
      {/* Centered Lottie AI Loading Overlay Banner */}
      <div className="py-12 p-6 rounded-3xl bg-slate-950/60 border border-purple-500/20 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-2 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <LottieLoader size={160} message="" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-spin" />
            <span>Scanning Brand Directory</span>
          </div>
          <h3 className="text-base font-extrabold text-white">Calculating AI Resonance & Match Compatibility</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Matching brand campaign budgets, audience niche alignment, and verified opportunities...
          </p>
        </div>
      </div>

      {/* Grid of Shimmering Placeholder Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4 animate-pulse relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-slate-900 border border-white/5" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-slate-800 rounded-md" />
                  <div className="w-24 h-3 bg-slate-900 rounded-md" />
                </div>
              </div>
              <div className="w-16 h-7 bg-purple-950/50 rounded-xl border border-purple-500/20" />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full h-3 bg-slate-900/80 rounded-md" />
              <div className="w-4/5 h-3 bg-slate-900/60 rounded-md" />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="w-28 h-6 bg-emerald-950/40 rounded-lg" />
              <div className="flex gap-2">
                <div className="w-16 h-8 bg-slate-900 rounded-xl" />
                <div className="w-24 h-8 bg-purple-900/40 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
