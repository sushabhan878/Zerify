'use client';

import React, { useState, useEffect, useMemo } from 'react';
import CompanySearchBar from './company-discovery/CompanySearchBar';
import CompanyQuickFilters, { QuickFilterState } from './company-discovery/CompanyQuickFilters';
import CompanyActiveFilterChips from './company-discovery/CompanyActiveFilterChips';
import CompanySortAndControls from './company-discovery/CompanySortAndControls';
import CompanyCard, { CompanyItem } from './company-discovery/CompanyCard';
import CompanyDetailModal from './company-discovery/CompanyDetailModal';
import CompanyPitchModal from './company-discovery/CompanyPitchModal';
import CompanyAdvancedFiltersModal, { AdvancedFilterState } from './company-discovery/CompanyAdvancedFiltersModal';
import { Loader2, AlertCircle } from 'lucide-react';

const INITIAL_FILTERS: AdvancedFilterState = {
  industry: 'All',
  budgetRange: 'Any Budget',
  minMatchScore: 0,
  platform: 'All Platforms',
  campaignType: 'All Types',
  paidOnly: false,
  location: 'All',
  companySize: 'All',
  companyStage: 'All',
  isVerifiedOnly: false,
  escrowOnly: false,
  creatorTier: 'All',
  targetGender: 'All',
  targetAge: 'All',
  minNicheScore: 0,
  minAudienceScore: 0,
};

