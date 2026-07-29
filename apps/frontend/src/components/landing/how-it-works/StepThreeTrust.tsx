'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, Sparkles, Lock, CheckCircle2 } from 'lucide-react';

export default function StepThreeTrust() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      {/* Left Column: Step Details */}
      <div className="lg:col-span-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 uppercase tracking-widest backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>03 / TRUST AND HIRE</span>
        </div>

        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] [font-family:'Playfair_Display',Georgia,serif]">
          Every Creator Is Vetted. Your Search Starts With Confidence.
        </h3>

        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Zerify&apos;s team and automated AI inspect creators for engagement quality, content standards, and past brand experience before they appear in search results. Every creator has opted in and gone through an identity verification process. Spend your time finding the right fit, not checking if the results are real.
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> AI Identity Check
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Fraud &amp; Bot Audit
          </span>
        </div>
      </div>

      {/* Right Column: Floating Overlapping Vetting UI (No Background Box!) */}
      <div className="lg:col-span-6 relative flex justify-center items-center py-6">
        {/* Background Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-amber-600/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative w-full max-w-md space-y-4">
          {/* Main Floating Vetting Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 rounded-3xl bg-slate-900/95 border-2 border-amber-500/40 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-5 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Zerify Vetted &amp; Verified
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-7 h-7 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white">88.4%</p>
                    <p className="text-xs text-slate-400 font-medium">Real Organic Followers®</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 flex items-center justify-between shadow-lg opacity-85">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-7 h-7 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white">11.6%</p>
                    <p className="text-xs text-slate-400 font-medium">Low Risk Audience Variance</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                  Clean Audit
                </span>
              </div>
            </div>
          </motion.div>

          {/* Overlapping Floating Lock Badge (Bottom Right) */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-6 -right-4 z-30 px-4 py-2.5 rounded-2xl bg-slate-950/90 border border-amber-500/50 backdrop-blur-2xl shadow-2xl flex items-center gap-2 text-xs font-bold text-amber-300"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Escrow Payment Guarantee</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
