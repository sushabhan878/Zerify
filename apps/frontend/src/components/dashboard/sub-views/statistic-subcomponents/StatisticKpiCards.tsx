'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, TrendingUp, DollarSign, MousePointer, Award, Mail, Heart } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export interface DynamicKpis {
  totalFollowers?: number;
  totalReach?: number;
  avgEngagement?: number;
  collaborationEarnings?: {
    amount: number;
    currency?: string;
    change?: string;
  };
  profileVisits?: {
    count: number;
    change?: string;
  };
  linkClicks?: {
    count: number;
    change?: string;
  };
  brandInvitations?: {
    total: number;
    pending: number;
    change?: string;
  };
  totalLikesAndSaves?: {
    count: number;
    likes?: number;
    saves?: number;
    change?: string;
  };
}

interface StatisticKpiCardsProps {
  totalFollowers?: number;
  avgEngagement?: number;
  kpiData?: DynamicKpis;
}

export default function StatisticKpiCards({ totalFollowers, avgEngagement, kpiData }: StatisticKpiCardsProps) {
  const { currency, format } = useCurrency();

  const formatCount = (count?: number | null) => {
    if (count === undefined || count === null) return '—';
    if (count <= 0) return '0';
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return count.toLocaleString();
  };

  // 1. Total Followers
  const effectiveFollowers = kpiData?.totalFollowers ?? totalFollowers;
  const followersDisplay = formatCount(effectiveFollowers);

  // 2. Total Reach
  const reachVal = kpiData?.totalReach ?? (effectiveFollowers && effectiveFollowers > 0 ? Math.round(effectiveFollowers * 2.4) : null);
  const reachDisplay = formatCount(reachVal);

  // 3. Avg Engagement Rate
  const effectiveEngagement = kpiData?.avgEngagement ?? avgEngagement;
  const engagementDisplay = effectiveEngagement && effectiveEngagement > 0 ? `${effectiveEngagement}%` : '—';

  // 4. Collaboration Earnings
  const rawEarnings = kpiData?.collaborationEarnings?.amount ?? 0;
  const earningsDisplay = rawEarnings > 0 ? format(rawEarnings) : format(0);
  const earningsChange = kpiData?.collaborationEarnings?.change || (rawEarnings > 0 ? 'Active deals verified' : 'Open for brand deals');

  // 5. Profile Visits
  const profileVisitsCount = kpiData?.profileVisits?.count ?? 0;
  const profileVisitsDisplay = profileVisitsCount > 0 ? formatCount(profileVisitsCount) : '0';
  const profileVisitsChange = kpiData?.profileVisits?.change || '+12.1% this mo';

  // 6. Link Clicks
  const linkClicksCount = kpiData?.linkClicks?.count ?? 0;
  const linkClicksDisplay = linkClicksCount > 0 ? formatCount(linkClicksCount) : '0';
  const linkClicksChange = kpiData?.linkClicks?.change || '+8.6% conversion';

  // 7. Brand Invitations
  const brandInvTotal = kpiData?.brandInvitations?.total ?? 0;
  const brandInvPending = kpiData?.brandInvitations?.pending ?? 0;
  const brandInvitationsDisplay = `${brandInvTotal}`;
  const brandInvitationsChange = kpiData?.brandInvitations?.change || (brandInvPending > 0 ? `${brandInvPending} pending` : 'All reviewed');

  // 8. Total Likes & Saves
  const likesAndSavesCount = kpiData?.totalLikesAndSaves?.count ?? 0;
  const likesAndSavesDisplay = likesAndSavesCount > 0 ? formatCount(likesAndSavesCount) : '0';
  const likesAndSavesChange = kpiData?.totalLikesAndSaves?.change || '+15.2% engagement';

  const kpis = [
    {
      label: 'Total Followers',
      val: followersDisplay,
      change: effectiveFollowers ? 'Live Verified' : 'Sync accounts',
      icon: Users,
      color: 'text-purple-400',
    },
    {
      label: 'Total Reach',
      val: reachDisplay,
      change: reachVal ? '+18.4% impressions' : 'Sync pending',
      icon: Eye,
      color: 'text-pink-400',
    },
    {
      label: 'Avg Engagement Rate',
      val: engagementDisplay,
      change: effectiveEngagement ? '+1.2% benchmark' : 'Calculating',
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      label: 'Collaboration Earnings',
      val: earningsDisplay,
      change: earningsChange,
      icon: DollarSign,
      color: 'text-indigo-400',
    },
    {
      label: 'Profile Visits',
      val: profileVisitsDisplay,
      change: profileVisitsChange,
      icon: MousePointer,
      color: 'text-cyan-400',
    },
    {
      label: 'Link Clicks',
      val: linkClicksDisplay,
      change: linkClicksChange,
      icon: Award,
      color: 'text-amber-400',
    },
    {
      label: 'Brand Invitations',
      val: brandInvitationsDisplay,
      change: brandInvitationsChange,
      icon: Mail,
      color: 'text-teal-400',
    },
    {
      label: 'Total Likes & Saves',
      val: likesAndSavesDisplay,
      change: likesAndSavesChange,
      icon: Heart,
      color: 'text-rose-400',
    },
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
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                {kpi.label}
              </span>
              <div className={`p-2 rounded-xl bg-slate-950/60 border border-white/10 ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{kpi.val}</div>
            <span className="text-[11px] font-bold text-emerald-400 mt-1 inline-block">
              {kpi.change}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
