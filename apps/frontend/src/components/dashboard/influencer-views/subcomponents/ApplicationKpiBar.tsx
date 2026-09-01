'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ApplicationKpiBarProps {
  totalCount: number;
  totalProposedValue: string;
}

export default function ApplicationKpiBar({ totalCount, totalProposedValue }: ApplicationKpiBarProps) {
  const kpis = [
    { label: 'Applications Submitted', val: `${totalCount} Pitches`, change: 'Active this month' },
    { label: 'Shortlist / Conversion', val: '62.5% Rate', change: 'Above creator avg' },
    { label: 'Total Proposed Value', val: totalProposedValue, change: 'Across open applications' },
    { label: 'Contracts Received', val: '2 Offers Ready', change: 'Awaiting signature' },
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
