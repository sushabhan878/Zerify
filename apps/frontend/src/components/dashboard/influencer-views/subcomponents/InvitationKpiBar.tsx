'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface InvitationKpiItem {
  label: string;
  val: string;
  change: string;
}

interface InvitationKpiBarProps {
  kpis: InvitationKpiItem[];
}

export default function InvitationKpiBar({ kpis }: InvitationKpiBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={`${kpi.label}-${idx}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.04 }}
          className="p-5 rounded-2xl bg-slate-950/45 light:bg-white border border-white/10 light:border-slate-200/90 backdrop-blur-xl shadow-xl light:shadow-sm hover:border-purple-500/30 light:hover:border-purple-300 light:hover:shadow-md transition-all space-y-2 group"
        >
          <span className="text-xs font-semibold text-slate-400 light:text-slate-500 group-hover:text-slate-200 light:group-hover:text-slate-800 transition-colors block">
            {kpi.label}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white light:text-slate-900 tracking-tight">
            {kpi.val}
          </div>
          <span className="text-[11px] font-bold text-purple-400 light:text-purple-600 block">
            {kpi.change}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
