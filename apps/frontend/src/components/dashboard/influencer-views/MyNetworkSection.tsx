'use client';

import React, { useState } from 'react';
import { Building2, Search } from 'lucide-react';
import NetworkKpiBar from './subcomponents/NetworkKpiBar';
import BrandPartnerCardItem, { BrandPartnerItem } from './subcomponents/BrandPartnerCardItem';

export default function MyNetworkSection() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PREFERRED' | 'REPEAT_SPONSOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [brands, setBrands] = useState<BrandPartnerItem[]>([
    {
      id: 1,
      name: 'Sony Audio Systems',
      industry: 'Consumer Audio & Tech',
      totalDeals: 4,
      totalPaid: '$14,200.00',
      lastWorked: 'Jun 2026',
      contactPerson: 'Sarah Jenkins',
      contactRole: 'Lead PR & Creator Relations',
      verified: true,
      relationshipTag: 'PREFERRED',
      pastCampaignsList: [
        'WH-1000XM5 Wireless Headphones Launch ($3,500)',
        'WF-1000XM4 Noise Canceling Earbuds Reel ($2,800)',
        'LinkBuds S Creator Campaign ($4,100)',
        'PlayStation Pulse 3D Audio Unboxing ($3,800)',
      ],
    },
    {
      id: 2,
      name: 'Gymshark Apparel',
      industry: 'Fitness & Activewear',
      totalDeals: 3,
      totalPaid: '$8,600.00',
      lastWorked: 'May 2026',
      contactPerson: 'Marcus Vance',
      contactRole: 'Influencer Marketing Manager',
      verified: true,
      relationshipTag: 'REPEAT_SPONSOR',
      pastCampaignsList: [
        'Summer Workout Seamless Release ($3,200)',
        'Black Friday Activewear Sale Stories ($2,600)',
        'Vital Seamless Try-On Haul ($2,800)',
      ],
    },
    {
      id: 3,
      name: 'FlexiSpot Furniture',
      industry: 'Productivity & Workspace Hardware',
      totalDeals: 2,
      totalPaid: '$5,600.00',
      lastWorked: 'Jul 2026',
      contactPerson: 'Elena Rostova',
      contactRole: 'Brand Partnerships Lead',
      verified: true,
      relationshipTag: 'REPEAT_SPONSOR',
      pastCampaignsList: [
        'Ergonomic Standing Desk E7 Setup Showcase ($2,800)',
        'Motorized Desk Converter Review ($2,800)',
      ],
    },
    {
      id: 4,
      name: 'NordVPN Cybersecurity',
      industry: 'Software & Online Security',
      totalDeals: 5,
      totalPaid: '$9,800.00',
      lastWorked: 'Apr 2026',
      contactPerson: 'Alex Rivera',
      contactRole: 'Global Creator Acquisitions',
      verified: true,
      relationshipTag: 'PREFERRED',
      pastCampaignsList: [
        'Cyber Security Awareness Dedicated Video ($2,200)',
        'Threat Protection Mid-Roll Sponsor ($1,800)',
        'Travel VPN Security Showcase ($2,000)',
      ],
    },
  ]);

  const handleProposePitch = (brandName: string) => {
    alert(`Pitch proposal draft opened for ${brandName}. Direct messaging brand manager initiated.`);
  };

  const filteredBrands = brands.filter((brand) => {
    const matchesTab = activeTab === 'ALL' || brand.relationshipTag === activeTab;
    const matchesSearch =
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span>Brand Partner Network</span>
          </h2>
          <p className="text-xs text-slate-400">Directory of all companies and brand managers you have previously collaborated with</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-extrabold text-purple-300">
            {brands.length} Past Brand Partners
          </span>
        </div>
      </div>

      {/* 1. KPI Stats Summary Bar */}
      <NetworkKpiBar totalBrands={brands.length} totalEarnings="$38,200.00" />

      {/* 2. Controls Bar: Search & Relationship Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past brand partners by company, industry, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Partners' },
            { id: 'PREFERRED', label: 'Preferred Partners' },
            { id: 'REPEAT_SPONSOR', label: 'Repeat Sponsors' },
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

      {/* 3. Brand Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand) => (
            <BrandPartnerCardItem key={brand.id} brand={brand} onProposePitch={handleProposePitch} />
          ))
        ) : (
          <div className="col-span-full p-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center space-y-2">
            <Building2 className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Brand Partners Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No previous brand collaborations match your search criteria. Completed campaigns will automatically populate here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
