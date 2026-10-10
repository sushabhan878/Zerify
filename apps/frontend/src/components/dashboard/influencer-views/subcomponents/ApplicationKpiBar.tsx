'use client';

import React from 'react';
import { motion } from 'framer-motion';

import { useCurrency } from '@/context/CurrencyContext';

export interface ApplicationKpiItem {
  label: string;
  val: string;
  change: string;
}

interface ApplicationKpiBarProps {
  kpis?: ApplicationKpiItem[];
  totalCount?: number;
  totalProposedValue?: string;
}

export default function ApplicationKpiBar({ kpis, totalCount, totalProposedValue }: ApplicationKpiBarProps) {
  const { format: formatUserCurrency } = useCurrency();
  const items: ApplicationKpiItem[] = kpis || [
    { label: 'Applications Submitted', val: `${totalCount || 0} Pitches`, change: 'Active this month' },
    { label: 'Shortlist / Conversion', val: '0% Rate', change: 'Across pitches' },
    { label: 'Total Proposed Value', val: totalProposedValue || formatUserCurrency(0), change: 'Across open applications' },
    { label: 'Contracts Received', val: '0 Offers Ready', change: 'Awaiting signature' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((kpi, idx) => (
        <motion.div
          key={`${kpi.label}-${idx}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.04 }}
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
