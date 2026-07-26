'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Award,
  DollarSign,
  Instagram,
  Youtube,
  Globe,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ProfileOverviewSectionProps {
  userName: string;
}

export default function ProfileOverviewSection({ userName }: ProfileOverviewSectionProps) {
  const stats = [
    { label: 'Total Reach', value: '485.2K', change: '+12.4%', icon: Users, color: 'text-purple-400' },
    { label: 'Avg Engagement', value: '6.8%', change: '+1.8%', icon: TrendingUp, color: 'text-pink-400' },
    { label: 'Deals Completed', value: '24', change: '8 this month', icon: Award, color: 'text-indigo-400' },
    { label: 'Total Revenue', value: '$18,450', change: '+$3.2K', icon: DollarSign, color: 'text-emerald-400' },
  ];

  const niches = ['Fashion & Lifestyle', 'Tech Reviews', 'Fitness', 'Beauty & Skincare', 'Travel'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-slate-900 border border-purple-500/30 backdrop-blur-xl relative overflow-hidden shadow-2xl"
      >
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-bold text-purple-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Influencer Hub</span>
            </div>
            <h2 className="text-2xl font-black text-white">Welcome back, {userName}!</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Your profile is performing 18% higher than industry average this week. 3 brands are currently reviewing your pitches.
            </p>
          </div>
          <button className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-extrabold text-white shadow-lg shadow-purple-950/50 hover:scale-105 transition-all shrink-0">
            Edit Rate Card
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
                <div className={`p-2 rounded-xl bg-slate-950 border border-white/5 ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-white">{stat.value}</div>
              <span className="text-[11px] font-bold text-emerald-400">{stat.change}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Audience Demographics & Niches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Audience Distribution</span>
          </h3>
          <div className="space-y-3">
            {[
              { region: 'United States', pct: '45%', color: 'bg-purple-500' },
              { region: 'United Kingdom', pct: '22%', color: 'bg-pink-500' },
              { region: 'Canada', pct: '18%', color: 'bg-indigo-500' },
              { region: 'Australia & NZ', pct: '15%', color: 'bg-cyan-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.region}</span>
                  <span className="text-purple-400 font-bold">{item.pct}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Content Niches</h3>
          <div className="flex flex-wrap gap-2">
            {niches.map((niche, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300"
              >
                {niche}
              </span>
            ))}
          </div>
          <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400">
            AI Algorithm matches your profile based on active niche tags and engagement metrics.
          </div>
        </div>
      </div>
    </div>
  );
}