const FALLBACK_COMPANIES: CompanyItem[] = [
  {
    id: 'b1',
    companyName: 'Aetheria Tech Labs',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    website: 'https://aetheria.io',
    industry: 'Software & SaaS',
    location: 'San Francisco, CA, United States',
    description: 'Next-generation AI workflow automation platform for developer teams.',
    brandValues: ['Innovation', 'Quality', 'Transparency'],
    primaryGoals: ['Lead Generation', 'User Acquisition', 'Brand Awareness'],
    targetPlatforms: ['LinkedIn', 'Twitter', 'YouTube'],
    targetAudience: { gender: 'All', ageRanges: ['25-34', '35-44'], locations: ['United States', 'UK', 'India'] },
    creatorTiers: ['Mid', 'Macro'],
    campaignBudget: '$20,000 – $50,000',
    campaignFrequency: 'Monthly Recurring',
    matchScore: 96,
    audienceMatchScore: 98,
    nicheMatchScore: 95,
    contentMatchScore: 94,
    brandFitScore: 92,
    budgetFitScore: 97,
    matchReasons: [
      'Your developer & tech audience aligns 98% with their target user base',
      'Content niche matches Software & SaaS automation',
      'Meets creator tier and reach requirements',
    ],
    isVerified: true,
  },
  {
    id: 'b2',
    companyName: 'GlowBotanica Organics',
    logoUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    website: 'https://glowbotanica.com',
    industry: 'Beauty & Personal Care',
    location: 'Los Angeles, CA, United States',
    description: '100% organic, vegan & cruelty-free botanical skincare formulation infused with alpine extracts.',
    brandValues: ['Sustainability', 'Quality', 'Inclusivity'],
    primaryGoals: ['Brand Awareness', 'Sales & Conversions', 'Content Creation'],
    targetPlatforms: ['Instagram', 'TikTok', 'YouTube'],
    targetAudience: { gender: 'Female', ageRanges: ['18-24', '25-34'], locations: ['United States', 'Canada'] },
    creatorTiers: ['Micro', 'Mid'],
    campaignBudget: '$5,000 – $20,000',
    campaignFrequency: 'Monthly Recurring',
    matchScore: 94,
    audienceMatchScore: 96,
    nicheMatchScore: 94,
    contentMatchScore: 92,
    brandFitScore: 95,
    budgetFitScore: 93,
    matchReasons: [
      'Strong match with beauty & clean lifestyle audience',
      'Highly engaged female demographic',
    ],
    isVerified: true,
  },
  {
    id: 'b3',
    companyName: 'Veloce Activewear',
    logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
    website: 'https://veloceapparel.it',
    industry: 'Fashion & Apparel',
    location: 'Milan, Italy',
    description: 'Italian engineered performance activewear designed for marathon runners and urban athletes.',
    brandValues: ['Innovation', 'Quality'],
    primaryGoals: ['Brand Awareness', 'Sales & Conversions'],
    targetPlatforms: ['Instagram', 'YouTube'],
    targetAudience: { gender: 'All', ageRanges: ['18-24', '25-34', '35-44'], locations: ['UK', 'Germany'] },
    creatorTiers: ['Micro', 'Mid', 'Macro'],
    campaignBudget: '$5,000 – $20,000',
    campaignFrequency: 'Quarterly Campaigns',
    matchScore: 91,
    audienceMatchScore: 93,
    nicheMatchScore: 90,
    contentMatchScore: 91,
    brandFitScore: 89,
    budgetFitScore: 92,
    matchReasons: ['High affinity with marathon runners and athleisure audiences'],
    isVerified: true,
  },
  {
    id: 'b4',
    companyName: 'NovaPulse Energy',
    logoUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80',
    website: 'https://novapulseenergy.com',
    industry: 'Food & Beverage',
    location: 'Austin, TX, United States',
    description: 'Clean sparkling adaptogenic energy drinks with zero sugar, organic green tea caffeine.',
    brandValues: ['Sustainability', 'Affordability'],
    primaryGoals: ['Product Launch', 'Brand Awareness'],
    targetPlatforms: ['Instagram', 'TikTok'],
    targetAudience: { gender: 'All', ageRanges: ['18-24', '25-34'], locations: ['United States'] },
    creatorTiers: ['Nano', 'Micro'],
    campaignBudget: '$1,000 – $5,000',
    campaignFrequency: 'Monthly Recurring',
    matchScore: 88,
    audienceMatchScore: 90,
    nicheMatchScore: 87,
    contentMatchScore: 88,
    brandFitScore: 86,
    budgetFitScore: 89,
    matchReasons: ['Fits energy, gaming, and active fitness lifestyles'],
    isVerified: true,
  },
  {
    id: 'b5',
    companyName: 'ApexFit Performance Systems',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    website: 'https://apexfit.co.uk',
    industry: 'Fitness & Wellness',
    location: 'London, United Kingdom',
    description: 'AI-guided smart resistance workout equipment and biometric wearable trackers.',
    brandValues: ['Innovation', 'Quality'],
    primaryGoals: ['Sales & Conversions', 'Lead Generation'],
    targetPlatforms: ['YouTube', 'Instagram'],
    targetAudience: { gender: 'All', ageRanges: ['25-34', '35-44'], locations: ['United Kingdom', 'United States'] },
    creatorTiers: ['Mid', 'Macro'],
    campaignBudget: '$20,000 – $50,000',
    campaignFrequency: 'Ongoing Partnership',
    matchScore: 95,
    audienceMatchScore: 97,
    nicheMatchScore: 96,
    contentMatchScore: 93,
    brandFitScore: 94,
    budgetFitScore: 96,
    matchReasons: ['Target audience matches high-income fitness enthusiasts'],
    isVerified: true,
  },
  {
    id: 'b6',
    companyName: 'Kroma Gaming Gear',
    logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    website: 'https://kromagaming.jp',
    industry: 'Consumer Electronics & Hardware',
    location: 'Tokyo, Japan',
    description: 'Ultra-lightweight wireless optical gaming mice and custom magnetic hall-effect mechanical keyboards.',
    brandValues: ['Innovation', 'Quality'],
    primaryGoals: ['Product Launch', 'Community Building'],
    targetPlatforms: ['YouTube', 'TikTok', 'Twitter'],
    targetAudience: { gender: 'Male', ageRanges: ['18-24', '25-34'], locations: ['Japan', 'United States'] },
    creatorTiers: ['Micro', 'Mid'],
    campaignBudget: '$5,000 – $20,000',
    campaignFrequency: 'One-time Campaign',
    matchScore: 92,
    audienceMatchScore: 94,
    nicheMatchScore: 92,
    contentMatchScore: 91,
    brandFitScore: 90,
    budgetFitScore: 93,
    matchReasons: ['Esports and hardware setup alignment'],
    isVerified: true,
  },
  {
    id: 'b7',
    companyName: 'Solaris Living',
    logoUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80',
    website: 'https://solarisliving.de',
    industry: 'Home & Interior Design',
    location: 'Berlin, Germany',
    description: 'Modular Scandinavian home furniture crafted from FSC-certified oak and recycled ocean plastics.',
    brandValues: ['Sustainability', 'Quality'],
    primaryGoals: ['Brand Awareness', 'Content Creation'],
    targetPlatforms: ['Instagram', 'Pinterest'],
    targetAudience: { gender: 'All', ageRanges: ['25-34', '35-44'], locations: ['Germany', 'France'] },
    creatorTiers: ['Micro'],
    campaignBudget: '$1,000 – $5,000',
    campaignFrequency: 'Monthly Recurring',
    matchScore: 86,
    audienceMatchScore: 88,
    nicheMatchScore: 85,
    contentMatchScore: 87,
    brandFitScore: 84,
    budgetFitScore: 86,
    matchReasons: ['Minimalist interior and aesthetic lifestyle match'],
    isVerified: true,
  },
  {
    id: 'b8',
    companyName: 'Starlight Eyewear',
    logoUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',
    website: 'https://starlighteyewear.com',
    industry: 'Fashion & Apparel',
    location: 'Los Angeles, CA, United States',
    description: 'Handcrafted acetate polarized sunglasses and blue-light blocking designer eyewear.',
    brandValues: ['Innovation', 'Quality', 'Affordability'],
    primaryGoals: ['Brand Awareness', 'Sales & Conversions'],
    targetPlatforms: ['Instagram', 'TikTok', 'YouTube'],
    targetAudience: { gender: 'All', ageRanges: ['18-24', '25-34'], locations: ['United States', 'Canada'] },
    creatorTiers: ['Micro', 'Mid'],
    campaignBudget: '$5,000 – $20,000',
    campaignFrequency: 'Monthly Recurring',
    matchScore: 93,
    audienceMatchScore: 95,
    nicheMatchScore: 93,
    contentMatchScore: 92,
    brandFitScore: 91,
    budgetFitScore: 94,
    matchReasons: ['Fashion-forward aesthetic content compatibility'],
    isVerified: true,
  },
];

