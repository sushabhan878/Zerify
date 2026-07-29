'use client';

import React, { useState } from 'react';
import { Megaphone, Search } from 'lucide-react';
import ActiveCampaignKpiBar from './subcomponents/ActiveCampaignKpiBar';
import ActiveCampaignCardItem, { ActiveCampaignItem } from './subcomponents/ActiveCampaignCardItem';

export default function ActiveCampaignsSection() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_PRODUCTION' | 'CONTENT_REVIEW' | 'READY_TO_PUBLISH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [campaigns, setCampaigns] = useState<ActiveCampaignItem[]>([
    {
      id: 1,
      title: 'Ergonomic Standing Desk Setup Showcase',
      brand: 'FlexiSpot Official',
      industry: 'Office & Home Productivity',
      stage: 'CONTENT_REVIEW',
      deadline: 'Aug 04, 2026 (2 Days Left)',
      payout: '$2,800.00',
      progress: 75,
      deliverables: [
        { title: '1x YouTube Dedicated Video (10-12 mins)', completed: true },
        { title: '1x Instagram Reel Feature', completed: false },
      ],
      verifiedBrand: true,
      contractBrief: 'Highlight motorized height adjustment preset memory buttons, dual motor quiet operation (<45dB), and 350lbs weight capacity in workspace setup environment.',
    },
    {
      id: 2,
      title: 'Wireless ANC Headphones Unboxing & Sound Test',
      brand: 'Soundcore Audio',
      industry: 'Consumer Audio & Accessories',
      stage: 'READY_TO_PUBLISH',
      deadline: 'Aug 08, 2026',
      payout: '$1,500.00',
      progress: 90,
      deliverables: [
        { title: '2x Instagram Reels & Story Set', completed: true },
        { title: '1x YouTube Short Unboxing', completed: true },
      ],
      verifiedBrand: true,
      contractBrief: 'Demonstrate active noise cancellation in noisy coffee shop environment. Include link-in-bio trackable discount code in story swipe up.',
    },
    {
      id: 3,
      title: 'Smart Fitness Ring 24/7 Sleep & Health Tracking',
      brand: 'Ultrahuman Ring',
      industry: 'Health Tech & Wearables',
      stage: 'IN_PRODUCTION',
      deadline: 'Aug 14, 2026',
      payout: '$4,000.00',
      progress: 40,
      deliverables: [
        { title: '1x YouTube 60s Integrated Sponsor Segment', completed: false },
        { title: '1x TikTok Daily Vlog Feature', completed: false },
      ],
      verifiedBrand: true,
      contractBrief: 'Show night time recovery score dashboard on smartphone app and sleek titanium finish during gym workouts.',
    },
  ]);

  const handleUploadSubmit = (id: number) => {
    alert(`Draft upload modal opened for campaign #${id}. File upload pipeline ready!`);
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesTab = activeTab === 'ALL' || c.stage === activeTab;
    const matchesSearch =
      c.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-400" />
            <span>Active Collaborations</span>
          </h2>
          <p className="text-xs text-slate-400">Track active deliverables, milestone deadlines, and content draft submissions</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-extrabold text-purple-300">
            {campaigns.length} Active Collaborations
          </span>
        </div>
      </div>

      {/* 1. KPI Stats Summary Bar */}
      <ActiveCampaignKpiBar activeCount={campaigns.length} totalEscrowLocked="$8,300.00" />

      {/* 2. Search & Stage Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search active campaigns by brand, title, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Active' },
            { id: 'IN_PRODUCTION', label: 'In Production' },
            { id: 'CONTENT_REVIEW', label: 'In Review' },
            { id: 'READY_TO_PUBLISH', label: 'Ready to Publish' },
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

      {/* 3. Campaign Cards */}
      <div className="space-y-4">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((c) => (
            <ActiveCampaignCardItem key={c.id} campaign={c} onUploadSubmit={handleUploadSubmit} />
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center space-y-2">
            <Megaphone className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Active Campaigns</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No collaborations match the selected stage filter. Accept campaign invitations to start new deals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
