'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Send,
  BarChart3,
  Zap,
} from 'lucide-react';

export default function Hero() {
  const [count] = useState(2840);

  return (
    <section id="waitlist" className="relative min-h-screen pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden bg-[#07090E]">
      {/* Motion Background Graphics */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

      {/* Motion Background Glowing Spheres */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-[550px] h-[550px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.1, 0.25, 0.1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none"
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & Registration Form */}
          <div className="lg:col-span-6 text-left">
            {/* Coming Soon Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md text-xs font-semibold text-purple-300 mb-6"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span>Zerify Platform • Early Access Coming Soon</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Direct Collaboration for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                Brands & Influencers.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Zerify connects brands directly with creators. Send briefs, manage invitations, track campaign reach, and automate payouts — without ad agency overhead.
            </p>

            {/* Call to Action Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-lg">
              <a
                href="/register"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
            </div>

            {/* Feature Highlights / Trust Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-pink-400" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex items-center gap-4 text-slate-400 text-xs font-medium">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-[#07090E]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Creator" />
                <img className="w-7 h-7 rounded-full border-2 border-[#07090E]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Creator" />
                <img className="w-7 h-7 rounded-full border-2 border-[#07090E]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Creator" />
                <img className="w-7 h-7 rounded-full border-2 border-[#07090E]" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Creator" />
              </div>
              <div>
                <span className="font-bold text-white">{count.toLocaleString()}+</span> Brands & Creators already joined
              </div>
            </div>
          </div>

          {/* Right Column: Platform Analytics & Collaboration Dashboard Widget */}
          <div className="lg:col-span-6 relative">
            {/* Animated Glow Halo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000" />

            <div className="relative rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl p-6 shadow-2xl overflow-hidden space-y-5">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-semibold text-slate-400 ml-2">zerify.app/dashboard</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-semibold text-purple-300">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span>Direct Match</span>
                </div>
              </div>

              {/* Creator & Campaign Card (Inspired by User Screenshot 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Influencer Profile Card */}
                <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                        alt="Madison Blake"
                        className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">Madison Blake</h4>
                        <p className="text-[10px] text-purple-400 font-medium">@madisonblake</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">Active</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all">
                      <Send className="w-3 h-3" />
                      <span>Send Brief</span>
                    </button>
                    <button type="button" className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-all">
                      <span>Invite</span>
                    </button>
                  </div>
                </div>

                {/* Social Stats Summary Card (Inspired by User Screenshot 2) */}
                <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Social Stats</span>
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <p className="text-[10px] text-slate-400">Engagements</p>
                      <p className="text-sm font-extrabold text-white flex items-center gap-1">
                        123K <TrendingUp className="w-3 h-3 text-emerald-400" />
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">30-Day Reach</p>
                      <p className="text-sm font-extrabold text-white flex items-center gap-1">
                        456K <TrendingUp className="w-3 h-3 text-emerald-400" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creative Analytics Card (Inspired by User Screenshot 1) */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 to-purple-950/40 border border-white/10 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Performance Benchmark</span>
                  <h4 className="text-xl font-extrabold text-white mt-0.5">68% ROAS Lift</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Creators outperform median industry ROAS & Hook Rate.</p>
                </div>
                <div className="flex items-end gap-1.5 h-12">
                  <div className="w-2.5 bg-purple-500/30 rounded-t h-4" />
                  <div className="w-2.5 bg-purple-500/50 rounded-t h-7" />
                  <div className="w-2.5 bg-purple-500/70 rounded-t h-9" />
                  <div className="w-2.5 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t h-12 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
