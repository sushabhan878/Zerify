'use client';

import React, { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import ApplicationKpiBar from './subcomponents/ApplicationKpiBar';
import ApplicationCardItem, { ApplicationItem } from './subcomponents/ApplicationCardItem';

export default function ApplicationsSection() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONTRACT_SENT' | 'SHORTLISTED' | 'UNDER_REVIEW' | 'DECLINED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [applications, setApplications] = useState<ApplicationItem[]>([
    {
      id: 1,
      brand: 'Sony Audio Systems',
      industry: 'Consumer Audio & Tech',
      role: 'WH-1000XM5 Wireless Headphones Unboxing Reel',
      appliedDate: 'Jul 22, 2026',
      proposedRate: '$2,800.00',
      deliveryTime: '5 Days from acceptance',
      status: 'CONTRACT_SENT',
      platforms: ['Instagram', 'YouTube'],
      verifiedBrand: true,
      pitchSummary: 'Proposed a cinematic 4K unboxing Reel with custom sound-frequency visuals demonstrating active noise cancellation in bustling city spots.',
      lastViewedByBrand: 'Brand viewed pitch 2h ago',
    },
    {
      id: 2,
      brand: 'Logitech Gaming',
      industry: 'Gaming Accessories & Hardware',
      role: 'Stream Deck + Wireless Gaming Mouse Integration',
      appliedDate: 'Jul 18, 2026',
      proposedRate: '$3,200.00',
      deliveryTime: '7 Days',
      status: 'SHORTLISTED',
      platforms: ['YouTube', 'TikTok'],
      verifiedBrand: true,
      pitchSummary: 'Will feature macro automation shortcuts for stream creators and dedicated RGB lighting syncing with game triggers.',
      lastViewedByBrand: 'Brand viewed pitch yesterday',
    },
    {
      id: 3,
      brand: 'Razer Inc',
      industry: 'High Performance Laptops',
      role: 'Blade 16 Gaming Laptop Showcase & Benchmark Test',
      appliedDate: 'Jul 10, 2026',
      proposedRate: '$4,500.00',
      deliveryTime: '10 Days',
      status: 'UNDER_REVIEW',
      platforms: ['YouTube'],
      verifiedBrand: true,
      pitchSummary: 'Detailed FPS benchmark test comparing OLED screen performance in triple-A games with thermal management analytics.',
      lastViewedByBrand: 'Pitch under active review by PR team',
    },
  ]);

  const handleWithdraw = (id: number) => {
    if (confirm('Are you sure you want to withdraw this application pitch?')) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const filtered = applications.filter((app) => {
    const matchesTab = activeTab === 'ALL' || app.status === activeTab;
    const matchesSearch =
      app.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Applications Tracker</span>
          </h2>
          <p className="text-xs text-slate-400">Track pitch submissions, proposed rates, and contract offers from brand campaigns</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-extrabold text-purple-300">
            {applications.length} Pitches Submitted
          </span>
        </div>
      </div>

      {/* 1. KPI Stats Summary Bar */}
      <ApplicationKpiBar totalCount={applications.length} totalProposedValue="$10,500.00" />

      {/* 2. Controls Bar: Search & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search applications by brand, role, or campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Applications' },
            { id: 'CONTRACT_SENT', label: 'Contracts Sent' },
            { id: 'SHORTLISTED', label: 'Shortlisted' },
            { id: 'UNDER_REVIEW', label: 'Under Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Application Cards */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((application) => (
            <ApplicationCardItem key={application.id} application={application} onWithdraw={handleWithdraw} />
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Applications Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No pitches match your selected filter criteria. Apply to open campaigns from company discovery.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
