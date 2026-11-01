'use client';

import { Handshake } from 'lucide-react';

/**
 * 3D diagonal corner ribbon marking creators who have already worked with
 * this brand (backend-computed `hasWorkedWithBrand` signal).
 *
 * Compact variant: the 150px clip area exposes a ~140px band chord, which
 * fits the "Already Worked" label with margin — smaller boxes clip the text.
 * Fold tails sit just past the card edges so the ribbon reads as if it wraps
 * around the card. In light mode, fold tails are hidden so they don't poke out
 * as dark artifacts onto the light page canvas.
 */
export default function AlreadyWorkedRibbon() {
  return (
    <div className="absolute bottom-0 right-0 w-[150px] h-[150px] pointer-events-none z-20 select-none keep-white" aria-hidden="true">
      {/* Fold tails: underside wrapping effect in dark mode; hidden in light mode so they don't poke out as dark artifacts */}
      <div className="absolute right-[83px] bottom-[-7px] w-[35px] h-[8px] bg-[linear-gradient(100deg,#7e22ce_10%,#2e1065_85%)] [clip-path:polygon(0_0,100%_0,100%_100%)] light:hidden" />
      <div className="absolute right-[-7px] bottom-[83px] w-[8px] h-[35px] bg-[linear-gradient(190deg,#7e22ce_10%,#2e1065_85%)] [clip-path:polygon(0_0,100%_100%,0_100%)] light:hidden" />

      {/* Band, clipped to the card's rounded corner */}
      <div className="absolute inset-0 light:inset-[1px] overflow-hidden rounded-br-3xl light:rounded-br-[23px]">
        <div className="absolute left-[15px] top-[88px] w-[180px] h-[24px] -rotate-45 bg-gradient-to-b from-violet-500 via-purple-600 to-indigo-700 light:bg-gradient-to-r light:from-purple-600 light:via-purple-600 light:to-indigo-600 shadow-[0_8px_18px_-5px_rgba(76,29,149,0.7)] light:shadow-sm transition-transform duration-300 group-hover:scale-[1.03]">
          <span className="absolute inset-x-0 top-0 h-[2px] bg-white/40 light:bg-white/25" />
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-indigo-950/80 light:bg-purple-950/20" />
          <span className="flex w-full h-full items-center justify-center gap-1.5 text-white keep-white">
            <Handshake className="w-3.5 h-3.5 text-white keep-white shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
            <span className="text-[9.5px] font-black uppercase tracking-[0.06em] text-white keep-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Already Worked
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
