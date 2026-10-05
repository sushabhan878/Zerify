'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Building2, Search, Loader2 } from 'lucide-react';
import NetworkKpiBar from './subcomponents/NetworkKpiBar';
import BrandPartnerCardItem, { BrandPartnerItem } from './subcomponents/BrandPartnerCardItem';
import { NetworkService } from '@/services/network.service';
import { useCurrency } from '@/context/CurrencyContext';

export default function MyNetworkSection() {
  const { format: formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PREFERRED' | 'REPEAT_SPONSOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<BrandPartnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNetwork = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await NetworkService.getMyNetwork().catch(() => []);
      if (Array.isArray(data)) {
        setBrands(data);
      } else {
        setBrands([]);
      }
    } catch (e) {
      console.warn('Could not load live network:', e);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNetwork();
  }, [loadNetwork]);

  const handleProposePitch = (brandName: string) => {
    alert(`Pitch proposal draft opened for ${brandName}. Direct messaging brand manager initiated.`);
  };

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesTab = activeTab === 'ALL' || brand.relationshipTag === activeTab;
      const matchesSearch =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [brands, activeTab, searchQuery]);

  const kpis = useMemo(() => {
    const currentList =
      activeTab === 'ALL' ? brands : brands.filter((b) => b.relationshipTag === activeTab);
    const count = currentList.length;
    const totalEarnings = currentList.reduce((acc, b) => {
      const parsed = parseFloat(String(b.totalPaid).replace(/[^0-9.-]+/g, '')) || 0;
      return acc + parsed;
    }, 0);
    const totalDeals = currentList.reduce((acc, b) => acc + (b.totalDeals || 0), 0);
    const avgEarningsPerBrand = count > 0 ? totalEarnings / count : 0;
    const repeatCount = brands.filter((b) => b.totalDeals >= 2).length;
    const repeatRate = brands.length > 0 ? Math.round((repeatCount / brands.length) * 100) : 0;

    if (activeTab === 'PREFERRED') {
      return [
        {
          label: 'Preferred Partners',
          val: `${count} Brands`,
          change: count > 0 ? 'Top collaboration partners' : 'No preferred partners',
        },
        {
          label: 'Preferred Revenue',
          val: formatCurrency(totalEarnings),
          change: count > 0 ? 'From top-tier brands' : 'No revenue yet',
        },
        {
          label: 'Completed Campaigns',
          val: `${totalDeals} Deals`,
          change: count > 0 ? 'High-priority collaborations' : '0 deals',
        },
        {
          label: 'Avg. Revenue / Partner',
          val: formatCurrency(avgEarningsPerBrand),
          change: 'Per preferred brand',
        },
      ];
    }

    if (activeTab === 'REPEAT_SPONSOR') {
      const avgDealsPerSponsor = count > 0 ? totalDeals / count : 0;
      return [
        {
          label: 'Repeat Sponsors',
          val: `${count} Brands`,
          change: count > 0 ? 'Recurring partnerships' : 'No repeat sponsors',
        },
        {
          label: 'Repeat Revenue',
          val: formatCurrency(totalEarnings),
          change: count > 0 ? 'From ongoing sponsors' : 'No repeat revenue',
        },
        {
          label: 'Repeat Contracts',
          val: `${totalDeals} Deals`,
          change: count > 0 ? 'Across repeat sponsors' : '0 deals',
        },
        {
          label: 'Avg. Deals / Sponsor',
          val: `${avgDealsPerSponsor.toFixed(1)} Deals`,
          change: count > 0 ? 'Campaigns per sponsor' : '0 deals',
        },
      ];
    }

    // ALL Partners
    return [
      {
        label: 'Brand Partners',
        val: `${count} Brands`,
        change: 'Total connected network',
      },
      {
        label: 'Total Revenue Earned',
        val: formatCurrency(totalEarnings),
        change: 'Cumulative lifetime earnings',
      },
      {
        label: 'Total Deals Completed',
        val: `${totalDeals} Campaigns`,
        change: 'Delivered across network',
      },
      {
        label: 'Repeat Partner Rate',
        val: `${repeatRate}%`,
        change: `${repeatCount} of ${brands.length} repeat sponsors`,
      },
    ];
  }, [activeTab, brands, formatCurrency]);

  return (
    <div className="space-y-6">
      {/* 1. Dynamic KPI Stats Summary Bar */}
      <NetworkKpiBar kpis={kpis} />

      {/* 2. Controls Bar: Search & Relationship Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past brand partners by company, industry, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/10 overflow-x-auto no-scrollbar">
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

      {/* 3. Brand Partner Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading your brand partner network...</span>
          </div>
        ) : filteredBrands.length > 0 ? (
          filteredBrands.map((brand) => (
            <BrandPartnerCardItem key={brand.id} brand={brand} onProposePitch={handleProposePitch} />
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center space-y-2">
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
