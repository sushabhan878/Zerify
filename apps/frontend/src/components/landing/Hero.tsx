'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import InteractiveDotGrid from './InteractiveDotGrid';
import {
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function Hero() {
  const [count] = useState(2840);

  return (
    <section id="waitlist" className="relative min-h-screen lg:min-h-0 lg:h-screen lg:max-h-[980px] flex items-center pt-36 pb-20 lg:pt-28 lg:pb-16 overflow-hidden bg-[#07090E]">
      {/* Interactive Cursor-Reactive Dotted Grid Background */}
      <InteractiveDotGrid />

      {/* Motion Background Graphics Overlay */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none z-0" />


      {/* Motion Background Glowing Spheres */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.22, 0.12],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-[550px] h-[550px] bg-purple-600/18 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.08, 0.18, 0.08],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-pink-600/12 rounded-full blur-[130px] pointer-events-none"
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Smooth Bottom Fade-Out Transition Overlay */}
      <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#07090E] via-[#07090E]/80 to-transparent pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-6 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Text & Registration Form */}
          <div className="lg:col-span-5 text-left">
            {/* Coming Soon Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md text-xs font-semibold text-purple-300 mb-4"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span>Zerify Platform • Early Access Coming Soon</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </motion.div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.15] [font-family:'Playfair_Display',Georgia,serif]">
              The Fastest & Easiest Way for{' '}
              <span className="italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 whitespace-nowrap">
                Brands & Influencers
              </span>{' '}
              to Connect.
            </h1>




            {/* Subheadline */}
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Zerify connects brands directly with creators. Send briefs, manage invitations, track campaign reach, and automate payouts — without ad agency overhead.
            </p>

            {/* Primary CTA Button with Circular Spinning Conic Glow Effect */}
            <div className="mt-8">
              <div className="relative inline-flex p-[1.5px] rounded-full overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.35)] group">
                {/* Animated Circular Spinning Conic Glow Border */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,#c084fc,#f472b6,#818cf8,#38bdf8,#c084fc)] opacity-90 blur-[2px]"
                />

                {/* Inner Button Pill */}
                <a
                  href="/register"
                  className="relative z-10 px-8 py-4 rounded-full bg-[#0b0f19]/95 hover:bg-[#0b0f19]/80 backdrop-blur-2xl text-white text-base sm:text-lg font-bold transition-all duration-300 flex items-center gap-3 shadow-xl transform group-hover:scale-[1.02]"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200">
                    Get started for free
                  </span>
                  <ArrowRight className="w-5 h-5 text-purple-400 transform transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-5 flex items-center gap-4 text-slate-400 text-xs font-medium">
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

          {/* Right Column: Hero Image (Fixed, No Floating Motion) */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end items-center lg:translate-x-20 lg:-mr-10">
            <div className="relative w-full max-h-[75vh] flex items-center justify-center lg:justify-end lg:scale-110 xl:scale-115 origin-center lg:origin-right drop-shadow-[0_25px_60px_rgba(168,85,247,0.25)] transition-transform duration-500">
              <Image
                src="/ChatGPT Image Jul 29, 2026, 10_52_30 PM.png"
                alt="Zerify Platform Showcase"
                width={1600}
                height={1050}
                priority
                className="w-full h-auto max-h-[73vh] object-contain transform transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
