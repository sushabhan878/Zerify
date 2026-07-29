'use client';

import React, { useState } from 'react';
import { MailCheck, Search, Filter } from 'lucide-react';
import InvitationKpiBar from './subcomponents/InvitationKpiBar';
import InvitationCardItem, { CampaignInvite } from './subcomponents/InvitationCardItem';

export default function CampaignInvitationsSection() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [invites, setInvites] = useState<CampaignInvite[]>([
    {
      id: 1,
      brand: 'Sony Audio Systems',
      industry: 'Consumer Electronics & Audio',
      title: 'WH-1000XM5 Premium Noise Canceling Launch',
      payout: '$3,500.00',
      deadline: 'Aug 15, 2026',
      matchPct: '98%',
      status: 'PENDING',
      deliverables: ['1x YouTube Dedicated Video (8-10m)', '2x Instagram High Resolution Reels'],
      perks: ['Free Product Sample Delivered', 'Worldwide Usage Rights (6 Months)', 'Express Payout'],
      platforms: ['YouTube', 'Instagram'],
      verifiedBrand: true,
    },
    {
      id: 2,
      brand: 'Gymshark Activewear',
      industry: 'Fitness & Lifestyle Apparel',
      title: 'Fall High-Performance Seamless Collection',
      payout: '$2,200.00',
      deadline: 'Aug 20, 2026',
      matchPct: '94%',
      status: 'PENDING',
      deliverables: ['2x TikTok Workout Try-On Videos', '3x IG Story Slides with Tracked Swipe-up'],
      perks: ['Complimentary Apparel Kit ($600 Value)', '15% Affiliate Commission Bonus'],
      platforms: ['TikTok', 'Instagram'],
      verifiedBrand: true,
    },
    {
      id: 3,
      brand: 'NordVPN Cybersecurity',
      industry: 'Software & Online Security',
      title: 'Tech Sponsorship Integration & Cyber Month',
      payout: '$1,800.00',
      deadline: 'Aug 25, 2026',
      matchPct: '91%',
      status: 'PENDING',
      deliverables: ['1x 60s Dedicated Mid-Roll Sponsorship Segment'],
      perks: ['Custom Promo Code', 'Recurring Sponsorship Renewal Option'],
      platforms: ['YouTube'],
      verifiedBrand: true,
    },
  ]);

  const handleAction = (id: number, newStatus: 'ACCEPTED' | 'DECLINED' | 'COUNTERED') => {
    setInvites((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv)));
  };

  const filteredInvites = invites.filter((inv) => {
    const matchesTab = activeTab === 'ALL' || (activeTab === 'PENDING' ? inv.status === 'PENDING' : inv.status === activeTab);
    const matchesSearch =
      inv.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = invites.filter((i) => i.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-purple-400" />
            <span>Direct Campaign Invitations</span>
          </h2>
          <p className="text-xs text-slate-400">Exclusive campaign offers received directly from brand partnerships teams</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-extrabold text-purple-300">
            {pendingCount} Pending Review
          </span>
        </div>
      </div>

      {/* 1. KPI Stats Summary Bar */}
      <InvitationKpiBar pendingCount={pendingCount} totalPotentialPayout="$7,500.00" />

      {/* 2. Controls Bar: Search & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search offers by brand, campaign title, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/5">
          {(['ALL', 'PENDING', 'ACCEPTED', 'DECLINED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Cards List */}
      <div className="space-y-4">
        {filteredInvites.length > 0 ? (
          filteredInvites.map((invite) => (
            <InvitationCardItem key={invite.id} invite={invite} onAction={handleAction} />
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center space-y-2">
            <MailCheck className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Invitations Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No offers match your current filter query. Brands frequently inspect top creator profiles daily.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
