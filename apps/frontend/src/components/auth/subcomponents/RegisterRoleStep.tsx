'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Video, Building2 } from 'lucide-react';

interface RegisterRoleStepProps {
  role: 'BRAND' | 'INFLUENCER';
  onSelectRole: (role: 'BRAND' | 'INFLUENCER') => void;
}

export default function RegisterRoleStep({ role, onSelectRole }: RegisterRoleStepProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6 py-2"
    >
      {/* Header Section with Title Typography Matching Landing Page */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-white tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
          Welcome to <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">Zerify</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          How do you plan to use the platform today? Select your workspace role to get started.
        </p>
      </div>

      {/* Side-by-Side Professional Cards with Overlapping Crazy Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-4">
        {/* Option A: Influencer / Creator Card */}
        <div
          onClick={() => onSelectRole('INFLUENCER')}
          className={`cursor-pointer p-8 sm:p-9 rounded-3xl border transition-all duration-500 flex flex-col justify-center min-h-[170px] sm:min-h-[190px] group relative overflow-hidden backdrop-blur-md ${role === 'INFLUENCER'
            ? 'bg-gradient-to-br from-pink-500/20 via-white/[0.08] to-white/[0.02] border-pink-500/70 shadow-[0_0_40px_rgba(236,72,153,0.3)] ring-1 ring-pink-500/60'
            : 'bg-white/[0.03] border-white/10 hover:border-pink-500/50 hover:bg-white/[0.07] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-pink-500/20'
            }`}
        >
          {/* Subtle Glowing Background Light */}
          <div className="absolute -top-10 -left-10 w-36 h-36 bg-pink-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/25 transition-all" />

          {/* Overlapping Crazy Giant Icon */}
          <div className="absolute -right-6 -bottom-6 text-pink-500/20 group-hover:text-pink-500/40 transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 pointer-events-none drop-shadow-[0_10px_20px_rgba(236,72,153,0.3)]">
            <Video className="w-36 h-36 sm:w-44 sm:h-44 stroke-[1.2]" />
          </div>

          {/* Foreground Title Focus */}
          <div className="relative z-10 space-y-3">
            <span className="inline-block text-[11px] font-extrabold text-pink-400 bg-pink-500/10 px-3.5 py-1 rounded-full border border-pink-500/30 shadow-inner">
              For Creators &amp; Influencers
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-pink-200 transition-colors tracking-tight">
              I am an Influencer
            </h3>
          </div>
        </div>

        {/* Option B: Brand / Business Card */}
        <div
          onClick={() => onSelectRole('BRAND')}
          className={`cursor-pointer p-8 sm:p-9 rounded-3xl border transition-all duration-500 flex flex-col justify-center min-h-[170px] sm:min-h-[190px] group relative overflow-hidden backdrop-blur-md ${role === 'BRAND'
            ? 'bg-gradient-to-br from-purple-500/20 via-white/[0.08] to-white/[0.02] border-purple-500/70 shadow-[0_0_40px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/60'
            : 'bg-white/[0.03] border-white/10 hover:border-purple-500/50 hover:bg-white/[0.07] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/20'
            }`}
        >
          {/* Subtle Glowing Background Light */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/25 transition-all" />

          {/* Overlapping Crazy Giant Icon */}
          <div className="absolute -right-6 -bottom-6 text-purple-500/20 group-hover:text-purple-500/40 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 pointer-events-none drop-shadow-[0_10px_20px_rgba(168,85,247,0.3)]">
            <Building2 className="w-36 h-36 sm:w-44 sm:h-44 stroke-[1.2]" />
          </div>

          {/* Foreground Title Focus */}
          <div className="relative z-10 space-y-3">
            <span className="inline-block text-[11px] font-extrabold text-purple-400 bg-purple-500/10 px-3.5 py-1 rounded-full border border-purple-500/30 shadow-inner">
              For Brands &amp; Agencies
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-purple-200 transition-colors tracking-tight">
              I am looking for Influencers
            </h3>
          </div>
        </div>
      </div>

      {/* Footer Sign In link */}
      <div className="pt-4 text-center text-xs sm:text-sm text-slate-400">
        Already registered?{' '}
        <Link href="/login" className="font-bold text-purple-400 hover:text-purple-300 transition-colors underline decoration-purple-500/30 underline-offset-4">
          Sign In to your account
        </Link>
      </div>
    </motion.div>
  );
}
