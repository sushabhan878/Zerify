'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, TrendingUp, DollarSign, MousePointer, Award, Mail, Heart } from 'lucide-react';

export default function StatisticKpiCards() {
  const kpis = [
    { label: 'Total Followers', val: '485.2K', change: '+4.2% this mo', icon: Users, color: 'text-purple-400' },
    { label: 'Total Reach', val: '1.28M', change: '+18.4%', icon: Eye, color: 'text-pink-400' },
    { label: 'Avg Engagement Rate', val: '6.8%', change: '+1.2% benchmark', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Collaboration Earnings', val: '$18,450', change: '+$3.2K this mo', icon: DollarSign, color: 'text-indigo-400' },
    { label: 'Profile Visits', val: '42.8K', change: '+12.1%', icon: MousePointer, color: 'text-cyan-400' },
    { label: 'Link Clicks', val: '9.45K', change: '+8.6%', icon: Award, color: 'text-amber-400' },
    { label: 'Brand Invitations', val: '14', change: '3 pending', icon: Mail, color: 'text-teal-400' },
    { label: 'Total Likes & Saves', val: '142.6K', change: '+15.2%', icon: Heart, color: 'text-rose-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="p-4 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">{kpi.label}</span>
              <div className={`p-2 rounded-xl bg-slate-950/60 border border-white/10 ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{kpi.val}</div>
            <span className="text-[11px] font-bold text-emerald-400 mt-1 inline-block">{kpi.change}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
