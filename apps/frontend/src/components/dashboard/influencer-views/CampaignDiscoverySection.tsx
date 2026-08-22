'use client';

import React, { useState, useEffect, useMemo } from 'react';
import CampaignSearchBar from './campaign-discovery/CampaignSearchBar';
import CampaignQuickFilters, {
  CampaignQuickFilterState,
} from './campaign-discovery/CampaignQuickFilters';
import CampaignActiveFilterChips from './campaign-discovery/CampaignActiveFilterChips';
import CampaignSortAndControls from './campaign-discovery/CampaignSortAndControls';
import CampaignCard, { CampaignItem } from './campaign-discovery/CampaignCard';
import CampaignDetailModal from './campaign-discovery/CampaignDetailModal';
import CampaignPitchModal from './campaign-discovery/CampaignPitchModal';
import CampaignAdvancedFiltersModal, {
  CampaignAdvancedFilterState,
} from './campaign-discovery/CampaignAdvancedFiltersModal';
import CampaignPagination from './campaign-discovery/CampaignPagination';
import CampaignLoadingSkeleton from './campaign-discovery/CampaignLoadingSkeleton';
import { AlertCircle } from 'lucide-react';

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

const SAMPLE_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp-1',
    title: 'Next-Gen AI Workspace Launch — Developer & Creator Review Series',
    brandName: 'Aetheria Tech Labs',
    brandLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    category: 'Tech & AI',
    industry: 'Software & SaaS',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    description: 'Looking for tech, SaaS and developer creators to showcase how our AI workflow engine cuts 10+ hours per week of repetitive engineering and content creation work.',
    payoutAmount: '$3,500 – $6,000',
    payoutModel: 'Fixed Fee',
    hasFreeProduct: true,
    freeProductValue: '$1,200/yr Enterprise License',
    deliverables: ['1x Dedicated YouTube Video (8-12 mins)', '2x YouTube Shorts / IG Reels'],
    targetPlatforms: ['YouTube', 'LinkedIn', 'Twitter'],
    creatorTiers: ['Mid', 'Macro'],
    slotsTotal: 8,
    slotsFilled: 5,
    deadline: 'Aug 30, 2026',
    daysRemaining: 10,
    matchScore: 98,
    audienceMatchScore: 99,
    nicheMatchScore: 97,
    isVerifiedBrand: true,
    isEscrowGuaranteed: true,
    requirements: ['Minimum 20k tech/dev followers', 'High engagement in US/EU/IN', 'Original testing demo footage'],
    dos: ['Walk through real workflow before/after', 'Highlight speed comparison', 'Include special affiliate discount link in bio/description'],
    donts: ['Do not use robotic synthetic voiceovers', 'No generic feature list reading without live UI interaction'],
  },
  {
    id: 'camp-2',
    title: '30-Day Botanical Skincare Transformation Reel & Story Takeover',
    brandName: 'GlowBotanica Organics',
    brandLogo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    category: 'Beauty & Skincare',
    industry: 'Beauty & Personal Care',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    description: 'Document your honest 30-day glow journey using our cold-pressed alpine barrier repair serum. Highlighting 100% vegan certified clean beauty ingredients.',
    payoutAmount: '$2,000 – $4,500',
    payoutModel: 'Paid + Commission',
    hasFreeProduct: true,
    freeProductValue: '$280 Skincare Bundle',
    deliverables: ['1x Instagram Reel (45-60s)', '3x Story Frames with Custom Promo Code'],
    targetPlatforms: ['Instagram', 'TikTok'],
    creatorTiers: ['Micro', 'Mid'],
    slotsTotal: 12,
    slotsFilled: 7,
    deadline: 'Sep 05, 2026',
    daysRemaining: 16,
    matchScore: 96,
    audienceMatchScore: 98,
    nicheMatchScore: 95,
    isVerifiedBrand: true,
    isEscrowGuaranteed: true,
    requirements: ['Authentic aesthetic lighting', 'Majority female audience (18-35)', 'Clear skin texture closeup'],
    dos: ['Show texture application in natural sunlight', 'Emphasize cruelty-free certifications', 'Tag @glowbotanica and use #GlowBarrierRepair'],
    donts: ['Do not use heavy smoothing beauty filters on camera', 'Avoid comparing negatively to named competitors'],
  },
  {
    id: 'camp-3',
    title: 'Zero-Latency Wireless Pro Gaming Headset Competitive Play Challenge',
    brandName: 'Veloce Audio Labs',
    brandLogo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
    category: 'Gaming & Esports',
    industry: 'Consumer Electronics & Hardware',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    description: 'Seeking competitive FPS and battle royale streamers & YouTubers to test our custom planar magnetic spatial audio drivers during live competitive ranked matches.',
    payoutAmount: '$4,000 – $8,500',
    payoutModel: 'Fixed Fee',
    hasFreeProduct: true,
    freeProductValue: '$349 Pro Headset',
    deliverables: ['1x 90s In-Video Integration on YouTube', '1x Dedicated Twitch/YouTube Live Stream Shoutout'],
    targetPlatforms: ['YouTube', 'TikTok', 'Twitter'],
    creatorTiers: ['Mid', 'Macro'],
    slotsTotal: 6,
    slotsFilled: 3,
    deadline: 'Aug 28, 2026',
    daysRemaining: 8,
    matchScore: 94,
    audienceMatchScore: 96,
    nicheMatchScore: 93,
    isVerifiedBrand: true,
    isEscrowGuaranteed: true,
    requirements: ['Active gaming channel with 50K+ subs', 'Demonstrated competitive gameplay (Valorant, Apex, CS2)'],
    dos: ['Highlight footsteps spatial pinpointing accuracy', 'Test microphone clarity on stream', 'Link hardware giveaway in description'],
    donts: ['Do not obscure headset logo when on camera', 'Avoid bad audio recording setup'],
  },
  {
    id: 'camp-4',
    title: 'High-Performance Seamless Compression Athleisure Workout Drop',
    brandName: 'Solaria Activewear',
    brandLogo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    category: 'Fitness & Wellness',
    industry: 'Fashion & Apparel',
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    description: 'Promote our upcoming Autumn Core Sculpt collection with squat-proof recycled nylon. Perfect for gym training, pilates, running, and high-energy lifestyle content.',
    payoutAmount: '$1,500 – $3,200',
    payoutModel: 'Paid + Commission',
    hasFreeProduct: true,
    freeProductValue: '$320 Athletic Set',
    deliverables: ['2x TikTok / IG Reels with High Energy Gym Beats', '2x Story Link Stills'],
    targetPlatforms: ['Instagram', 'TikTok'],
    creatorTiers: ['Micro', 'Mid'],
    slotsTotal: 15,
    slotsFilled: 11,
    deadline: 'Sep 02, 2026',
    daysRemaining: 13,
    matchScore: 92,
    audienceMatchScore: 94,
    nicheMatchScore: 91,
    isVerifiedBrand: true,
    isEscrowGuaranteed: true,
    requirements: ['Fitness, workout or active lifestyle niche', 'High quality gym/outdoor videography'],
    dos: ['Show movement flexibility, squats and stretches', 'Call out breathable fabric tech', 'Pin promo code in comments'],
    donts: ['No dimly lit home videos', 'Do not wear competing apparel logos'],
  },
  {
    id: 'camp-5',
    title: 'Automated Global Dollar Savings & High-Yield Fintech App Tour',
    brandName: 'FinNova Global Pay',
    brandLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    category: 'Finance & Crypto',
    industry: 'Fintech & Digital Payments',
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    description: 'Educate your audience on earning 5.2% APY on USD balances with zero foreign exchange markup fees. Perfect for personal finance, side hustle and digital nomad creators.',
    payoutAmount: '$5,000 – $12,000',
    payoutModel: 'Fixed Fee',
    hasFreeProduct: false,
    deliverables: ['1x Dedicated YouTube Video (10 mins)', '1x LinkedIn Longform Breakdown', '1x Twitter / X Thread'],
    targetPlatforms: ['YouTube', 'LinkedIn', 'Twitter'],
    creatorTiers: ['Mid', 'Macro'],
    slotsTotal: 5,
    slotsFilled: 2,
    deadline: 'Sep 10, 2026',
    daysRemaining: 21,
    matchScore: 95,
    audienceMatchScore: 97,
    nicheMatchScore: 94,
    isVerifiedBrand: true,
    isEscrowGuaranteed: true,
    requirements: ['Verified finance, investing or tech creator', 'Disclose standard financial disclaimer at start of video'],
    dos: ['Show live app dashboard and quick fund deposit', 'Explain FDIC pass-through insurance safety', 'Highlight zero transfer fees'],
    donts: ['Do not guarantee fixed future investment returns', 'Do not violate compliance disclosure guidelines'],
  },
  {
    id: 'camp-6',
    title: 'Artisanal Single-Origin Cold Brew & Smart Nitrogen Infuser Launch',
    brandName: 'Koa Artisan Coffee Roasters',
    brandLogo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    category: 'Food & Beverage',
    industry: 'Food & Beverage',
    coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    description: 'Calling all coffee connoisseurs, morning routine creators and foodies. Experience velvety micro-foam nitro cold brew drafted straight at your kitchen counter.',
    payoutAmount: '$1,200 – $2,800',
    payoutModel: 'Fixed Fee',
    hasFreeProduct: true,
    freeProductValue: '$199 Smart Nitro Infuser + 3 Bags Single Origin Beans',
    deliverables: ['1x Aesthetic Morning Routine Reel (30-45s)', '2x Story Frames with Unboxing'],
    targetPlatforms: ['Instagram', 'TikTok'],
    creatorTiers: ['Nano', 'Micro', 'Mid'],
    slotsTotal: 10,
    slotsFilled: 6,
    deadline: 'Sep 08, 2026',
    daysRemaining: 19,
    matchScore: 91,
    audienceMatchScore: 93,
    nicheMatchScore: 90,
    isVerifiedBrand: true,
    isEscrowGuaranteed: true,
    requirements: ['Aesthetic morning routine / culinary creator', 'Crisp ASMR pouring sound quality'],
    dos: ['Capture slow-motion nitro cascade effect', 'Record rich coffee grinder and pour sounds', 'Feature unboxing packaging presentation'],
    donts: ['No rushed 5-second blurry clips', 'Do not prepare using instant powdered coffee'],
  },
  {
    id: 'camp-7',
    title: 'Smart Solar Travel Backpack & Portable Off-Grid Power Station',
    brandName: 'NomadVault Gear',
    brandLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    category: 'Travel & Lifestyle',
    industry: 'Consumer Electronics & Hardware',
    coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    description: 'Travel creators and van lifers: Test our rugged, waterproof solar fast-charging pack on your next mountain hike or road trip adventures.',
    payoutAmount: '$2,500 – $5,500',
    payoutModel: 'Fixed Fee',
    hasFreeProduct: true,
    freeProductValue: '$450 Solar Gear Kit',
    deliverables: ['1x YouTube Integration / Travel Vlog Feature', '1x 60s Instagram Reel'],
    targetPlatforms: ['YouTube', 'Instagram', 'TikTok'],
    creatorTiers: ['Micro', 'Mid'],
    slotsTotal: 8,
    slotsFilled: 4,
    deadline: 'Sep 12, 2026',
    daysRemaining: 23,
    matchScore: 93,
    audienceMatchScore: 95,
    nicheMatchScore: 92,
    isVerifiedBrand: true,
    isEscrowGuaranteed: true,
    requirements: ['Active travel, outdoor or adventure channel', 'Stunning scenic location shoot'],
    dos: ['Show charging drone/camera battery on trail', 'Demonstrate weather resistance in rain/snow', 'Link product pre-order discount'],
    donts: ['Do not film solely indoors in an office', 'Do not omit disclosure tags'],
  },
  {
    id: 'camp-8',
    title: 'Minimalist Titanium Automatic Watch & Sapphire Glass Timepiece',
    brandName: 'Aethel Watches Geneva',
    brandLogo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    category: 'Fashion & Apparel',
    industry: 'Luxury & Designer Goods',
    coverImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
    description: 'Luxury timepiece crafted in Grade 5 Titanium with exposed skeleton movement. Seeking men’s and unisex fashion, tailoring and architecture creators.',
    payoutAmount: '$3,000 – $7,000',
    payoutModel: 'Fixed Fee',
    hasFreeProduct: true,
    freeProductValue: '$890 Automatic Watch',
    deliverables: ['1x High-End Macro Cinema Reel (30s)', '1x Carousel Post with 5 Outfit Pairings'],
    targetPlatforms: ['Instagram', 'YouTube'],
    creatorTiers: ['Mid', 'Macro'],
    slotsTotal: 5,
    slotsFilled: 3,
    deadline: 'Sep 15, 2026',
    daysRemaining: 26,
    matchScore: 90,
    audienceMatchScore: 92,
    nicheMatchScore: 89,
    isVerifiedBrand: true,
    isEscrowGuaranteed: true,
    requirements: ['High production quality lighting & macro lens capability', 'Fashion or design focus'],
    dos: ['Showcase precision movement under macro lens', 'Pair with elegant tailored or minimal casual outfits', 'Tag brand and designer notes'],
    donts: ['No low-light pixelated handheld mobile videos', 'Avoid fast jarring transitions that hide watch face'],
  },
];

