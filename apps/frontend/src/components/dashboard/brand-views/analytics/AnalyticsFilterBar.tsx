'use client';

import React from 'react';
import { Calendar, Filter, Megaphone, Globe, Download } from 'lucide-react';

interface AnalyticsFilterBarProps {
  dateRange: string;
  setDateRange: (val: string) => void;
  selectedCampaign: string;
  setSelectedCampaign: (val: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (val: string) => void;
  onExport?: () => void;
}

export default function AnalyticsFilterBar({
  dateRange,
  setDateRange,
  selectedCampaign,
  setSelectedCampaign,
  selectedPlatform,
  setSelectedPlatform,
  onExport,
}: AnalyticsFilterBarProps) {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-bold text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Filter by Date Range"
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-2"
            >
              <option value="7d" className="bg-slate-900 text-white">Last 7 Days</option>
              <option value="30d" className="bg-slate-900 text-white">Last 30 Days</option>
              <option value="90d" className="bg-slate-900 text-white">Last 90 Days</option>
              <option value="ytd" className="bg-slate-900 text-white">Year to Date</option>
              <option value="all" className="bg-slate-900 text-white">All Time</option>
            </select>
          </div>
        </div>

        {/* Campaign Filter Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-bold text-slate-200">
            <Megaphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              aria-label="Filter by Campaign"
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-slate-900 text-white">All Campaigns</option>
              <option value="summer-skincare" className="bg-slate-900 text-white">Summer Skincare Launch</option>
              <option value="new-product" className="bg-slate-900 text-white">New Product Launch</option>
              <option value="brand-awareness" className="bg-slate-900 text-white">Brand Awareness</option>
            </select>
          </div>
        </div>

        {/* Platform Filter Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-bold text-slate-200">
            <Globe className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              aria-label="Filter by Platform"
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-slate-900 text-white">All Platforms</option>
              <option value="instagram" className="bg-slate-900 text-white">Instagram</option>
              <option value="youtube" className="bg-slate-900 text-white">YouTube</option>
              <option value="tiktok" className="bg-slate-900 text-white">TikTok</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Action */}
      <button
        onClick={onExport}
        type="button"
        className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export Report</span>
      </button>
    </div>
  );
}
