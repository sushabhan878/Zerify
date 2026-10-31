'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface ProfileCompletionBannerProps {
  completionPercentage?: number;
  onCompleteProfile?: () => void;
}

export default function ProfileCompletionBanner({
  completionPercentage = 65,
  onCompleteProfile,
}: ProfileCompletionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Automatically hide when profile completion is 80% or higher
  if (completionPercentage >= 80 || dismissed) {
    return null;
  }

  return (
    <div className="relative overflow-hidden mb-5 p-4 rounded-xl bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-slate-900/80 light:from-purple-50 light:via-white light:to-indigo-50/30 border border-purple-500/30 light:border-purple-200/80 backdrop-blur-xl shadow-xl light:shadow-sm transition-all">
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-600/15 light:bg-purple-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Icon & Setup Progress Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="p-2.5 rounded-lg bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-pink-600/30 light:from-purple-100 light:to-indigo-100 border border-purple-500/40 light:border-purple-200 text-purple-300 light:text-purple-700 shrink-0 shadow-md light:shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-300 light:text-purple-600 animate-pulse" />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-white light:text-slate-900 tracking-tight">
                Complete Profile Setup
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 light:bg-purple-100 border border-purple-500/30 light:border-purple-200 text-purple-300 light:text-purple-700 text-[10px] font-semibold uppercase tracking-wider shrink-0">
                {completionPercentage}% Complete
              </span>
            </div>

            <p className="text-xs text-slate-300/80 light:text-slate-600 leading-relaxed max-w-xl">
              Your profile is <strong className="text-purple-300 light:text-purple-700 font-semibold">{completionPercentage}% setup</strong>. Complete your social handles & payout preferences to unlock 3x higher AI matching scores.
            </p>

            {/* Progress Bar Container */}
            <div className="w-full max-w-md pt-0.5">
              <div className="w-full h-1.5 rounded-full bg-slate-950 light:bg-slate-100 overflow-hidden p-[1px] border border-white/10 light:border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-500 shadow-md shadow-purple-500/50"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: CTA Button & Dismiss */}
        <div className="flex items-center gap-2 self-stretch md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 light:border-slate-200 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={onCompleteProfile}
            type="button"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-purple-950/50 light:shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group border border-purple-400/20 keep-white"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            type="button"
            title="Dismiss notification"
            className="p-1.5 rounded-lg text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
