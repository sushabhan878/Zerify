'use client';

import React from 'react';
import { Building2, Sparkles, RotateCcw } from 'lucide-react';

interface CompanyDiscoveryHeaderProps {
  totalResults: number;
  activeFilterCount: number;
  onResetFilters: () => void;
}

export default function CompanyDiscoveryHeader({
  totalResults,
  activeFilterCount,
  onResetFilters,
}: CompanyDiscoveryHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Company Discovery Directory
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Matching Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Find brands and opportunities matching your profile niche, budget & target audience
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>
            <strong className="text-white font-extrabold">{totalResults}</strong> opportunities found
          </span>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}
