'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronDown,
  Check,
  Clock,
  TrendingUp,
  Calendar,
} from 'lucide-react';
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
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const campaignDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        campaignDropdownRef.current &&
        !campaignDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCampaignDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    {
      id: 'ACTIVE' as DealsTabFilter,
      label: 'Active Deals',
      count: tabCounts.ACTIVE,
      icon: ShieldCheck,
      color: 'text-purple-400 light:text-purple-600',
      activeBg: 'bg-purple-600 text-white keep-white shadow-lg shadow-purple-600/30 border-purple-500/50',
    },
    {
      id: 'COMPLETED' as DealsTabFilter,
      label: 'Completed Deals',
      count: tabCounts.COMPLETED,
      icon: CheckCircle2,
      color: 'text-emerald-400 light:text-emerald-600',
      activeBg: 'bg-emerald-600 text-white keep-white shadow-lg shadow-emerald-600/30 border-emerald-500/50',
    },
    {
      id: 'CANCELLED' as DealsTabFilter,
      label: 'Cancelled Deals',
      count: tabCounts.CANCELLED,
      icon: AlertCircle,
      color: 'text-rose-400 light:text-rose-600',
      activeBg: 'bg-rose-600 text-white keep-white shadow-lg shadow-rose-600/30 border-rose-500/50',
    },
    {
      id: 'ALL' as DealsTabFilter,
      label: 'All Deals',
      count: tabCounts.ALL,
      icon: Layers,
      color: 'text-slate-400 light:text-slate-500',
      activeBg: 'bg-slate-700 light:bg-slate-800 text-white keep-white shadow-lg shadow-slate-900/40 border-slate-600',
    },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Most Recent', icon: Clock },
    { value: 'highest_amount', label: 'Highest Amount', icon: TrendingUp },
    { value: 'due_date', label: 'Due Date', icon: Calendar },
  ];

  const currentSort = sortOptions.find((s) => s.value === sortBy) || sortOptions[0];
  const CurrentSortIcon = currentSort.icon;

  const selectedCampaignTitle =
    selectedCampaignId === 'ALL'
      ? 'All Campaigns'
      : campaignsList.find((c) => c.id === selectedCampaignId)?.title || 'All Campaigns';

  return (
    <div className="space-y-4">
      {/* Switchable Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/[0.08] light:border-slate-200">
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
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border-white/5 hover:border-purple-500/30 light:bg-white light:border-slate-200 light:text-slate-600 light:hover:text-purple-700 light:hover:border-purple-300 light:shadow-sm'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white keep-white' : tab.color}`} />
              <span className={isActive ? 'keep-white text-white' : ''}>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive
                    ? 'bg-black/25 text-white keep-white'
                    : 'bg-slate-800 text-slate-300 border border-white/10 light:bg-slate-100 light:border-slate-200 light:text-slate-600'
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 light:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by creator name, handle, or campaign..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 light:bg-white border border-white/10 light:border-slate-200 text-xs text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:border-purple-500/50 light:focus:border-purple-400 transition-colors shadow-inner light:shadow-sm"
          />
        </div>

        {/* Custom Dropdown Filters Group */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Custom Campaign Filter Dropdown */}
          <div className="relative" ref={campaignDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsCampaignDropdownOpen((prev) => !prev);
                setIsSortDropdownOpen(false);
              }}
              className={`flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl bg-slate-900/90 border text-xs font-bold transition-all shadow-md cursor-pointer select-none ${
                isCampaignDropdownOpen
                  ? 'border-purple-500/60 text-white light:text-purple-700 shadow-purple-950/40 ring-1 ring-purple-500/40 light:bg-purple-50 light:border-purple-300'
                  : 'border-white/10 hover:border-purple-500/40 hover:bg-slate-800/80 text-slate-300 hover:text-white light:bg-white light:border-slate-200 light:text-slate-700 light:hover:border-purple-300 light:shadow-sm'
              }`}
            >
              <div className="w-5 h-5 rounded-lg bg-purple-500/15 light:bg-purple-50 flex items-center justify-center shrink-0">
                <Filter className="w-3 h-3 text-purple-400 light:text-purple-600" />
              </div>
              <span className="truncate max-w-[130px] sm:max-w-[160px]">
                {selectedCampaignTitle}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  isCampaignDropdownOpen ? 'rotate-180 text-purple-300 light:text-purple-600' : 'text-slate-400 light:text-slate-500'
                }`}
              />
            </button>

            <AnimatePresence>
              {isCampaignDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-60 sm:w-64 max-h-64 overflow-y-auto rounded-2xl bg-[#0A0E1A]/95 light:bg-white border border-purple-500/30 light:border-slate-200 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(168,85,247,0.18)] light:shadow-xl p-1.5 z-50 space-y-0.5 no-scrollbar"
                >
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 light:text-slate-500 flex items-center justify-between border-b border-white/[0.06] light:border-slate-200 mb-1">
                    <span>Campaign</span>
                    <span className="text-[9px] text-purple-400 light:text-purple-600 font-bold">{campaignsList.length + 1} options</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onCampaignChange('ALL');
                      setIsCampaignDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                      selectedCampaignId === 'ALL'
                        ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-sm shadow-purple-900/30 light:bg-purple-50 light:border-purple-300 light:text-purple-700'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70 light:text-slate-700 light:hover:bg-purple-50 light:hover:text-purple-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Layers className={`w-3.5 h-3.5 shrink-0 ${selectedCampaignId === 'ALL' ? 'text-purple-400 light:text-purple-600' : 'text-slate-400 light:text-slate-500'}`} />
                      <span className="truncate">All Campaigns</span>
                    </div>
                    {selectedCampaignId === 'ALL' && (
                      <Check className="w-3.5 h-3.5 text-purple-400 light:text-purple-600 shrink-0" />
                    )}
                  </button>

                  {campaignsList.map((c) => {
                    const isSelected = selectedCampaignId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onCampaignChange(c.id);
                          setIsCampaignDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-sm shadow-purple-900/30 light:bg-purple-50 light:border-purple-300 light:text-purple-700'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/70 light:text-slate-700 light:hover:bg-purple-50 light:hover:text-purple-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-purple-400 light:bg-purple-600 shadow-sm shadow-purple-400' : 'bg-slate-500 light:bg-slate-400'}`} />
                          <span className="truncate">{c.title}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-purple-400 light:text-purple-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom Sort By Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsSortDropdownOpen((prev) => !prev);
                setIsCampaignDropdownOpen(false);
              }}
              className={`flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl bg-slate-900/90 border text-xs font-bold transition-all shadow-md cursor-pointer select-none ${
                isSortDropdownOpen
                  ? 'border-purple-500/60 text-white light:text-purple-700 shadow-purple-950/40 ring-1 ring-purple-500/40 light:bg-purple-50 light:border-purple-300'
                  : 'border-white/10 hover:border-purple-500/40 hover:bg-slate-800/80 text-slate-300 hover:text-white light:bg-white light:border-slate-200 light:text-slate-700 light:hover:border-purple-300 light:shadow-sm'
              }`}
            >
              <div className="w-5 h-5 rounded-lg bg-purple-500/15 light:bg-purple-50 flex items-center justify-center shrink-0">
                <CurrentSortIcon className="w-3 h-3 text-purple-400 light:text-purple-600" />
              </div>
              <span>{currentSort.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  isSortDropdownOpen ? 'rotate-180 text-purple-300 light:text-purple-600' : 'text-slate-400 light:text-slate-500'
                }`}
              />
            </button>

            <AnimatePresence>
              {isSortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#0A0E1A]/95 light:bg-white border border-purple-500/30 light:border-slate-200 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(168,85,247,0.18)] light:shadow-xl p-1.5 z-50 space-y-0.5"
                >
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 light:text-slate-500 flex items-center justify-between border-b border-white/[0.06] light:border-slate-200 mb-1">
                    <span>Sort By</span>
                  </div>

                  {sortOptions.map((opt) => {
                    const isSelected = sortBy === opt.value;
                    const OptionIcon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onSortByChange(opt.value);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-sm shadow-purple-900/30 light:bg-purple-50 light:border-purple-300 light:text-purple-700'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/70 light:text-slate-700 light:hover:bg-purple-50 light:hover:text-purple-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <OptionIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-400 light:text-purple-600' : 'text-slate-400 light:text-slate-500'}`} />
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-purple-400 light:text-purple-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
