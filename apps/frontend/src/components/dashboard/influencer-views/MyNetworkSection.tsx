'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Building2, Search, RotateCw, Loader2 } from 'lucide-react';
import NetworkKpiBar from './subcomponents/NetworkKpiBar';
import BrandPartnerCardItem, { BrandPartnerItem } from './subcomponents/BrandPartnerCardItem';
import { NetworkService } from '@/services/network.service';

export default function MyNetworkSection() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PREFERRED' | 'REPEAT_SPONSOR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<BrandPartnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNetwork = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

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
      setIsRefreshing(false);
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

  // Aggregate KPI computations
  const totalEarningsNum = useMemo(() => {
    return brands.reduce((acc, b) => {
      const parsed = parseFloat(String(b.totalPaid).replace(/[^0-9.-]+/g, '')) || 0;
      return acc + parsed;
    }, 0);
  }, [brands]);

  const repeatRate = useMemo(() => {
    if (brands.length === 0) return '0%';
    const repeatCount = brands.filter((b) => b.totalDeals >= 2).length;
    return `${Math.round((repeatCount / brands.length) * 100)}% Repeat`;
  }, [brands]);

  return (
    <div className="space-y-6">
      {/* 1. Dynamic KPI Stats Summary Bar */}
      <NetworkKpiBar
        totalBrands={brands.length}
        totalEarnings={`$${totalEarningsNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      />

      {/* 2. Controls Bar: Search, Refresh & Relationship Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search past brand partners by company, industry, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <button
            onClick={() => loadNetwork(true)}
            disabled={isRefreshing || isLoading}
            title="Refresh network partners"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition-all shrink-0"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
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
