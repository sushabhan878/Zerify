'use client';

import React from 'react';
import { Sparkles, DollarSign, Briefcase, Eye, ArrowUpRight, Share2 } from 'lucide-react';
import DashboardMetricCard from './subcomponents/DashboardMetricCard';

interface InfluencerDashboardViewProps {
  userName: string;
}

export default function InfluencerDashboardView({ userName }: InfluencerDashboardViewProps) {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-950/40 via-slate-950 to-purple-950/40 border border-pink-500/20 backdrop-blur-2xl">
        <div>
          <span className="text-xs font-bold text-pink-400 uppercase tracking-widest block mb-1">
            Creator Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">{userName}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your campaign invitations, media kit views, and earnings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>View Deal Offers</span>
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span>Share Media Kit</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Inbound Invites"
          value="7"
          change="3 New"
          icon={Sparkles}
          iconColor="text-pink-400"
        />
        <DashboardMetricCard
          title="Active Deals"
          value="3"
          change="In Progress"
          icon={Briefcase}
          iconColor="text-purple-400"
        />
        <DashboardMetricCard
          title="Total Earnings"
          value="$4,850"
          change="+$1,200 this week"
          icon={DollarSign}
          iconColor="text-emerald-400"
        />
        <DashboardMetricCard
          title="Media Kit Views"
          value="840"
          change="+28%"
          icon={Eye}
          iconColor="text-indigo-400"
        />
      </div>

      {/* Placeholder Invites Grid */}
      <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-white">Incoming Campaign Invites</h3>
            <p className="text-xs text-slate-400">Brand collaboration proposals waiting for your review</p>
          </div>
          <button className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1">
            <span>Explore All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { brand: 'Aura Skincare', offer: '$800', type: '1x Instagram Reel', deadline: 'In 3 days' },
            { brand: 'Pulse Audio', offer: '$1,200', type: 'YouTube Dedicated Video', deadline: 'In 5 days' },
          ].map((invite, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between space-y-4 hover:border-pink-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{invite.brand}</span>
                <span className="font-black text-emerald-400 text-sm">{invite.offer}</span>
              </div>
              <p className="text-xs text-slate-400">{invite.type}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[11px] text-slate-500">{invite.deadline}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs">
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
