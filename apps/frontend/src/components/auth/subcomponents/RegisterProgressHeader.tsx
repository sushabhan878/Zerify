'use client';

import React from 'react';
import Image from 'next/image';

interface RegisterProgressHeaderProps {
  step: 1 | 2 | 3 | 4;
}

export default function RegisterProgressHeader({ step }: RegisterProgressHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
      <div className="flex items-center gap-2">
        <div className="relative w-7 h-7 rounded-lg overflow-hidden">
          <Image src="/logo.png" alt="Zerify Logo" width={28} height={28} className="object-contain" />
        </div>
        <span className="text-sm font-extrabold tracking-tight text-white">Zerify</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <span className={`px-2 py-0.5 rounded-full ${step === 1 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'}`}>1. Role</span>
        <span>&rarr;</span>
        <span className={`px-2 py-0.5 rounded-full ${step === 2 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'}`}>2. Auth</span>
        <span>&rarr;</span>
        <span className={`px-2 py-0.5 rounded-full ${step === 3 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'}`}>3. Profile</span>
        <span>&rarr;</span>
        <span className={`px-2 py-0.5 rounded-full ${step === 4 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500'}`}>4. Done</span>
      </div>
    </div>
  );
}
