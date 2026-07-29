'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, DollarSign, Repeat, Star } from 'lucide-react';

interface NetworkKpiBarProps {
  totalBrands: number;
  totalEarnings: string;
}

export default function NetworkKpiBar({ totalBrands, totalEarnings }: NetworkKpiBarProps) {
  const kpis = [
    { label: 'Brand Partners', val: `${totalBrands} Brands`, change: 'Past collaborations', icon: Building2, color: 'text-purple-400' },
    { label: 'Total Revenue Earned', val: totalEarnings, change: 'From brand network', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Repeat Partner Rate', val: '75% Repeat', change: 'High retention score', icon: Repeat, color: 'text-indigo-400' },
    { label: 'Brand Satisfaction', val: '5.0 ★ Rating', change: '100% positive reviews', icon: Star, color: 'text-amber-400' },
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
            transition={{ delay: idx * 0.05 }}
            className="p-4 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">{kpi.label}</span>
              <div className={`p-2 rounded-xl bg-slate-950/60 border border-white/10 ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-white">{kpi.val}</div>
            <span className="text-[11px] font-bold text-purple-400 mt-0.5 inline-block">{kpi.change}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