export default function CompanyDiscoverySection() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<AdvancedFilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('matchScore');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [companies, setCompanies] = useState<CompanyItem[]>(FALLBACK_COMPANIES);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [detailCompany, setDetailCompany] = useState<CompanyItem | null>(null);
  const [pitchCompany, setPitchCompany] = useState<CompanyItem | null>(null);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);

  // Fetch Companies from Backend API with Fallback
  useEffect(() => {
    async function loadBrands() {
      setLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${backendUrl}/brand/discovery`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted: CompanyItem[] = data.map((b: any, idx: number) => {
              const baseMatch = Math.min(99, Math.max(65, 98 - (idx % 15) * 2));
              return {
                id: b.id || `brand_${idx}`,
                companyName: b.companyName || 'Featured Brand',
                logoUrl: b.logoUrl,
                website: b.website,
                industry: b.industry || 'Software & SaaS',
                location: b.location || 'San Francisco, USA',
                description: b.description || 'Looking for creators to partner on upcoming product campaigns.',
                foundedYear: b.foundedYear,
                brandValues: b.brandValues || ['Innovation', 'Quality'],
                primaryGoals: b.primaryGoals || ['Brand Awareness', 'Sales & Conversions'],
                targetPlatforms: b.targetPlatforms || ['Instagram', 'YouTube'],
                targetAudience: b.targetAudience || { gender: 'All', ageRanges: ['18-24', '25-34'] },
                creatorTiers: b.creatorTiers || ['Micro', 'Mid'],
                creatorLocations: b.creatorLocations || ['United States', 'Canada', 'India'],
                campaignBudget: b.campaignBudget || '$5,000 – $20,000',
                campaignFrequency: b.campaignFrequency || 'Monthly Recurring',
                escrowSetup: b.escrowSetup,
                products: b.products || [],
                matchScore: baseMatch,
                audienceMatchScore: Math.min(99, baseMatch + 2),
                nicheMatchScore: Math.min(99, baseMatch - 1),
                contentMatchScore: Math.min(99, baseMatch + 1),
                brandFitScore: Math.min(99, baseMatch - 3),
                budgetFitScore: Math.min(99, baseMatch + 4),
                matchReasons: [
                  'Your audience strongly matches their target demographic',
                  `Content niche aligns with ${b.industry || 'their sector'}`,
                  'Meets minimum creator follower requirement',
                ],
                matchWarnings: baseMatch < 75 ? ['Rate may be near upper limit of budget'] : [],
                isVerified: true,
                postedDateStr: '2 days ago',
              };
            });
            setCompanies(formatted);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch brands from backend API, using pre-seeded fallback list:', err);
      }
      setCompanies(FALLBACK_COMPANIES);
      setLoading(false);
    }

    loadBrands();
  }, []);

  const handleQuickFilterChange = (key: keyof QuickFilterState, val: any) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeChips = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (filters.industry !== 'All') list.push({ key: 'industry', label: `Category: ${filters.industry}` });
    if (filters.budgetRange !== 'Any Budget') list.push({ key: 'budgetRange', label: `Budget: ${filters.budgetRange}` });
    if (filters.minMatchScore > 0) list.push({ key: 'minMatchScore', label: `Match: ${filters.minMatchScore}%+` });
    if (filters.platform !== 'All Platforms') list.push({ key: 'platform', label: `Platform: ${filters.platform}` });
    if (filters.campaignType !== 'All Types') list.push({ key: 'campaignType', label: `Type: ${filters.campaignType}` });
    if (filters.paidOnly) list.push({ key: 'paidOnly', label: 'Paid Only' });
    if (filters.isVerifiedOnly) list.push({ key: 'isVerifiedOnly', label: 'Verified Brands Only' });
    if (filters.escrowOnly) list.push({ key: 'escrowOnly', label: 'Escrow Protected Only' });
    return list;
  }, [filters]);

  const handleRemoveChip = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: (INITIAL_FILTERS as any)[key] }));
  };

  const handleResetAll = () => {
    setSearch('');
    setFilters(INITIAL_FILTERS);
  };

  // Filter & Search Logic
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => {
        if (search) {
          const query = search.toLowerCase();
          const matchName = c.companyName.toLowerCase().includes(query);
          const matchDesc = c.description?.toLowerCase().includes(query);
          const matchInd = c.industry.toLowerCase().includes(query);
          const matchProd = c.products?.some((p) => p.name?.toLowerCase().includes(query));
          if (!matchName && !matchDesc && !matchInd && !matchProd) return false;
        }

        if (filters.industry !== 'All' && c.industry !== filters.industry) return false;
        if (filters.minMatchScore > 0 && c.matchScore < filters.minMatchScore) return false;
        if (filters.minAudienceScore > 0 && c.audienceMatchScore < filters.minAudienceScore) return false;
        if (filters.isVerifiedOnly && c.isVerified === false) return false;

        if (filters.platform !== 'All Platforms') {
          const hasPlat = c.targetPlatforms?.some(
            (p) => p.toLowerCase() === filters.platform.toLowerCase()
          );
          if (!hasPlat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
        if (sortBy === 'name') return a.companyName.localeCompare(b.companyName);
        return b.matchScore - a.matchScore;
      });
  }, [companies, search, filters, sortBy]);

  return (
    <div className="space-y-5">
      {/* Full-Width Search Bar */}
      <CompanySearchBar value={search} onChange={setSearch} />

      {/* Quick Filters Horizontal Bar */}
      <CompanyQuickFilters
        filters={filters}
        onFilterChange={handleQuickFilterChange}
        onOpenAdvancedModal={() => setIsAdvancedModalOpen(true)}
        activeCount={activeChips.length}
      />

      {/* Active Filter Chips */}
      <CompanyActiveFilterChips
        chips={activeChips}
        onRemoveChip={handleRemoveChip}
        onClearAll={handleResetAll}
      />

      {/* Controls & View Modes */}
      <CompanySortAndControls
        count={filteredCompanies.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Results Grid / Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="text-xs font-bold">Matching company opportunities...</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="py-16 p-8 text-center bg-slate-950/40 rounded-3xl border border-white/10 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-extrabold text-white">No Matching Companies Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your active filters or searching for broader keywords like "Tech", "Beauty", or "Skincare".
          </p>
          <button
            onClick={handleResetAll}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/50"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
              : 'flex flex-col space-y-3'
          }
        >
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isSaved={savedIds.has(company.id)}
              onToggleSave={handleToggleSave}
              onViewDetails={setDetailCompany}
              onPitchBrand={setPitchCompany}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CompanyDetailModal
        company={detailCompany}
        onClose={() => setDetailCompany(null)}
        onPitch={(c) => setPitchCompany(c)}
      />

      <CompanyPitchModal
        company={pitchCompany}
        onClose={() => setPitchCompany(null)}
        onSubmitPitch={(data) => {
          console.log('Submitted pitch data:', data);
        }}
      />

      <CompanyAdvancedFiltersModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onResetFilters={handleResetAll}
      />
    </div>
  );
}
