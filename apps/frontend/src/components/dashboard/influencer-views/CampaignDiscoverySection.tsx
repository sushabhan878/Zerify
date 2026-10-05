'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CampaignSearchBar from './campaign-discovery/CampaignSearchBar';
import CampaignQuickFilters, {
  CampaignQuickFilterState,
} from './campaign-discovery/CampaignQuickFilters';
import CampaignActiveFilterChips from './campaign-discovery/CampaignActiveFilterChips';
import CampaignSortAndControls from './campaign-discovery/CampaignSortAndControls';
import CampaignCard, { CampaignItem } from './campaign-discovery/CampaignCard';
import CampaignDetailView from './campaign-discovery/CampaignDetailView';
import CampaignPitchModal from './campaign-discovery/CampaignPitchModal';
import CampaignAdvancedFiltersModal, {
  CampaignAdvancedFilterState,
} from './campaign-discovery/CampaignAdvancedFiltersModal';
import CampaignPagination from './campaign-discovery/CampaignPagination';
import LottieLoader from '@/components/ui/LottieLoader';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { CampaignService } from '@/services/campaign.service';
import { ApplicationService } from '@/services/application.service';
import { ALL_INDUSTRIES_GROUPED } from '@/constants/categories';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

const INITIAL_FILTERS: CampaignAdvancedFilterState = {
  category: 'All',
  deliverableType: 'All Types',
  payoutModel: 'All Payouts',
  budgetRange: 'Any Budget',
  platform: 'All Platforms',
  creatorTier: 'All',
  minMatchScore: 0,
  isVerifiedOnly: false,
  isEscrowOnly: false,
};

function parseBudgetNumeric(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/,/g, '');
  const match = clean.match(/[0-9]+/);
  return match ? parseInt(match[0], 10) : 0;
}

function parseCampaignBounds(budgetStr?: string): [number, number] {
  if (!budgetStr) return [0, Infinity];
  const cleaned = budgetStr.replace(/,/g, '').trim();

  if (cleaned.includes('+')) {
    const match = cleaned.match(/\d+/);
    const val = match ? Number(match[0]) : 0;
    return [val, Infinity];
  }

  const nums = cleaned.match(/\d+/g)?.map(Number) || [];
  if (nums.length === 0) return [0, Infinity];
  if (nums.length === 1) {
    if (cleaned.toLowerCase().includes('under') || cleaned.toLowerCase().includes('<')) {
      return [0, nums[0]];
    }
    return [nums[0], nums[0]];
  }

  return [Math.min(nums[0], nums[1]), Math.max(nums[0], nums[1])];
}

function matchesCampaignBudget(payoutStr: string, filterRange: string): boolean {
  if (!filterRange || filterRange === 'Any Budget') return true;
  if (!payoutStr) return true;

  const [campMin, campMax] = parseCampaignBounds(payoutStr);
  const campMid = (campMin + (campMax === Infinity ? campMin : campMax)) / 2;

  switch (filterRange) {
    // USD
    case 'Under $500':
      return campMin < 500 || campMax <= 500 || campMid <= 500;
    case '$500 - $1K':
      return (campMin >= 400 && campMax <= 1200) || (campMid >= 500 && campMid <= 1000);
    case '$1K - $3K':
      return (campMin >= 900 && campMax <= 3500) || (campMid >= 1000 && campMid <= 3000);
    case '$3K - $5K':
      return (campMin >= 2500 && campMax <= 5500) || (campMid >= 3000 && campMid <= 5000);
    case '$5K - $10K':
      return (campMin >= 4500 && campMax <= 11000) || (campMid >= 5000 && campMid <= 10000);
    case '$10K - $25K':
      return (campMin >= 9000 && campMax <= 26000) || (campMid >= 10000 && campMid <= 25000);
    case '$25K+':
      return campMax >= 25000 || campMin >= 25000;

    // INR
    case 'Under ₹50,000':
      return campMin < 50000 || campMax <= 50000 || campMid <= 50000;
    case '₹50,000 - ₹2,00,000':
      return (campMin >= 40000 && campMax <= 250000) || (campMid >= 50000 && campMid <= 200000);
    case '₹2,00,000 - ₹5,00,000':
      return (campMin >= 180000 && campMax <= 600000) || (campMid >= 200000 && campMid <= 500000);
    case '₹5,00,000 - ₹10,00,000':
      return (campMin >= 450000 && campMax <= 1200000) || (campMid >= 500000 && campMid <= 1000000);
    case '₹10,00,000 - ₹25,00,000':
      return (campMin >= 900000 && campMax <= 3000000) || (campMid >= 1000000 && campMid <= 2500000);
    case '₹25,00,000+':
      return campMax >= 2500000 || campMin >= 2500000;

    default:
      return true;
  }
}

