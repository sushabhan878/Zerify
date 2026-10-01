'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, CheckCircle2, Heart, Filter } from 'lucide-react';

export default function StepOneSearch() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      {/* Left Column: Step Details */}
      <div className="lg:col-span-6 space-y-6">

        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] [font-family:'Playfair_Display',Georgia,serif]">
          Find The Right Creator Before You Commit.
        </h3>

        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Filter 100k+ vetted creators by platform, niche, location, follower count, engagement rate, and audience demographics. Results narrow in real time, so you move from a broad category to a qualified shortlist in a single session.
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap gap-3 pt-2">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Real-time Filter
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Audience Demographics
          </span>
        </div>
      </div>

      {/* Right Column: Floating Overlapping Creator Cards (No Background Box!) */}
      <div className="lg:col-span-6 relative flex justify-center items-center py-6">
        {/* Background Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-pink-600/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Overlapping Top Search Filter Bar */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 left-0 right-0 z-30 px-5 py-3 rounded-full bg-slate-900/90 border border-pink-500/40 backdrop-blur-2xl shadow-[0_15px_35px_rgba(236,72,153,0.25)] flex items-center justify-between"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-white">
              <Search className="w-4 h-4 text-pink-400" />
              <span>Niche: Beauty &amp; Fitness (&gt;4% Eng)</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-extrabold border border-pink-500/30">
              142 Matched
            </span>
          </motion.div>

          {/* Card 1: Left Tilted Overlapping Card */}
          <motion.div
            whileHover={{ rotate: -8, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="absolute -left-6 top-8 w-52 sm:w-56 rounded-2xl bg-slate-900/95 border border-white/15 p-3.5 shadow-2xl transform -rotate-6 z-10 backdrop-blur-xl"
          >
            <div className="relative rounded-xl overflow-hidden h-36 mb-2.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                alt="Alex Rivera"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-rose-400 backdrop-blur-md">
                <Heart className="w-3.5 h-3.5 fill-rose-400" />
              </span>
            </div>
            <h4 className="text-xs font-bold text-white flex items-center justify-between">
              <span>Alex Rivera</span>
              <span className="text-[10px] text-emerald-400 font-extrabold">$250</span>
            </h4>
            <p className="text-[10px] text-slate-400">Fashion &amp; Fitness • 142K</p>
          </motion.div>

          {/* Card 2: Center Hero Overlapping Card (Main Focus) */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 w-60 sm:w-64 mx-auto rounded-3xl bg-slate-900/95 border-2 border-pink-500/40 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <div className="relative rounded-2xl overflow-hidden h-48 mb-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80"
                alt="Maya Lin"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold backdrop-blur-md">
                Verified ROI: 4.8x
              </span>
            </div>
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Maya Lin</span>
              <span className="text-xs font-extrabold text-emerald-400">$450</span>
            </h4>
            <p className="text-xs text-slate-400">Beauty &amp; Skincare • 280K</p>
          </motion.div>

          {/* Card 3: Right Tilted Overlapping Card */}
          <motion.div
            whileHover={{ rotate: 8, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="absolute -right-6 top-12 w-52 sm:w-56 rounded-2xl bg-slate-900/95 border border-white/15 p-3.5 shadow-2xl transform rotate-6 z-10 backdrop-blur-xl"
          >
            <div className="relative rounded-xl overflow-hidden h-36 mb-2.5">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                alt="Jordan Hayes"
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="text-xs font-bold text-white flex items-center justify-between">
              <span>Jordan Hayes</span>
              <span className="text-[10px] text-emerald-400 font-extrabold">$800</span>
            </h4>
            <p className="text-[10px] text-slate-400">Tech &amp; Lifestyle • 510K</p>
          </motion.div>

          {/* Floating Bottom Badge */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-8 right-2 z-30 px-4 py-2 rounded-2xl bg-slate-950/90 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center gap-2 text-xs font-bold text-white"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Instant Direct Briefing</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
