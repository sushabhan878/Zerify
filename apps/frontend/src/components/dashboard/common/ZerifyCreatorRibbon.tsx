'use client';

import { ShieldCheck } from 'lucide-react';

/**
 * 3D diagonal corner ribbon for verified Zerify Creators.
 *
 * The band is shaded top-to-bottom (cylinder highlight) and clipped to the
 * card's rounded corner; two dark fold tails sit just past the card edges so
 * the ribbon reads as if it wraps around the card. The 190px clip area keeps
 * the full "Zerify Creator" text visible — smaller boxes clip the last letters.
 */
export default function ZerifyCreatorRibbon() {
  return (
    <div className="absolute bottom-0 right-0 w-[190px] h-[190px] pointer-events-none z-20 select-none" aria-hidden="true">
      {/* Fold tails just past the card edges — the ribbon's underside wrapping around */}
      <div className="absolute right-[114px] bottom-[-8px] w-[40px] h-[10px] bg-[linear-gradient(100deg,#7e22ce_10%,#2e1065_85%)] [clip-path:polygon(0_0,100%_0,100%_100%)]" />
      <div className="absolute right-[-8px] bottom-[114px] w-[10px] h-[40px] bg-[linear-gradient(190deg,#7e22ce_10%,#2e1065_85%)] [clip-path:polygon(0_0,100%_100%,0_100%)]" />

      {/* Band, clipped to the card's rounded corner */}
      <div className="absolute inset-0 overflow-hidden rounded-br-3xl">
        <div className="absolute left-[3px] top-[108px] w-[240px] h-[30px] -rotate-45 bg-gradient-to-b from-violet-500 via-purple-600 to-indigo-700 shadow-[0_10px_22px_-6px_rgba(76,29,149,0.7)] transition-transform duration-300 group-hover:scale-[1.03]">
          <span className="absolute inset-x-0 top-0 h-[2px] bg-white/40" />
          <span className="absolute inset-x-0 bottom-0 h-[3px] bg-indigo-950/80" />
          <span className="flex w-full h-full items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-100 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
              Zerify Creator
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
