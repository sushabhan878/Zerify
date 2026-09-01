'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  DollarSign,
  Eye,
  Heart,
  TrendingUp,
  Inbox,
  Users,
  ArrowUpRight,
} from 'lucide-react';

interface KpiItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
}

export default function OverviewKpiGrid() {
  const kpis: KpiItem[] = [
    {
      id: 'active-campaigns',
      label: 'Active Campaigns',
      value: '4',
      subtext: '2 closing this week',
      change: '+1 new',
      isPositive: true,
      icon: Megaphone,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-indigo-500/10',
    },
    {
      id: 'total-spend',
      label: 'Total Campaign Spend',
      value: '$42,500',
      subtext: '78% of quarterly budget',
      change: '+$8.4K',
      isPositive: true,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      id: 'total-reach',
      label: 'Total Reach',
      value: '2.4M',
      subtext: 'Across YT, IG & TikTok',
      change: '+18.4%',
      isPositive: true,
      icon: Eye,
      color: 'text-sky-400',
      bgGradient: 'from-sky-500/20 to-blue-500/10',
    },
    {
      id: 'total-engagement',
      label: 'Total Engagement',
      value: '184K',
      subtext: 'Likes, comments & shares',
      change: '+12.6%',
      isPositive: true,
      icon: Heart,
      color: 'text-pink-400',
      bgGradient: 'from-pink-500/20 to-rose-500/10',
    },
    {
      id: 'engagement-rate',
      label: 'Overall Engagement Rate',
      value: '7.8%',
      subtext: 'Industry avg: 3.2%',
      change: '+1.4%',
      isPositive: true,
      icon: TrendingUp,
      color: 'text-amber-400',
      bgGradient: 'from-amber-500/20 to-orange-500/10',
    },
    {
      id: 'applications-received',
      label: 'Applications Received',
      value: '142',
      subtext: '12 awaiting review',
      change: '+24 this week',
      isPositive: true,
      icon: Inbox,
      color: 'text-violet-400',
      bgGradient: 'from-violet-500/20 to-purple-500/10',
    },
    {
      id: 'active-influencers',
      label: 'Influencers Working With',
      value: '18',
      subtext: 'Across 4 active campaigns',
      change: '+5 active',
      isPositive: true,
      icon: Users,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/20 to-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const isWide = idx === 0;

        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className={`p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-all group ${
              isWide ? 'sm:col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">
                {kpi.label}
              </span>
              <div
                className={`p-2 rounded-xl bg-gradient-to-br ${kpi.bgGradient} border border-white/10 ${kpi.color} shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {kpi.value}
              </span>
              <span className="inline-flex items-center text-[10.5px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {kpi.change}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
              {kpi.subtext}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
