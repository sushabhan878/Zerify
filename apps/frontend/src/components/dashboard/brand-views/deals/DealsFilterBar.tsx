'use client';

import React from 'react';
import { Search, Filter, ShieldCheck, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { DealStatus } from './deal-types';

export type DealsTabFilter = DealStatus | 'ALL';

interface DealsFilterBarProps {
  activeTab: DealsTabFilter;
  onTabChange: (tab: DealsTabFilter) => void;
  tabCounts: {
    ACTIVE: number;
    COMPLETED: number;
    CANCELLED: number;
    ALL: number;
  };
  searchQuery: string;
  onSearchChange: (q: string) => void;
  campaignsList: { id: string; title: string }[];
  selectedCampaignId: string;
  onCampaignChange: (id: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

export default function DealsFilterBar({
  activeTab,
  onTabChange,
  tabCounts,
  searchQuery,
  onSearchChange,
  campaignsList,
  selectedCampaignId,
  onCampaignChange,
  sortBy,
  onSortByChange,
}: DealsFilterBarProps) {
  const tabs = [
    {
      id: 'ACTIVE' as DealsTabFilter,
      label: 'Active Deals',
      count: tabCounts.ACTIVE,
      icon: ShieldCheck,
      color: 'text-purple-400',
      activeBg: 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border-purple-500/50',
    },
    {
      id: 'COMPLETED' as DealsTabFilter,
      label: 'Completed Deals',
      count: tabCounts.COMPLETED,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border-emerald-500/50',
    },
    {
      id: 'CANCELLED' as DealsTabFilter,
      label: 'Cancelled Deals',
      count: tabCounts.CANCELLED,
      icon: AlertCircle,
      color: 'text-rose-400',
      activeBg: 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border-rose-500/50',
    },
    {
      id: 'ALL' as DealsTabFilter,
      label: 'All Deals',
      count: tabCounts.ALL,
      icon: Layers,
      color: 'text-slate-400',
      activeBg: 'bg-slate-700 text-white shadow-lg shadow-slate-900/40 border-slate-600',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Switchable Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/[0.08]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isActive
                  ? tab.activeBg
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border-white/5 hover:border-purple-500/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive
                    ? 'bg-black/25 text-white'
                    : 'bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by creator name, handle, or campaign..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Campaign Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedCampaignId}
              onChange={(e) => onCampaignChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-purple-500/40 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Campaigns</option>
              {campaignsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-purple-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-purple-500/40 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
          >
            <option value="newest">Most Recent</option>
            <option value="highest_amount">Highest Amount</option>
            <option value="due_date">Due Date</option>
          </select>
        </div>
      </div>
    </div>
  );
}
