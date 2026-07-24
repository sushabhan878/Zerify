'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardMetricCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
}

export default function DashboardMetricCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = 'text-purple-400',
}: DashboardMetricCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-black text-white tracking-tight">{value}</span>
        {change && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              isPositive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
