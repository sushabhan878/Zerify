'use client';

import React from 'react';
import { Sliders, RefreshCw, Plane } from 'lucide-react';

interface FlexibilityTogglesProps {
  barterAvailable: boolean;
  setBarterAvailable: (val: boolean) => void;
  travelReady: boolean;
  setTravelReady: (val: boolean) => void;
}

export default function FlexibilityToggles({
  barterAvailable,
  setBarterAvailable,
  travelReady,
  setTravelReady,
}: FlexibilityTogglesProps) {
  return (
    <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
        <Sliders className="w-4 h-4 text-purple-400" />
        <span>Flexibility & Availability</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Barter Toggle */}
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-white/10 flex items-center justify-between shadow-inner">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              Available for Barter Deals?
            </span>
            <p className="text-[10.5px] text-slate-400/80">Accept product/service exchanges without cash fee.</p>
          </div>
          <button
            type="button"
            onClick={() => setBarterAvailable(!barterAvailable)}
            className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
              barterAvailable ? 'bg-purple-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                barterAvailable ? 'translate-x-4.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Travel Ready Toggle */}
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-white/10 flex items-center justify-between shadow-inner">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-indigo-400" />
              Travel Ready for Shoots?
            </span>
            <p className="text-[10.5px] text-slate-400/80">Available to travel for brand events & video shoots.</p>
          </div>
          <button
            type="button"
            onClick={() => setTravelReady(!travelReady)}
            className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
              travelReady ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                travelReady ? 'translate-x-4.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
