'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Lock, Clock, CheckCircle2, DollarSign } from 'lucide-react';

interface ActiveCampaignKpiBarProps {
  activeCount: number;
  totalEscrowLocked: string;
}

export default function ActiveCampaignKpiBar({ activeCount, totalEscrowLocked }: ActiveCampaignKpiBarProps) {
  const kpis = [
    { label: 'Active Collaborations', val: `${activeCount} Active`, change: 'Currently in progress', icon: Megaphone, color: 'text-purple-400' },
    { label: 'Locked Escrow Funds', val: totalEscrowLocked, change: 'Secured upon completion', icon: Lock, color: 'text-emerald-400' },
    { label: 'Upcoming Milestones', val: '2 Due Soon', change: 'Action required this week', icon: Clock, color: 'text-amber-400' },
    { label: 'Deliverable Approval', val: '98.5% Rate', change: 'High satisfaction score', icon: CheckCircle2, color: 'text-indigo-400' },
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