function normalizePlatform(p: string): 'Instagram' | 'YouTube' | 'TikTok' | 'LinkedIn' | 'Twitter' {
  const upper = (p || '').toUpperCase();
  if (upper.includes('INSTA')) return 'Instagram';
  if (upper.includes('YOU')) return 'YouTube';
  if (upper.includes('TIK')) return 'TikTok';
  if (upper.includes('LINK')) return 'LinkedIn';
  if (upper.includes('TWIT') || upper === 'X') return 'Twitter';
  return 'Instagram';
}

function mapDbCampaignToItem(c: any, userCurrency = 'INR'): CampaignItem {
  const currencyCode = c.budgetCurrency || userCurrency || 'INR';
  const sym = getCurrencySymbol(currencyCode);

  let payoutAmount = 'Flexible / Negotiable';
  if (c.budgetPaymentModel === 'BARTER') {
    payoutAmount = `Product Barter (${sym}0 Escrow)`;
  } else if (c.budgetTotalAmount) {
    payoutAmount = formatCurrency(c.budgetTotalAmount, currencyCode);
  } else if (c.budgetMinPerInfluencer && c.budgetMaxPerInfluencer) {
    if (Number(c.budgetMinPerInfluencer) === Number(c.budgetMaxPerInfluencer)) {
      payoutAmount = formatCurrency(c.budgetMinPerInfluencer, currencyCode);
    } else {
      payoutAmount = `${formatCurrency(c.budgetMinPerInfluencer, currencyCode)} – ${formatCurrency(c.budgetMaxPerInfluencer, currencyCode)}`;
    }
  } else if (c.budgetMinPerInfluencer || c.budgetMaxPerInfluencer) {
    payoutAmount = formatCurrency(c.budgetMinPerInfluencer || c.budgetMaxPerInfluencer, currencyCode);
  }

  let payoutModel: 'Fixed Fee' | 'Paid + Commission' | 'Product Barter' = 'Fixed Fee';
  if (c.budgetPaymentModel === 'BARTER') {
    payoutModel = 'Product Barter';
  } else if (c.budgetPaymentModel === 'PERFORMANCE_BASED' || c.budgetPaymentModel === 'COMMISSION' || c.budgetPaymentModel === 'HYBRID') {
    payoutModel = 'Paid + Commission';
  }

  const rawPlatforms = Array.isArray(c.platforms) && c.platforms.length > 0
    ? c.platforms
    : ['INSTAGRAM'];
  const targetPlatforms = rawPlatforms.map(normalizePlatform);

  const product = c.product || {};
  const req = c.requirement || c.requirements || {};
  const guidelines = typeof c.contentGuidelines === 'object' && c.contentGuidelines !== null
    ? c.contentGuidelines
    : {};

  // Formulate requirements list
  const requirementsList: string[] = [];
  if (req.minFollowers) {
    requirementsList.push(`Min ${Number(req.minFollowers).toLocaleString()}+ active followers`);
  }
  if (req.minEngagementRate) {
    requirementsList.push(`Min ${req.minEngagementRate}% engagement rate`);
  }
  if (req.verifiedOnly) {
    requirementsList.push('Verified creators with authentic badges only');
  }
  if (Array.isArray(req.targetCountries) && req.targetCountries.length > 0) {
    requirementsList.push(`Target regions: ${req.targetCountries.join(', ')}`);
  }
  if (Array.isArray(req.targetAgeGroup) && req.targetAgeGroup.length > 0) {
    requirementsList.push(`Audience age: ${req.targetAgeGroup.join(', ')}`);
  }
  if (requirementsList.length === 0) {
    requirementsList.push('Open to all qualified content creators', 'High-quality audio/video production');
  }

  // Calculate deadline and remaining days
  let deadlineStr = 'Rolling Deadline';
  let daysRemaining = 30;
  if (c.applicationDeadline) {
    const deadlineDate = new Date(c.applicationDeadline);
    deadlineStr = deadlineDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  // Industry / Category tag (prioritize actual industry/category over objective)
  const categoryName =
    c.industry ||
    c.brandProfile?.industry ||
    (Array.isArray(c.categories) && c.categories.length > 0 ? c.categories[0] : null) ||
    'Tech & SaaS';

  return {
    id: c.id,
    title: c.title,
    brandName: c.brandProfile?.companyName || 'Verified Brand',
    brandLogo: c.brandProfile?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    category: categoryName,
    industry: c.industry || c.brandProfile?.industry || 'Technology & Creator Economy',
    coverImage: c.coverImageUrl || product.coverImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    description: c.description || 'Exclusive brand sponsorship and creator collaboration brief.',
    payoutAmount,
    payoutModel,
    hasFreeProduct: Boolean(product.hasFreeProduct || c.hasFreeProduct),
    freeProductValue: product.freeProductValue
      ? `${sym}${Number(product.freeProductValue).toLocaleString()} Product Sample`
      : product.productName
        ? `${product.productName} Sample`
        : undefined,
    deliverables: Array.isArray(c.deliverables) && c.deliverables.length > 0
      ? c.deliverables.map((d: any) => `${d.quantity || 1}x ${d.type || 'Deliverable'}`)
      : ['1x Sponsored Video / Post'],
    rawDeliverables: c.deliverables || [],
    productDetails: product,
    requirementDetails: req,
    applicationsCount: c._count?.applications || 0,
    brandLocation: c.brandProfile?.location || '',
    targetPlatforms,
    creatorTiers: ['Micro', 'Mid', 'Macro'],
    slotsTotal: c.targetParticipants || c.maxParticipants || 3,
    slotsFilled: c._count?.participants || 0,
    deadline: deadlineStr,
    daysRemaining,
    matchScore: c.matchScore || 95,
    audienceMatchScore: Math.min(99, (c.matchScore || 95) + 2),
    nicheMatchScore: Math.max(85, (c.matchScore || 95) - 1),
    isVerifiedBrand: true,
    isEscrowGuaranteed: true,
    requirements: requirementsList,
    dos: Array.isArray(guidelines.dos) && guidelines.dos.length > 0
      ? guidelines.dos
      : guidelines.requiredCtas?.length
        ? [`Include required CTA: ${guidelines.requiredCtas.join(', ')}`, 'Deliver original creative content']
        : ['Deliver original creative content', 'Demonstrate authentic product experience'],
    donts: Array.isArray(guidelines.donts) && guidelines.donts.length > 0
      ? guidelines.donts
      : ['No low-quality audio or video', 'No undisclosed sponsorships or artificial engagement'],
    moodboardImages: guidelines.moodboardUrl ? [guidelines.moodboardUrl] : [],
  };
}

export default function CampaignDiscoverySection() {
  const { currency: userCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilters, setQuickFilters] = useState<CampaignQuickFilterState>({
    category: 'All',
    budgetRange: 'Any Budget',
    minMatchScore: 0,
    platform: 'All Platforms',
    campaignType: 'All Types',
  });
  const [advancedFilters, setAdvancedFilters] = useState<CampaignAdvancedFilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<string>('matchScore');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [selectedCampaignForDetail, setSelectedCampaignForDetail] = useState<CampaignItem | null>(null);
  const [selectedCampaignForPitch, setSelectedCampaignForPitch] = useState<CampaignItem | null>(null);
  const [campaignsList, setCampaignsList] = useState<CampaignItem[]>([]);
  const [appliedCampaignsMap, setAppliedCampaignsMap] = useState<Record<string, string>>({});

  // Saved campaigns state with local storage persistence
  const [savedCampaignIds, setSavedCampaignIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zerify_saved_campaigns');
        if (saved) return new Set(JSON.parse(saved));
      } catch (e) {}
    }
    return new Set();
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const handleToggleSaveCampaign = useCallback((id: string) => {
    setSavedCampaignIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('zerify_saved_campaigns', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  }, []);

  // Fetch live campaigns and creator's active applications from backend API
  const fetchCampaigns = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [resResult, myAppsResult] = await Promise.allSettled([
        CampaignService.discoverCampaigns({
          limit: 100,
          search: searchQuery.trim() || undefined,
          category: quickFilters.category !== 'All' ? quickFilters.category : undefined,
          platform: quickFilters.platform !== 'All Platforms' ? quickFilters.platform : undefined,
        }),
        ApplicationService.getMyApplications(),
      ]);

      const myAppsMap: Record<string, string> = {};
      if (myAppsResult.status === 'fulfilled' && Array.isArray(myAppsResult.value)) {
        myAppsResult.value.forEach((app: any) => {
          if (app.campaignId) {
            myAppsMap[app.campaignId] = app.status || 'APPLIED';
          }
        });
      }

      setAppliedCampaignsMap((prev) => ({ ...prev, ...myAppsMap }));

      if (resResult.status === 'fulfilled' && resResult.value?.campaigns && Array.isArray(resResult.value.campaigns)) {
        const formatted: CampaignItem[] = resResult.value.campaigns.map((c: any) => {
          const item = mapDbCampaignToItem(c, userCurrency);
          if (myAppsMap[c.id]) {
            item.isApplied = true;
            item.applicationStatus = myAppsMap[c.id];
          }
          return item;
        });
        setCampaignsList(formatted);
      } else {
        setCampaignsList([]);
      }
    } catch (err) {
      console.error('Failed to fetch discovery campaigns from DB:', err);
      setCampaignsList([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, quickFilters, userCurrency]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handlePitchSuccess = (campaignId?: string) => {
    const id = campaignId || selectedCampaignForPitch?.id;
    if (id) {
      setAppliedCampaignsMap((prev) => ({ ...prev, [id]: 'APPLIED' }));
      setCampaignsList((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isApplied: true, applicationStatus: 'APPLIED' } : c
        )
      );
      if (selectedCampaignForDetail && selectedCampaignForDetail.id === id) {
        setSelectedCampaignForDetail((prev) =>
          prev ? { ...prev, isApplied: true, applicationStatus: 'APPLIED' } : null
        );
      }
    }
    fetchCampaigns(true);
  };

  const handleQuickFilterChange = (key: keyof CampaignQuickFilterState, val: any) => {
    setQuickFilters((prev) => ({ ...prev, [key]: val }));
    setAdvancedFilters((prev) => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  };

  const handleApplyAdvancedFilters = (newFilters: CampaignAdvancedFilterState) => {
    setAdvancedFilters(newFilters);
    setQuickFilters({
      category: newFilters.category,
      budgetRange: newFilters.budgetRange,
      minMatchScore: newFilters.minMatchScore,
      platform: newFilters.platform,
      campaignType: newFilters.deliverableType,
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setQuickFilters({
      category: 'All',
      budgetRange: 'Any Budget',
      minMatchScore: 0,
      platform: 'All Platforms',
      campaignType: 'All Types',
    });
    setAdvancedFilters(INITIAL_FILTERS);
    setShowSavedOnly(false);
    setCurrentPage(1);
  };

  // Filter Pipeline for live DB campaigns
  const filteredCampaigns = useMemo(() => {
    return campaignsList.filter((c: CampaignItem) => {
      // 0. Saved Only Filter
      if (showSavedOnly && !savedCampaignIds.has(c.id)) {
        return false;
      }

      // 1. Search Query Client Filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesBrand = c.brandName.toLowerCase().includes(q);
        const matchesCat = c.category.toLowerCase().includes(q);
        const matchesIndustry = c.industry.toLowerCase().includes(q);
        const matchesDel = c.deliverables.some((d: string) => d.toLowerCase().includes(q));
        if (!matchesTitle && !matchesBrand && !matchesCat && !matchesIndustry && !matchesDel) return false;
      }

      // 2. Category / Objective
      if (quickFilters.category !== 'All') {
        const catLower = quickFilters.category.toLowerCase().trim();
        const group = ALL_INDUSTRIES_GROUPED.find(
          (g) => g.category.toLowerCase().trim() === catLower || g.slug === catLower
        );
        const subItems = group ? group.items.map((i) => i.toLowerCase().trim()) : [];

        const campCatLower = (c.category || '').toLowerCase().trim();
        const campIndLower = (c.industry || '').toLowerCase().trim();

        const matchesDirect =
          campCatLower.includes(catLower) ||
          catLower.includes(campCatLower) ||
          campIndLower.includes(catLower) ||
          catLower.includes(campIndLower);

        const matchesGroup = subItems.some(
          (sub) =>
            campCatLower.includes(sub) ||
            sub.includes(campCatLower) ||
            campIndLower.includes(sub) ||
            sub.includes(campIndLower)
        );

        if (!matchesDirect && !matchesGroup) return false;
      }

      // 3. Deliverable / Campaign Type
      if (quickFilters.campaignType !== 'All Types' && quickFilters.campaignType !== 'All') {
        const hasDel = c.deliverables.some((d: string) =>
          d.toLowerCase().includes(quickFilters.campaignType.toLowerCase())
        );
        if (!hasDel) return false;
      }

      // 4. Platform Filter
      if (quickFilters.platform !== 'All Platforms' && quickFilters.platform !== 'All') {
        const targetP = quickFilters.platform.toLowerCase().trim();
        const hasPlatform = c.targetPlatforms.some((p: string) => {
          const pLower = p.toLowerCase().trim();
          return (
            pLower === targetP ||
            (targetP.includes('insta') && pLower.includes('insta')) ||
            (targetP.includes('you') && pLower.includes('you')) ||
            (targetP.includes('tik') && pLower.includes('tik')) ||
            (targetP.includes('link') && pLower.includes('link')) ||
            ((targetP.includes('twit') || targetP === 'x') && (pLower.includes('twit') || pLower === 'x'))
          );
        });
        if (!hasPlatform) return false;
      }

      // 5. Budget Range Filter
      if (quickFilters.budgetRange !== 'Any Budget') {
        const matches = matchesCampaignBudget(c.payoutAmount, quickFilters.budgetRange);
        if (!matches) return false;
      }

      // 6. Minimum Match Score
      if (quickFilters.minMatchScore > 0 && c.matchScore < quickFilters.minMatchScore) {
        return false;
      }

      // 7. Verified Brand
      if (advancedFilters.isVerifiedOnly && !c.isVerifiedBrand) return false;

      // 8. Escrow Only
      if (advancedFilters.isEscrowOnly && !c.isEscrowGuaranteed) return false;

      return true;
    });
  }, [campaignsList, searchQuery, quickFilters, advancedFilters, showSavedOnly, savedCampaignIds]);

  // Sort Pipeline
  const sortedCampaigns = useMemo(() => {
    const list = [...filteredCampaigns];
    switch (sortBy) {
      case 'highestBudget':
        return list.sort((a, b) => parseBudgetNumeric(b.payoutAmount) - parseBudgetNumeric(a.payoutAmount));
      case 'lowestBudget':
        return list.sort((a, b) => parseBudgetNumeric(a.payoutAmount) - parseBudgetNumeric(b.payoutAmount));
      case 'newest':
        return list.sort((a, b) => b.daysRemaining - a.daysRemaining);
      case 'endingSoon':
        return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
      case 'matchScore':
      default:
        return list.sort((a, b) => b.matchScore - a.matchScore);
    }
  }, [filteredCampaigns, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedCampaigns.length / pageSize) || 1;
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCampaigns.slice(start, start + pageSize);
  }, [sortedCampaigns, currentPage, pageSize]);

  // Active Filter Chips
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (showSavedOnly) {
      chips.push({ key: 'showSavedOnly', label: 'Saved Campaigns Only' });
    }
    if (quickFilters.category !== 'All') {
      chips.push({ key: 'category', label: `Category: ${quickFilters.category}` });
    }
    if (quickFilters.budgetRange !== 'Any Budget') {
      chips.push({ key: 'budgetRange', label: `Budget: ${quickFilters.budgetRange}` });
    }
    if (quickFilters.minMatchScore > 0) {
      chips.push({ key: 'minMatchScore', label: `Min ${quickFilters.minMatchScore}% Match` });
    }
    if (quickFilters.platform !== 'All Platforms') {
      chips.push({ key: 'platform', label: `Platform: ${quickFilters.platform}` });
    }
    if (quickFilters.campaignType !== 'All Types') {
      chips.push({ key: 'campaignType', label: `Type: ${quickFilters.campaignType}` });
    }
    if (advancedFilters.isVerifiedOnly) {
      chips.push({ key: 'isVerifiedOnly', label: 'Verified Brands Only' });
    }
    if (advancedFilters.isEscrowOnly) {
      chips.push({ key: 'isEscrowOnly', label: 'Escrow Protected Only' });
    }
    return chips;
  }, [quickFilters, advancedFilters, showSavedOnly]);

  const handleRemoveChip = (key: string) => {
    if (key === 'showSavedOnly') setShowSavedOnly(false);
    if (key === 'category') handleQuickFilterChange('category', 'All');
    if (key === 'budgetRange') handleQuickFilterChange('budgetRange', 'Any Budget');
    if (key === 'minMatchScore') handleQuickFilterChange('minMatchScore', 0);
    if (key === 'platform') handleQuickFilterChange('platform', 'All Platforms');
    if (key === 'campaignType') handleQuickFilterChange('campaignType', 'All Types');
    if (key === 'isVerifiedOnly') setAdvancedFilters((prev) => ({ ...prev, isVerifiedOnly: false }));
    if (key === 'isEscrowOnly') setAdvancedFilters((prev) => ({ ...prev, isEscrowOnly: false }));
  };

  // If viewing a detailed campaign brief screen
  if (selectedCampaignForDetail) {
    return (
      <div className="space-y-4">
        <CampaignDetailView
          campaign={selectedCampaignForDetail}
          isSaved={savedCampaignIds.has(selectedCampaignForDetail.id)}
          onToggleSave={handleToggleSaveCampaign}
          onBack={() => {
            setSelectedCampaignForDetail(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onApply={(camp) => {
            setSelectedCampaignForPitch(camp);
          }}
        />

        <CampaignPitchModal
          isOpen={Boolean(selectedCampaignForPitch)}
          onClose={() => setSelectedCampaignForPitch(null)}
          campaign={selectedCampaignForPitch}
          onSuccess={() => {
            fetchCampaigns(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Full-Width Search Input */}
      <CampaignSearchBar
        value={searchQuery}
        onChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
      />

      {/* 2. Dropdown Filter Pills & All Filters Button */}
      <CampaignQuickFilters
        filters={quickFilters}
        onFilterChange={handleQuickFilterChange}
        onOpenAdvancedModal={() => setIsFiltersModalOpen(true)}
        activeCount={activeChips.length}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={() => {
          setShowSavedOnly((prev) => !prev);
          setCurrentPage(1);
        }}
        savedCount={savedCampaignIds.size}
      />

      {/* 3. Active Filter Chips (if any) */}
      <CampaignActiveFilterChips
        chips={activeChips}
        onRemoveChip={handleRemoveChip}
        onResetAll={handleResetFilters}
      />

      {/* 4. Controls Bar: Showing count, Refresh Action, Sort Dropdown & Grid/List Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <CampaignSortAndControls
            count={filteredCampaigns.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        <button
          type="button"
          onClick={() => fetchCampaigns(true)}
          disabled={isLoading || isRefreshing}
          className="self-end sm:self-auto px-3.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/25 text-purple-200 hover:text-white hover:bg-purple-900/50 hover:border-purple-400/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-300' : ''}`} />
          <span>Refresh Live</span>
        </button>
      </div>

      {/* 5. Grid of Live Campaign Cards */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center min-h-[380px]">
          <LottieLoader size={200} message="Discovering live campaigns from verified brands..." />
        </div>
      ) : paginatedCampaigns.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-950/60 border border-purple-500/20 text-center space-y-4 flex flex-col items-center justify-center min-h-[340px] backdrop-blur-2xl shadow-xl shadow-purple-950/20">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-bold text-white">
              {showSavedOnly ? 'No saved campaigns found' : 'No campaigns found'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {showSavedOnly
                ? "You haven't saved any campaigns yet or none matched your active filters. Click the bookmark icon on any campaign card to save it for quick access!"
                : campaignsList.length === 0
                ? 'No open campaign briefs are currently published by brands in the database. When brands publish campaigns, they will appear here instantly in real-time!'
                : 'No active sponsorship briefs matched your current search filters.'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            {showSavedOnly ? (
              <button
                onClick={() => {
                  setShowSavedOnly(false);
                  setCurrentPage(1);
                }}
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Browse all campaigns
              </button>
            ) : (
              <button
                onClick={handleResetFilters}
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Reset all filters
              </button>
            )}
            <button
              onClick={() => fetchCampaigns(true)}
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/20 text-slate-300 hover:text-white hover:border-purple-400/40 text-xs font-semibold transition-all"
            >
              Check database again
            </button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6'
              : 'space-y-4'
          }
        >
          {paginatedCampaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              isSaved={savedCampaignIds.has(camp.id)}
              onToggleSave={handleToggleSaveCampaign}
              onViewBrief={(item) => {
                setSelectedCampaignForDetail(item);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onApply={(item) => setSelectedCampaignForPitch(item)}
            />
          ))}
        </div>
      )}

      {/* 6. Pagination */}
      {!isLoading && paginatedCampaigns.length > 0 && (
        <CampaignPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCampaigns.length}
          pageSize={pageSize}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* 7. Modals */}
      <CampaignAdvancedFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={advancedFilters}
        onApplyFilters={handleApplyAdvancedFilters}
        onResetFilters={handleResetFilters}
      />

      <CampaignPitchModal
        isOpen={Boolean(selectedCampaignForPitch)}
        onClose={() => setSelectedCampaignForPitch(null)}
        campaign={selectedCampaignForPitch}
        onSuccess={() => {
          handlePitchSuccess(selectedCampaignForPitch?.id);
        }}
      />
    </div>
  );
}
