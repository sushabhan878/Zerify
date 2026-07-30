'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Star, ShieldCheck, Heart } from 'lucide-react';

export default function TestimonialCta() {
  return (
    <section id="success-stories" className="py-28 relative overflow-hidden bg-transparent">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Crazy Overlapping Card Container */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900/90 via-slate-950 to-purple-950/40 border border-white/20 p-8 sm:p-12 lg:p-16 shadow-[0_30px_100px_rgba(147,51,234,0.2)]">
          {/* Giant Decorative Ambient Background Quote Mark */}
          <span className="absolute -top-10 left-6 sm:left-12 text-[180px] sm:text-[240px] font-serif leading-none text-purple-500/10 select-none pointer-events-none">
            &ldquo;
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Column: Overlapping Quote & Brand Elements */}
            <div className="lg:col-span-6 space-y-8">
              {/* Floating Brand & Rating Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800/80 border border-white/15 backdrop-blur-xl shadow-xl">
                <span className="font-serif italic text-lg font-bold text-white tracking-wide">
                  Kulani Kinis
                </span>
                <span className="h-3.5 w-[1px] bg-white/20" />
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>5.0 Verified ROI</span>
                </div>
              </div>

              {/* Bold Overlapping Quote */}
              <blockquote className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.2] tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
                &ldquo;Zerify allows us to seed products to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 italic font-bold">
                  hundreds of creators
                </span>
                , track content in real time, and scale results instantly.&rdquo;
              </blockquote>

              {/* Author & Live Performance Metrics Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                <div>
                  <p className="text-base font-bold text-white flex items-center gap-2">
                    <span>Kulani Kini&apos;s</span>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </p>
                  <p className="text-xs text-slate-400">Creator Marketing & Global Partnerships</p>
                </div>

                <div className="flex items-center gap-4 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-2xl">
                  <div>
                    <p className="text-[10px] text-purple-300 font-bold uppercase">30-Day ROAS Lift</p>
                    <p className="text-base font-black text-white flex items-center gap-1">
                      +410% <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Layered Overlapping Image Stack & Live Floating Badges */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              <div className="relative w-full max-w-lg">
                {/* Background Tilted Media Frame (Layer 1) */}
                <div className="absolute -top-6 -left-6 w-full h-full rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 opacity-30 blur-xl transform -rotate-3 scale-105 pointer-events-none" />

                {/* Secondary Tilted Card (Layer 2) */}
                <div className="absolute -top-4 -right-4 w-72 h-80 rounded-3xl bg-slate-900/90 border border-white/20 shadow-2xl transform rotate-6 hidden sm:block overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
                    alt="Creator Ambassador"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>

                {/* Primary Hero Overlapping Lifestyle Card (Layer 3) */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)] group">
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80"
                    alt="Creators collaborating with brand"
                    className="w-full h-80 sm:h-[420px] object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Overlapping Bottom Card Badge inside image */}
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-950/80 border border-white/15 backdrop-blur-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                        <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">1,400+ Content Assets Generated</p>
                        <p className="text-[10px] text-slate-400">Licensed directly via Zerify Escrow</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crazy Floating Overlapping Badge (Top Right) */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 sm:-right-8 p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/40 backdrop-blur-2xl shadow-2xl z-20 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xs">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">98% Match Rate</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">AI Influencer Match</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Crazy Floating Overlapping CTA Pill Bar (Protruding outside the bottom edge) */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-30 w-[92%] sm:w-auto">
            <div className="relative p-[1.5px] rounded-full overflow-hidden shadow-[0_15px_40px_rgba(168,85,247,0.35)]">
              {/* Circular Rotating Conic Glow */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,#c084fc,#f472b6,#818cf8,#c084fc)] opacity-90 blur-[2px]"
              />

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 px-6 sm:px-10 py-3.5 rounded-full bg-[#0b0f19]/95 backdrop-blur-2xl">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Campaigns end. Systems don&apos;t. Start building.</span>
                </div>
                <a
                  href="#waitlist"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2 group whitespace-nowrap"
                >
                  <span>Register for early access</span>
                  <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
