'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard,
  UserPlus,
  Contact,
  Megaphone,
  Gift,
  LineChart,
} from 'lucide-react';

export default function ReportingView() {
  const metrics = [
    { icon: FileText, value: '142.8k', label: 'Total Active Posts', sub: 'Last 6 months', change: '+100%' },
    { icon: Users, value: '1,458', label: 'Total Active Members', sub: 'Last 6 months', change: '+121%' },
    { icon: Eye, value: '48K', label: '6.8K Paid | 40.9K Organic', sub: 'Last 6 months', change: '+4,405%' },
    { icon: Heart, value: '4.5K', label: '0 Paid | 4.4K Organic', sub: 'Last 6 months', change: '+27,775%' },
    { icon: Share2, value: '22K', label: '0 Paid | 22.2K Organic', sub: 'Last 6 months', change: '+2,357%' },
    { icon: TrendingUp, value: '$4K', label: 'Total Media Value', sub: 'Last 6 months', change: '+7,027%' },
  ];

  return (
    <motion.div
      key="measure"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl text-slate-900 shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row min-h-[520px]"
    >
      {/* Sidebar */}
      <div className="w-full md:w-48 bg-slate-50 border-r border-slate-200/80 p-4 flex flex-row md:flex-col justify-between md:justify-start gap-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-950 text-base pb-3 border-b border-slate-200">
          <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center font-serif text-sm">
            Z
          </div>
          <span>Reporting</span>
        </div>
        <div className="flex md:flex-col gap-1 overflow-x-auto">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> <span>Home</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors">
            <UserPlus className="w-4 h-4" /> <span>Recruit</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors">
            <Contact className="w-4 h-4" /> <span>Contacts</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors">
            <Megaphone className="w-4 h-4" /> <span>Campaigns</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors">
            <FileText className="w-4 h-4" /> <span>Content</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200/60 transition-colors">
            <Gift className="w-4 h-4" /> <span>Offers</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white font-bold shadow-sm">
            <LineChart className="w-4 h-4 text-purple-400" /> <span>Reporting</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 bg-white overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-900 border border-slate-200">
              Impact Dashboard
            </button>
            <button className="px-3 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900">
              Social Summary
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <button className="px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1 hover:bg-slate-50">
              Saved Views <ChevronDown className="w-3 h-3" />
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1 hover:bg-slate-50">
              Date Range: Last 6 Months <ChevronDown className="w-3 h-3" />
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1 hover:bg-slate-50">
              Network <ChevronDown className="w-3 h-3" />
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1 hover:bg-slate-50">
              Post Type <ChevronDown className="w-3 h-3" />
            </button>
            <button className="text-slate-400 hover:text-slate-700 font-medium ml-2">Clear All</button>
            <button className="text-slate-400 hover:text-slate-700 font-medium ml-2">Save View</button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">Top Metrics</h3>
          <p className="text-xs text-slate-500">Blended social performance across all creator networks</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                    {m.change} <ArrowUpRight className="w-2.5 h-2.5" />
                  </span>
                </div>
                <p className="text-lg font-black text-slate-900 pt-1">{m.value}</p>
                <p className="text-[10px] font-medium text-slate-500">{m.label}</p>
                <p className="text-[9px] text-slate-400 pt-1">{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom Nav */}
        <div className="rounded-xl bg-slate-900 text-white p-3 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-6">
            <span className="text-purple-400 font-bold border-b-2 border-purple-400 pb-0.5">Impact Dashboard</span>
            <span className="text-slate-400 hover:text-white cursor-pointer">Sales Dashboard</span>
            <span className="text-slate-400 hover:text-white cursor-pointer">Social Dashboard</span>
            <span className="text-slate-400 hover:text-white cursor-pointer">Budget Ledger</span>
          </div>
          <button className="px-3 py-1 rounded bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </motion.div>
  );
}
