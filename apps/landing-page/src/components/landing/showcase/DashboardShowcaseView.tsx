'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface DashboardShowcaseViewProps {
  imageSrc: string;
  title: string;
  urlPath: string;
  badgeText: string;
  badgeIcon?: 'sparkles' | 'zap' | 'lock' | 'shield';
}

export default function DashboardShowcaseView({
  imageSrc,
  title,
  urlPath,
  badgeText,
  badgeIcon = 'sparkles',
}: DashboardShowcaseViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative max-w-6xl mx-auto group"
    >
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-[2.2rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-500 pointer-events-none" />

      {/* Glassmorphic Browser/App Window Frame */}
      <div className="relative rounded-[2rem] bg-slate-900/95 border-2 border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden">

        {/* Browser Top Window Bar */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-white/10 flex items-center justify-between gap-4">
          {/* Window Control Buttons */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          {/* URL Search Pill */}
          <div className="flex-1 max-w-md mx-auto px-4 py-1 rounded-full bg-slate-900 border border-white/10 text-center text-xs text-slate-300 font-mono tracking-tight flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>https://app.zerify.in/{urlPath}</span>
          </div>

          {/* Live Status Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live System</span>
          </div>
        </div>

        {/* High-Res Dashboard Screenshot Image Showcase */}
        <div className="relative overflow-hidden bg-slate-950">
          <Image
            src={imageSrc}
            alt={title}
            width={1920}
            height={1080}
            priority
            className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Floating Overlapping Badge Overlay (Bottom Right) */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 right-6 z-30 px-5 py-2.5 rounded-2xl bg-slate-950/90 border border-purple-500/40 backdrop-blur-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-white"
        >
          {badgeIcon === 'sparkles' && <Sparkles className="w-4 h-4 text-purple-400" />}
          {badgeIcon === 'zap' && <Zap className="w-4 h-4 text-pink-400" />}
          {badgeIcon === 'lock' && <Lock className="w-4 h-4 text-emerald-400" />}
          {badgeIcon === 'shield' && <ShieldCheck className="w-4 h-4 text-indigo-400" />}
          <span>{badgeText}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
