'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

export default function StepOneSearch() {
  const creators = [
    { name: 'Alex Rivera', niche: 'Fashion & Fitness', followers: '142K', price: '$250', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { name: 'Maya Lin', niche: 'Beauty & Skincare', followers: '280K', price: '$450', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
    { name: 'Jordan Hayes', niche: 'Tech & Gaming', followers: '510K', price: '$800', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Left Column: Step Info */}
      <div className="lg:col-span-6 space-y-5">
        <span className="text-xs font-black uppercase tracking-widest text-pink-400">
          01 / SEARCH AND FILTER
        </span>
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.18] [font-family:'Playfair_Display',Georgia,serif]">
          Find The Right Creator Before You Commit.
        </h3>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Filter 100k+ vetted creators by platform, niche, location, follower count, engagement rate, and audience demographics. Results narrow in real time, so you move from a broad category to a qualified shortlist in a single session.
        </p>
      </div>

      {/* Right Column: Visual Container with Pastel Pink Frame */}
      <div className="lg:col-span-6">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-[2.5rem] bg-gradient-to-br from-pink-500/20 via-pink-600/10 to-transparent p-6 sm:p-10 border border-pink-500/30 shadow-2xl overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Embedded UI Card Mockup */}
          <div className="relative rounded-2xl bg-slate-950/90 border border-white/15 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> TikTok & IG
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 font-medium border border-white/10">
                  Engagement &gt; 4%
                </span>
              </div>
              <span className="text-pink-400 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 142 Results
              </span>
            </div>

            {/* Creator Grid Preview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {creators.map((c, i) => (
                <div key={i} className="rounded-xl bg-slate-900 border border-white/10 p-3 space-y-2 hover:border-pink-500/40 transition-colors">
                  <img src={c.img} alt={c.name} className="w-full h-24 rounded-lg object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{c.name}</span>
                      <CheckCircle2 className="w-3 h-3 text-pink-400" />
                    </h4>
                    <p className="text-[10px] text-slate-400">{c.niche}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10">
                    <span className="text-slate-400">{c.followers}</span>
                    <span className="font-bold text-emerald-400">{c.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
