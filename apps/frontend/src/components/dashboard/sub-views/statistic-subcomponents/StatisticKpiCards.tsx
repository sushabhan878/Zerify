'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, TrendingUp, DollarSign, MousePointer, Award, Mail, Heart } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface StatisticKpiCardsProps {
  totalFollowers?: number;
  avgEngagement?: number;
}

export default function StatisticKpiCards({ totalFollowers, avgEngagement }: StatisticKpiCardsProps) {
  const { currency, format } = useCurrency();
  const earningsVal = currency === 'INR' ? format(1540000) : format(18450);
  const earningsChange = currency === 'INR' ? '+₹2.6L this mo' : '+$3.2K this mo';

  const formatFollowers = (count?: number) => {
    if (count === undefined || count === null) return '—';
    if (count <= 0) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  const followersDisplay = formatFollowers(totalFollowers);
  const engagementDisplay = avgEngagement && avgEngagement > 0 ? `${avgEngagement}%` : '—';

  const kpis = [
    { label: 'Total Followers', val: followersDisplay, change: totalFollowers ? 'Live Verified' : 'Sync your accounts', icon: Users, color: 'text-purple-400' },
    { label: 'Total Reach', val: totalFollowers && totalFollowers > 0 ? formatFollowers(Math.round(totalFollowers * 2.4)) : '—', change: totalFollowers ? '+18.4%' : 'Sync pending', icon: Eye, color: 'text-pink-400' },
    { label: 'Avg Engagement Rate', val: engagementDisplay, change: '+1.2% benchmark', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Collaboration Earnings', val: earningsVal, change: earningsChange, icon: DollarSign, color: 'text-indigo-400' },
    { label: 'Profile Visits', val: '42.8K', change: '+12.1%', icon: MousePointer, color: 'text-cyan-400' },
    { label: 'Link Clicks', val: '9.45K', change: '+8.6%', icon: Award, color: 'text-amber-400' },
    { label: 'Brand Invitations', val: '14', change: '3 pending', icon: Mail, color: 'text-teal-400' },
    { label: 'Total Likes & Saves', val: '142.6K', change: '+15.2%', icon: Heart, color: 'text-rose-400' },
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
            transition={{ delay: idx * 0.04 }}
            className="p-4 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">{kpi.label}</span>
              <div className={`p-2 rounded-xl bg-slate-950/60 border border-white/10 ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{kpi.val}</div>
            <span className="text-[11px] font-bold text-emerald-400 mt-1 inline-block">{kpi.change}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
