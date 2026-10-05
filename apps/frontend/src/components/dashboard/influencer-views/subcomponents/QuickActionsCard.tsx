'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, FileText, UserCheck, BarChart3, Zap, Target } from 'lucide-react';

export default function QuickActionsCard() {
  const actions = [
    { label: 'Find Brands', icon: Search, color: 'text-purple-400', bg: 'hover:bg-purple-500/10' },
    { label: 'Browse Campaigns', icon: Target, color: 'text-pink-400', bg: 'hover:bg-pink-500/10' },
    { label: 'Generate AI Pitch', icon: Sparkles, color: 'text-indigo-400', bg: 'hover:bg-indigo-500/10' },
    { label: 'Export Media Kit', icon: FileText, color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10' },
    { label: 'Update Profile', icon: UserCheck, color: 'text-cyan-400', bg: 'hover:bg-cyan-500/10' },
    { label: 'View Analytics', icon: BarChart3, color: 'text-amber-400', bg: 'hover:bg-amber-500/10' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Quick Actions</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3.5 rounded-xl bg-slate-950/60 border border-white/10 ${act.bg} hover:border-purple-500/30 transition-all flex flex-col items-center justify-center text-center space-y-2 shadow-md group`}
            >
              <div className={`p-2 rounded-xl bg-slate-900 border border-white/10 ${act.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{act.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
