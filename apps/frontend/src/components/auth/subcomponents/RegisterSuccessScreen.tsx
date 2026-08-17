'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { ArrowRight, Sparkles } from 'lucide-react';
import successAnimation from '../../../../public/kOr3pk2jUY.json';

interface RegisterSuccessScreenProps {
  role: 'BRAND' | 'INFLUENCER';
}

export default function RegisterSuccessScreen({ role }: RegisterSuccessScreenProps) {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center py-4 sm:py-6 space-y-5"
    >
      {/* Process Completed Lottie Animation with Glow */}
      <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
        <Lottie
          animationData={successAnimation}
          loop={false}
          autoplay={true}
          style={{ width: 140, height: 140 }}
        />
      </div>

      {/* Account Created Title with Playfair Display Typography */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-bold text-purple-300 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Registration Complete</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
          Account Created <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">Successfully!</span>
        </h2>

        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
          Welcome to Zerify! Your {role === 'BRAND' ? 'Brand & Agency' : 'Creator / Influencer'} profile is ready to explore campaigns.
        </p>
      </div>

      {/* Modern Glowing CTA Button */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
        {role === 'BRAND' ? (
          <>
            <Link
              href="/onboarding/brand"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-xs shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Start Brand Onboarding</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2"
            >
              Go to Dashboard directly
            </Link>
          </>
        ) : (
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-xs shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Go to Dashboard</span>
            <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
