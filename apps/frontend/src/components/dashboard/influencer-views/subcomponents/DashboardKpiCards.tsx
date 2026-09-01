'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Mail, DollarSign, Sparkles } from 'lucide-react';

export default function DashboardKpiCards() {
  const stats = [
    { label: 'Active Collaborations', value: '4 Active', change: '+2 this week', icon: Briefcase, color: 'text-purple-400' },
    { label: 'Pending Invitations', value: '3 Pending', change: 'Action required', icon: Mail, color: 'text-pink-400' },
    { label: 'Total Earnings', value: '$18,450', change: '+$3.2K this month', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'AI Match Score', value: '94%', change: 'Top 5% Creator', icon: Sparkles, color: 'text-indigo-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">{stat.label}</span>
              <div className={`p-2 rounded-xl bg-slate-950/60 border border-white/10 ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <span className="text-[11px] font-bold text-emerald-400 mt-1 inline-block">{stat.change}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
