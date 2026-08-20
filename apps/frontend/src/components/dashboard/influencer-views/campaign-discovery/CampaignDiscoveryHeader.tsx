'use client';

import React from 'react';
import { Compass, Sparkles, ShieldCheck, Flame, Layers } from 'lucide-react';

interface CampaignDiscoveryHeaderProps {
  totalCampaigns: number;
  filteredCount: number;
}

export default function CampaignDiscoveryHeader({
  totalCampaigns,
  filteredCount,
}: CampaignDiscoveryHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
            <Compass className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Campaign Discovery & Brand Deals</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-300">
              Live Deals
            </span>
          </h1>
        </div>
        <p className="text-xs text-slate-400/90 mt-1">
          Explore vetted brand briefs, high-paying sponsorships, product seeding & revenue-share campaigns
        </p>
      </div>

      {/* Live Badge Metrics */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-300">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{filteredCount} Active Briefs</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Escrow Secured</span>
        </div>
      </div>
    </div>
  );
}
