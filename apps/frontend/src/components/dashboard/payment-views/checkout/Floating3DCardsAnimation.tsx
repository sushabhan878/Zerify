'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface Floating3DCardsAnimationProps {
  cardHolderName?: string;
  cardNumber?: string;
  isEscrow?: boolean;
}

export default function Floating3DCardsAnimation({
  cardHolderName = 'Edward Hunt',
  cardNumber = '4455 5491 6118 6164',
  isEscrow = false,
}: Floating3DCardsAnimationProps) {
  const displayHolder = cardHolderName.trim() || 'Edward Hunt';
  const displayCardNum = cardNumber.trim() || '4455 5491 6118 6164';

  return (
    <div className="relative w-full h-full min-h-[320px] md:min-h-0 bg-[#0c1427] p-5 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
      {/* Background ambient lighting orbs */}
      <div className="absolute top-6 left-4 w-44 h-44 rounded-full bg-purple-600/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 right-2 w-48 h-48 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

      {/* Top Zerify Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-purple-600/30 border border-white/20 bg-purple-950/40 p-1 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Zerify Logo"
              width={28}
              height={28}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <span className="text-xs font-black tracking-wider text-white uppercase block">
              {isEscrow ? 'Campaign Escrow' : 'Add Money'}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">
              {isEscrow ? 'Smart Escrow Custody' : 'Zerify Instant Wallet'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-semibold text-emerald-400 backdrop-blur-sm">
          <ShieldCheck className="w-3 h-3" />
          <span>256-bit Secure</span>
        </div>
      </div>

      {/* Center 3D Isometric Card Stack */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-3 py-2">
        <div className="relative w-52 sm:w-56 h-32 sm:h-36" style={{ perspective: 1000 }}>
          <motion.div
            className="w-full h-full relative"
            animate={{
              y: [0, -6, 0],
              rotateX: [24, 26, 24],
              rotateY: [-22, -20, -22],
              rotateZ: [18, 19, 18],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 1. Bottom Card - Magenta/Purple Gradient Card */}
            <div
              className="absolute inset-0 rounded-xl p-3 bg-gradient-to-tr from-[#e11d48] via-[#a855f7] to-[#6366f1] text-white shadow-xl border border-white/20 flex flex-col justify-between"
              style={{
                transform: 'translateZ(-35px) translateY(35px)',
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black tracking-widest uppercase text-white/80">ZERIFY</span>
                {/* Mastercard Interlocking Circles */}
                <div className="flex items-center -space-x-1.5">
                  <div className="w-4 h-4 rounded-full bg-red-500 opacity-90 shadow-sm" />
                  <div className="w-4 h-4 rounded-full bg-amber-400 opacity-90 shadow-sm" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="font-mono text-[10px] font-bold tracking-wider text-white/90 drop-shadow">
                  4455 5491 6118 6164
                </p>
                <div className="flex justify-between items-center text-[8px] text-white/70">
                  <span className="uppercase truncate max-w-[100px]">{displayHolder}</span>
                  <span>10/29</span>
                </div>
              </div>
            </div>

            {/* 2. Middle Card - Translucent Indigo/Blue Glass Card */}
            <div
              className="absolute inset-0 rounded-xl p-3 bg-gradient-to-tr from-blue-500/35 via-indigo-500/25 to-purple-500/20 backdrop-blur-md text-white shadow-lg border border-white/25 flex flex-col justify-between"
              style={{
                transform: 'translateZ(0px) translateY(14px)',
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-black italic tracking-wider text-white drop-shadow">VISA</span>
                <span className="text-[8px] px-1 py-0.2 rounded bg-white/10 text-slate-300 font-semibold border border-white/10">
                  DEBIT
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="font-mono text-[10px] font-bold tracking-wider text-white/95 drop-shadow">
                  4455 5491 6118 6164
                </p>
                <div className="flex justify-between items-center text-[8px] text-slate-300">
                  <span className="uppercase truncate max-w-[100px]">{displayHolder}</span>
                  <span>08/28</span>
                </div>
              </div>
            </div>

            {/* 3. Top Card - Pure Frosted Glass Card (Matching Reference) */}
            <div
              className="absolute inset-0 rounded-xl p-3.5 bg-white/10 backdrop-blur-xl text-white shadow-xl border border-white/35 flex flex-col justify-between overflow-hidden"
              style={{
                transform: 'translateZ(35px) translateY(-8px)',
              }}
            >
              {/* Subtle glass glare */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-8 -mt-8 blur-sm pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <span className="text-sm font-black italic tracking-wider text-white drop-shadow-md">VISA</span>
                <div className="w-5 h-3 rounded bg-amber-400/80 border border-amber-300/60 shadow-inner flex items-center justify-center">
                  <div className="w-3 h-1.5 border-t border-b border-amber-600/50" />
                </div>
              </div>

              <div className="space-y-0.5 relative z-10">
                <p className="font-mono text-[11px] font-extrabold tracking-widest text-white drop-shadow-md">
                  {displayCardNum}
                </p>
                <div className="flex justify-between items-center text-[8px] text-white/80 font-medium">
                  <span className="uppercase truncate max-w-[110px] drop-shadow">{displayHolder}</span>
                  <span className="drop-shadow">05/27</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
