'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ActiveCampaignKpiBarProps {
  activeCount: number;
  totalEscrowLocked: string;
}

export default function ActiveCampaignKpiBar({ activeCount, totalEscrowLocked }: ActiveCampaignKpiBarProps) {
  const kpis = [
    { label: 'Active Collaborations', val: `${activeCount} Active`, change: 'Currently in progress' },
    { label: 'Locked Escrow Funds', val: totalEscrowLocked, change: 'Secured upon completion' },
    { label: 'Upcoming Milestones', val: '2 Due Soon', change: 'Action required this week' },
    { label: 'Deliverable Approval', val: '98.5% Rate', change: 'High satisfaction score' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/30 transition-all space-y-2 group"
        >
          <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors block">
            {kpi.label}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {kpi.val}
          </div>
          <span className="text-[11px] font-bold text-purple-400 block">
            {kpi.change}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