function parseBudgetNumeric(str: string): number {
  const clean = str.replace(/,/g, '');
  const match = clean.match(/\$([0-9]+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export default function CampaignDiscoverySection() {
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
  const pageSize = 6;

  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [selectedCampaignForDetail, setSelectedCampaignForDetail] = useState<CampaignItem | null>(null);
  const [selectedCampaignForPitch, setSelectedCampaignForPitch] = useState<CampaignItem | null>(null);
  const [liveCampaigns, setLiveCampaigns] = useState<CampaignItem[]>([]);

  // Fetch live campaigns from backend API
  useEffect(() => {
    async function fetchLive() {
      try {
        const { CampaignService } = await import('@/services/campaign.service');
        const res = await CampaignService.discoverCampaigns({
          search: searchQuery || undefined,
          category: quickFilters.category !== 'All' ? quickFilters.category : undefined,
          platform: quickFilters.platform !== 'All Platforms' ? quickFilters.platform : undefined,
        });

        if (res?.campaigns && Array.isArray(res.campaigns) && res.campaigns.length > 0) {
          // Format backend campaigns into CampaignItem shape
          const formatted: CampaignItem[] = res.campaigns.map((c: any) => ({
            id: c.id,
            title: c.title,
            brandName: c.brandProfile?.companyName || 'Verified Brand',
            brandLogo: c.brandProfile?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
            category: c.categories?.[0] || c.industry || 'Tech & AI',
            industry: c.industry || 'SaaS & Enterprise',
            coverImage: c.coverImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
            description: c.description || 'Campaign brief',
            payoutAmount: `$${c.budgetMinPerInfluencer || c.budgetTotalAmount || 1500} – $${c.budgetMaxPerInfluencer || c.budgetTotalAmount || 3000}`,
            payoutModel: (c.budgetPaymentModel === 'FIXED' ? 'Fixed Fee' : 'Paid + Commission') as any,
            hasFreeProduct: Boolean(c.productName),
            freeProductValue: c.productName ? `${c.productName} Sample` : undefined,
            deliverables: (c.deliverables || []).map((d: any) => `${d.quantity || 1}x ${d.type}`),
            targetPlatforms: c.platforms || ['Instagram'],
            creatorTiers: ['Micro', 'Mid', 'Macro'],
            slotsTotal: c.targetParticipants || 5,
            slotsFilled: c._count?.participants || 0,
            deadline: c.applicationDeadline ? new Date(c.applicationDeadline).toLocaleDateString() : 'Rolling',
            daysRemaining: 14,
            matchScore: c.matchScore || 95,
            audienceMatchScore: 96,
            nicheMatchScore: 94,
            isVerifiedBrand: true,
            isEscrowGuaranteed: true,
            requirements: ['Active creator', 'Verified profile'],
            dos: ['Submit authentic content demo', 'Tag brand in publication'],
            donts: ['No low-quality audio or video', 'No undisclosed sponsorships'],
          }));
          setLiveCampaigns(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch discovery campaigns', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLive();
  }, [searchQuery, quickFilters]);

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
    setCurrentPage(1);
  };

  const allCampaignsPool: CampaignItem[] = useMemo(() => {
    return [...liveCampaigns, ...SAMPLE_CAMPAIGNS];
  }, [liveCampaigns]);

  // Filter Pipeline
  const filteredCampaigns = useMemo(() => {
    return allCampaignsPool.filter((c: CampaignItem) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesBrand = c.brandName.toLowerCase().includes(q);
        const matchesCat = c.category.toLowerCase().includes(q);
        const matchesDel = c.deliverables.some((d: string) => d.toLowerCase().includes(q));
        if (!matchesTitle && !matchesBrand && !matchesCat && !matchesDel) return false;
      }



      // 2. Category
      if (quickFilters.category !== 'All') {
        if (c.category !== quickFilters.category) return false;
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
        if (!c.targetPlatforms.includes(quickFilters.platform as any)) return false;
      }

      // 5. Minimum Match Score
      if (quickFilters.minMatchScore > 0 && c.matchScore < quickFilters.minMatchScore) {
        return false;
      }

      // 6. Verified Brand
      if (advancedFilters.isVerifiedOnly && !c.isVerifiedBrand) return false;

      // 7. Escrow Only
      if (advancedFilters.isEscrowOnly && !c.isEscrowGuaranteed) return false;

      return true;
    });
  }, [searchQuery, quickFilters, advancedFilters]);

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
  }, [quickFilters, advancedFilters]);

  const handleRemoveChip = (key: string) => {
    if (key === 'category') handleQuickFilterChange('category', 'All');
    if (key === 'budgetRange') handleQuickFilterChange('budgetRange', 'Any Budget');
    if (key === 'minMatchScore') handleQuickFilterChange('minMatchScore', 0);
    if (key === 'platform') handleQuickFilterChange('platform', 'All Platforms');
    if (key === 'campaignType') handleQuickFilterChange('campaignType', 'All Types');
    if (key === 'isVerifiedOnly') setAdvancedFilters((prev) => ({ ...prev, isVerifiedOnly: false }));
    if (key === 'isEscrowOnly') setAdvancedFilters((prev) => ({ ...prev, isEscrowOnly: false }));
  };

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
      />

      {/* 3. Active Filter Chips (if any) */}
      <CampaignActiveFilterChips
        chips={activeChips}
        onRemoveChip={handleRemoveChip}
        onResetAll={handleResetFilters}
      />

      {/* 4. Controls Bar: Showing count, Sort Dropdown & Grid/List Toggle */}
      <CampaignSortAndControls
        count={filteredCampaigns.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 5. Grid of Campaign Cards */}
      {isLoading ? (
        <CampaignLoadingSkeleton />
      ) : paginatedCampaigns.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950/40 border border-white/10 text-center space-y-3 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No campaigns found</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            No active brand sponsorship briefs matched your current search and filter criteria.
          </p>
          <button
            onClick={handleResetFilters}
            type="button"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md mt-2"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
              : 'space-y-4'
          }
        >
          {paginatedCampaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onViewBrief={(item) => setSelectedCampaignForDetail(item)}
              onApply={(item) => setSelectedCampaignForPitch(item)}
            />
          ))}
        </div>
      )}

      {/* 6. Pagination */}
      {!isLoading && (
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

      <CampaignDetailModal
        isOpen={Boolean(selectedCampaignForDetail)}
        onClose={() => setSelectedCampaignForDetail(null)}
        campaign={selectedCampaignForDetail}
        onApply={(camp) => {
          setSelectedCampaignForPitch(camp);
        }}
      />

      <CampaignPitchModal
        isOpen={Boolean(selectedCampaignForPitch)}
        onClose={() => setSelectedCampaignForPitch(null)}
        campaign={selectedCampaignForPitch}
      />
    </div>
  );
}
