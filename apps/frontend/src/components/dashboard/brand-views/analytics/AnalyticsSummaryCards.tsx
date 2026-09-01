'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, TrendingUp, Megaphone, ArrowUpRight } from 'lucide-react';

export default function AnalyticsSummaryCards() {
  const cards = [
    {
      id: 'total-reach',
      label: 'Total Reach',
      value: '2.4M',
      sub: '+14.2% vs previous period',
      icon: Eye,
      color: 'text-sky-400',
      bgGlow: 'from-sky-500/20 to-blue-500/10',
    },
    {
      id: 'total-engagement',
      label: 'Total Engagement',
      value: '184K',
      sub: '+8.9% vs previous period',
      icon: Heart,
      color: 'text-pink-400',
      bgGlow: 'from-pink-500/20 to-rose-500/10',
    },
    {
      id: 'avg-er',
      label: 'Average Engagement Rate',
      value: '7.6%',
      sub: '+1.2% higher than benchmark',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      id: 'total-campaigns',
      label: 'Total Campaigns',
      value: '24',
      sub: '4 Currently Active',
      icon: Megaphone,
      color: 'text-purple-400',
      bgGlow: 'from-purple-500/20 to-indigo-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`p-2 rounded-xl bg-gradient-to-br ${card.bgGlow} border border-white/10 ${card.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-white tracking-tight">
                {card.value}
              </span>
              <span className="inline-flex items-center text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                Active
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              {card.sub}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
