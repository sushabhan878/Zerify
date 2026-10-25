'use client';

import { Handshake } from 'lucide-react';

/**
 * 3D diagonal corner ribbon marking creators who have already worked with
 * this brand (backend-computed `hasWorkedWithBrand` signal).
 *
 * Compact variant: the 150px clip area exposes a ~140px band chord, which
 * fits the "Already Worked" label with margin — smaller boxes clip the text.
 * Fold tails sit just past the card edges so the ribbon reads as if it wraps
 * around the card. Requires the parent card to be `overflow-visible`.
 */
export default function AlreadyWorkedRibbon() {
  return (
    <div className="absolute bottom-0 right-0 w-[150px] h-[150px] pointer-events-none z-20 select-none" aria-hidden="true">
      {/* Fold tails just past the card edges — the ribbon's underside wrapping around */}
      <div className="absolute right-[83px] bottom-[-7px] w-[35px] h-[8px] bg-[linear-gradient(100deg,#7e22ce_10%,#2e1065_85%)] [clip-path:polygon(0_0,100%_0,100%_100%)]" />
      <div className="absolute right-[-7px] bottom-[83px] w-[8px] h-[35px] bg-[linear-gradient(190deg,#7e22ce_10%,#2e1065_85%)] [clip-path:polygon(0_0,100%_100%,0_100%)]" />

      {/* Band, clipped to the card's rounded corner */}
      <div className="absolute inset-0 overflow-hidden rounded-br-3xl">
        <div className="absolute left-[15px] top-[88px] w-[180px] h-[24px] -rotate-45 bg-gradient-to-b from-violet-500 via-purple-600 to-indigo-700 shadow-[0_8px_18px_-5px_rgba(76,29,149,0.7)] transition-transform duration-300 group-hover:scale-[1.03]">
          <span className="absolute inset-x-0 top-0 h-[2px] bg-white/40" />
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-indigo-950/80" />
          <span className="flex w-full h-full items-center justify-center gap-1">
            <Handshake className="w-3 h-3 text-purple-100 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" />
            <span className="text-[9.5px] font-black uppercase tracking-[0.06em] text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
              Already Worked
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
