'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MailCheck, DollarSign, Clock, ShieldCheck, Sparkles } from 'lucide-react';

interface InvitationKpiBarProps {
  pendingCount: number;
  totalPotentialPayout: string;
}

export default function InvitationKpiBar({ pendingCount, totalPotentialPayout }: InvitationKpiBarProps) {
  const kpis = [
    { label: 'Pending Offers', val: `${pendingCount} Offers`, change: 'Action Required', icon: MailCheck, color: 'text-purple-400' },
    { label: 'Potential Revenue', val: totalPotentialPayout, change: 'Across pending deals', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Escrow Protected', val: '100% Guaranteed', change: 'Locked upon accept', icon: ShieldCheck, color: 'text-indigo-400' },
    { label: 'Avg Brand Response', val: '< 2 Hours', change: 'Top responsiveness', icon: Clock, color: 'text-pink-400' },
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
