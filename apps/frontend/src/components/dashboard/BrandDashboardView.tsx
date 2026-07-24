'use client';

import React from 'react';
import { Megaphone, Users, DollarSign, Eye, Plus, Search, ArrowUpRight } from 'lucide-react';
import DashboardMetricCard from './subcomponents/DashboardMetricCard';

interface BrandDashboardViewProps {
  userName: string;
}

export default function BrandDashboardView({ userName }: BrandDashboardViewProps) {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/20 backdrop-blur-2xl">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block mb-1">
            Brand Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">{userName}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your active influencer marketing campaigns and track ROI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Launch Campaign</span>
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Browse Creators</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Active Campaigns"
          value="4"
          change="+2 this month"
          icon={Megaphone}
          iconColor="text-purple-400"
        />
        <DashboardMetricCard
          title="Influencers Engaged"
          value="28"
          change="+15%"
          icon={Users}
          iconColor="text-pink-400"
        />
        <DashboardMetricCard
          title="Total Reach"
          value="1.4M"
          change="+34.2%"
          icon={Eye}
          iconColor="text-indigo-400"
        />
        <DashboardMetricCard
          title="Budget Spent"
          value="$12,450"
          change="On Budget"
          icon={DollarSign}
          iconColor="text-emerald-400"
        />
      </div>

      {/* Placeholder Table Section */}
      <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-white">Recent Campaigns</h3>
            <p className="text-xs text-slate-400">Live influencer campaign status</p>
          </div>
          <button className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Summer Product Launch 2026', creators: 12, budget: '$5,000', status: 'Active' },
            { name: 'Tech Review UGC Drive', creators: 8, budget: '$3,200', status: 'In Review' },
            { name: 'Fashion Reels Brand Push', creators: 5, budget: '$2,500', status: 'Draft' },
          ].map((c, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs hover:border-white/10 transition-all"
            >
              <div className="font-bold text-white">{c.name}</div>
              <div className="text-slate-400">{c.creators} Creators</div>
              <div className="font-semibold text-purple-300">{c.budget}</div>
              <div className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-[10px]">
                {c.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
