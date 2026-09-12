'use client';

import React from 'react';
import { Briefcase, Sparkles } from 'lucide-react';

interface PortfolioTabProps {
  onSaveSuccess?: () => void;
}

export default function PortfolioTab({ onSaveSuccess }: PortfolioTabProps) {
  return (
    <div className="p-12 sm:p-16 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl text-center flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden space-y-5">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Glowing Icon Badge */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-2xl blur-lg opacity-40 animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-2xl">
          <Briefcase className="w-8 h-8 drop-shadow-[0_4px_8px_rgba(168,85,247,0.5)]" />
        </div>
      </div>

      {/* Clean Coming Soon Message */}
      <div className="space-y-2 relative z-10 max-w-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>COMING SOON</span>
        </div>
        <h3 className="text-2xl font-extrabold text-white tracking-tight">
          Coming Soon...
        </h3>
        <p className="text-xs text-slate-400">
          This feature is currently under development and will be available soon.
        </p>
      </div>
    </div>
  );
}
