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
import CompanyPagination from './company-discovery/CompanyPagination';
import CompanyLoadingSkeleton from './company-discovery/CompanyLoadingSkeleton';
import { AlertCircle } from 'lucide-react';

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
    campaignBudget: '$25,000 – $50,000',
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
    campaignBudget: '$5,000 – $10,000',
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
    campaignBudget: '$3,000 – $5,000',
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
    campaignBudget: '$1,000 – $3,000',
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
    campaignBudget: '$10,000 – $25,000',
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
    campaignBudget: '$5,000 – $10,000',
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
    campaignBudget: '$1,000 – $3,000',
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
    campaignBudget: '$3,000 – $5,000',
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
  {
    id: 'b9',
    companyName: 'VaultPay Financial',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    website: 'https://vaultpay.app',
    industry: 'Fintech & Digital Payments',
    location: 'New York, NY, United States',
    description: 'Next-gen cross-border smart card with zero foreign exchange fees and high-yield cash back rewards.',
    brandValues: ['Innovation', 'Transparency', 'Security'],
    primaryGoals: ['User Acquisition', 'Brand Awareness'],
    targetPlatforms: ['YouTube', 'Twitter', 'TikTok'],
    targetAudience: { gender: 'All', ageRanges: ['18-24', '25-34', '35-44'], locations: ['United States', 'UK'] },
    creatorTiers: ['Micro', 'Mid'],
    campaignBudget: '$10,000 – $25,000',
    campaignFrequency: 'Ongoing Partnership',
    escrowSetup: true,
    matchScore: 94,
    audienceMatchScore: 96,
    nicheMatchScore: 94,
    contentMatchScore: 93,
    brandFitScore: 92,
    budgetFitScore: 95,
    matchReasons: ['Strong tech and personal finance creator affinity'],
    isVerified: true,
  },
  {
    id: 'b10',
    companyName: 'Lumina Health Therapeutics',
    logoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    website: 'https://luminahealth.com',
    industry: 'Healthcare & Pharmaceuticals',
    location: 'Boston, MA, United States',
    description: 'Physician-formulated clean botanical longevity supplements and cellular NAD+ boosters.',
    brandValues: ['Quality', 'Health', 'Sustainability'],
    primaryGoals: ['Sales & Conversions', 'Lead Generation'],
    targetPlatforms: ['Instagram', 'YouTube', 'TikTok'],
    targetAudience: { gender: 'All', ageRanges: ['25-34', '35-44', '45+'], locations: ['United States', 'Canada'] },
    creatorTiers: ['Micro', 'Mid'],
    campaignBudget: '$5,000 – $10,000',
    campaignFrequency: 'Monthly Recurring',
    escrowSetup: true,
    matchScore: 92,
    audienceMatchScore: 93,
    nicheMatchScore: 92,
    contentMatchScore: 90,
    brandFitScore: 94,
    budgetFitScore: 91,
    matchReasons: ['Wellness lifestyle audience alignment'],
    isVerified: true,
  },
  {
    id: 'b11',
    companyName: 'Aura Luxury Chronographs',
    logoUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    website: 'https://aurachronos.ch',
    industry: 'Luxury & Designer Goods',
    location: 'Geneva, Switzerland',
    description: 'Swiss-automatic limited edition luxury chronographs crafted with Damascus titanium.',
    brandValues: ['Quality', 'Exclusivity', 'Innovation'],
    primaryGoals: ['Brand Awareness', 'Community Building'],
    targetPlatforms: ['Instagram', 'YouTube'],
    targetAudience: { gender: 'Male', ageRanges: ['25-34', '35-44', '45+'], locations: ['United States', 'UK', 'EU'] },
    creatorTiers: ['Mid', 'Macro'],
    campaignBudget: '$25,000+',
    campaignFrequency: 'Quarterly Campaigns',
    escrowSetup: true,
    matchScore: 95,
    audienceMatchScore: 96,
    nicheMatchScore: 95,
    contentMatchScore: 94,
    brandFitScore: 93,
    budgetFitScore: 97,
    matchReasons: ['Luxury lifestyle and aesthetic horology match'],
    isVerified: true,
  },
  {
    id: 'b12',
    companyName: 'Verdant Micro-Roasters',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    website: 'https://verdantcoffee.co',
    industry: 'Food & Beverage',
    location: 'Portland, OR, United States',
    description: 'Fair-trade single-origin micro-lot specialty coffee beans sourced directly from Ethiopian smallholder farms.',
    brandValues: ['Sustainability', 'Quality', 'Community'],
    primaryGoals: ['Sales & Conversions', 'Brand Awareness'],
    targetPlatforms: ['Instagram', 'TikTok', 'YouTube'],
    targetAudience: { gender: 'All', ageRanges: ['18-24', '25-34', '35-44'], locations: ['United States'] },
    creatorTiers: ['Nano', 'Micro'],
    campaignBudget: '$500 – $1,000',
    campaignFrequency: 'Monthly Recurring',
    escrowSetup: true,
    matchScore: 89,
    audienceMatchScore: 91,
    nicheMatchScore: 88,
    contentMatchScore: 89,
    brandFitScore: 88,
    budgetFitScore: 90,
    matchReasons: ['High affinity with morning routine and culinary lifestyle creators'],
    isVerified: true,
  },
  {
    id: 'b13',
    companyName: 'EcoSpark Home Labs',
    logoUrl: 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?auto=format&fit=crop&w=400&q=80',
    website: 'https://ecosparkhome.com',
    industry: 'Home & Interior Design',
    location: 'Seattle, WA, United States',
    description: 'Zero-waste refillable organic probiotic cleaning concentrates in glass flacons.',
    brandValues: ['Sustainability', 'Affordability'],
    primaryGoals: ['Sales & Conversions', 'UGC Creation'],
    targetPlatforms: ['TikTok', 'Instagram'],
    targetAudience: { gender: 'All', ageRanges: ['18-24', '25-34'], locations: ['United States'] },
    creatorTiers: ['Nano'],
    campaignBudget: 'Under $500',
    campaignFrequency: 'One-time Campaign',
    escrowSetup: true,
    matchScore: 87,
    audienceMatchScore: 89,
    nicheMatchScore: 86,
    contentMatchScore: 87,
    brandFitScore: 85,
    budgetFitScore: 92,
    matchReasons: ['Eco-friendly home care and cleaning lifestyle affinity'],
    isVerified: true,
  },
  {
    id: 'b14',
    companyName: 'Zenith BioPulse',
    logoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
    website: 'https://zenithbiopulse.com',
    industry: 'Fitness & Wellness',
    location: 'Denver, CO, United States',
    description: 'Smart hydration sensors and electrolyte hydration monitors for endurance athletes.',
    brandValues: ['Innovation', 'Health'],
    primaryGoals: ['Product Review', 'Brand Awareness'],
    targetPlatforms: ['Instagram', 'YouTube'],
    targetAudience: { gender: 'All', ageRanges: ['18-24', '25-34', '35-44'], locations: ['United States', 'UK'] },
    creatorTiers: ['Nano', 'Micro'],
    campaignBudget: '$500 – $1,000',
    campaignFrequency: 'Monthly Recurring',
    escrowSetup: true,
    matchScore: 90,
    audienceMatchScore: 92,
    nicheMatchScore: 89,
    contentMatchScore: 90,
    brandFitScore: 89,
    budgetFitScore: 91,
    matchReasons: ['Targeting athletic and fitness tracking creators'],
    isVerified: true,
  },
  {
    id: 'b15',
    companyName: 'ByteCraft Interactive',
    logoUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    website: 'https://bytecraft.games',
    industry: 'Consumer Electronics & Hardware',
    location: 'Montreal, Canada',
    description: 'Retro pixel-art indie roguelike adventure game with cross-platform co-op multiplayer.',
    brandValues: ['Innovation', 'Community'],
    primaryGoals: ['Sponsored Post', 'User Acquisition'],
    targetPlatforms: ['Twitch', 'YouTube', 'TikTok'],
    targetAudience: { gender: 'All', ageRanges: ['18-24', '25-34'], locations: ['United States', 'Canada', 'EU'] },
    creatorTiers: ['Nano'],
    campaignBudget: 'Under $500',
    campaignFrequency: 'One-time Campaign',
    escrowSetup: true,
    matchScore: 91,
    audienceMatchScore: 93,
    nicheMatchScore: 90,
    contentMatchScore: 92,
    brandFitScore: 89,
    budgetFitScore: 93,
    matchReasons: ['Gaming creators and live-stream play-through fit'],
    isVerified: true,
  },
  {
    id: 'b16',
    companyName: 'Quantum Dynamics Inc.',
    logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    website: 'https://quantumdynamics.ai',
    industry: 'Software & SaaS',
    location: 'Austin, TX, United States',
    description: 'Enterprise generative AI infrastructure and automated business intelligence copilots.',
    brandValues: ['Innovation', 'Quality', 'Exclusivity'],
    primaryGoals: ['Brand Ambassador', 'Lead Generation'],
    targetPlatforms: ['LinkedIn', 'YouTube', 'Twitter'],
    targetAudience: { gender: 'All', ageRanges: ['25-34', '35-44', '45+'], locations: ['United States', 'Global'] },
    creatorTiers: ['Mid', 'Macro'],
    campaignBudget: '$25,000+',
    campaignFrequency: 'Annual Enterprise Retainer',
    escrowSetup: true,
    matchScore: 97,
    audienceMatchScore: 98,
    nicheMatchScore: 97,
    contentMatchScore: 95,
    brandFitScore: 96,
    budgetFitScore: 98,
    matchReasons: ['Top 1% technology audience resonance and enterprise B2B reach'],
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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
            const sampleBudgets = [
              '$25,000+',
              '$10,000 – $25,000',
              '$5,000 – $10,000',
              '$3,000 – $5,000',
              '$1,000 – $3,000',
              '$500 – $1,000',
              'Under $500',
            ];
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
                campaignBudget: b.campaignBudget || sampleBudgets[idx % sampleBudgets.length],
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
    if (filters.targetGender !== 'All') list.push({ key: 'targetGender', label: `Gender: ${filters.targetGender}` });
    if (filters.targetAge !== 'All') list.push({ key: 'targetAge', label: `Age: ${filters.targetAge}` });
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

  // Helper functions for robust multi-attribute filtering
  const getFilterRangeBounds = (filterStr: string): [number, number] => {
    if (!filterStr || filterStr === 'Any Budget') return [0, Infinity];

    const parseVal = (valStr: string): number => {
      const clean = valStr.replace(/[$,+]/g, '').trim().toLowerCase();
      if (clean.endsWith('k')) {
        return parseFloat(clean.replace('k', '')) * 1000;
      }
      if (clean.endsWith('m')) {
        return parseFloat(clean.replace('m', '')) * 1000000;
      }
      return parseFloat(clean) || 0;
    };

    const lower = filterStr.toLowerCase().trim();

    if (lower.startsWith('under') || lower.startsWith('<')) {
      const rawVal = lower.replace(/under|<|\$/g, '').trim();
      return [0, parseVal(rawVal)];
    }

    if (filterStr.includes('+')) {
      const rawVal = filterStr.replace('+', '').trim();
      return [parseVal(rawVal), Infinity];
    }

    if (filterStr.includes('-') || filterStr.includes('–')) {
      const delimiter = filterStr.includes('–') ? '–' : '-';
      const [low, high] = filterStr.split(delimiter).map((s) => s.trim());
      return [parseVal(low), parseVal(high)];
    }

    return [0, Infinity];
  };

  const parseCompanyBudgetBounds = (budgetStr?: string): [number, number] => {
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
  };

  const matchesBudget = (budgetStr: string | undefined, filterRange: string): boolean => {
    if (!filterRange || filterRange === 'Any Budget') return true;
    if (!budgetStr) return true;

    const [brandMin, brandMax] = parseCompanyBudgetBounds(budgetStr);
    const brandMid = (brandMin + (brandMax === Infinity ? brandMin : brandMax)) / 2;

    switch (filterRange) {
      case 'Under $500':
        return brandMin < 500 || brandMax <= 500 || brandMid <= 500;
      case '$500 - $1K':
        return (brandMin >= 400 && brandMax <= 1200) || (brandMid >= 500 && brandMid <= 1000);
      case '$1K - $3K':
        return (brandMin >= 900 && brandMax <= 3500) || (brandMid >= 1000 && brandMid <= 3000);
      case '$3K - $5K':
        return (brandMin >= 2500 && brandMax <= 5500) || (brandMid >= 3000 && brandMid <= 5000);
      case '$5K - $10K':
        return (brandMin >= 4500 && brandMax <= 11000) || (brandMid >= 5000 && brandMid <= 10000);
      case '$10K - $25K':
        return (brandMin >= 9000 && brandMax <= 26000) || (brandMid >= 10000 && brandMid <= 25000);
      case '$25K+':
        return brandMax >= 25000 || brandMin >= 25000;
      default: {
        const [filterMin, filterMax] = getFilterRangeBounds(filterRange);
        return brandMax >= filterMin && brandMin <= filterMax;
      }
    }
  };

  const matchesCampaignType = (c: CompanyItem, campaignType: string): boolean => {
    if (!campaignType || campaignType === 'All Types') return true;
    const typeLower = campaignType.toLowerCase();

    // Direct goal / deliverable match
    if (c.primaryGoals?.some((g) => g.toLowerCase().includes(typeLower) || typeLower.includes(g.toLowerCase()))) {
      return true;
    }

    // Social platform deliverable match
    if (typeLower.includes('instagram') && c.targetPlatforms?.some((p) => p.toLowerCase().includes('instagram'))) {
      return true;
    }
    if (typeLower.includes('tiktok') && c.targetPlatforms?.some((p) => p.toLowerCase().includes('tiktok'))) {
      return true;
    }
    if (typeLower.includes('youtube') && c.targetPlatforms?.some((p) => p.toLowerCase().includes('youtube'))) {
      return true;
    }

    // General formats (Sponsored Post, UGC Creation, Brand Ambassador, Product Review)
    if (
      typeLower.includes('sponsored') ||
      typeLower.includes('ugc') ||
      typeLower.includes('ambassador') ||
      typeLower.includes('review') ||
      typeLower.includes('post')
    ) {
      return true;
    }

    return false;
  };

  const matchesDemographics = (c: CompanyItem, gender?: string, age?: string): boolean => {
    if (gender && gender !== 'All') {
      const brandGender = c.targetAudience?.gender || 'All';
      if (brandGender !== 'All' && brandGender.toLowerCase() !== gender.toLowerCase()) {
        return false;
      }
    }

    if (age && age !== 'All') {
      const brandAges = c.targetAudience?.ageRanges || ['All'];
      if (!brandAges.includes('All') && !brandAges.includes(age)) {
        return false;
      }
    }

    return true;
  };

  // Filter & Search Logic
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => {
        // 1. Search Query (name, description, industry, location, products, goals)
        if (search) {
          const query = search.toLowerCase().trim();
          const matchName = c.companyName.toLowerCase().includes(query);
          const matchDesc = c.description?.toLowerCase().includes(query);
          const matchInd = c.industry.toLowerCase().includes(query);
          const matchLoc = c.location?.toLowerCase().includes(query);
          const matchProd = c.products?.some((p) => p.name?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query));
          const matchGoals = c.primaryGoals?.some((g) => g.toLowerCase().includes(query));
          if (!matchName && !matchDesc && !matchInd && !matchLoc && !matchProd && !matchGoals) return false;
        }

        // 2. Industry / Category
        if (filters.industry !== 'All') {
          const cInd = c.industry.toLowerCase();
          const fInd = filters.industry.toLowerCase();
          if (!cInd.includes(fInd) && !fInd.includes(cInd)) return false;
        }

        // 3. Budget Range
        if (!matchesBudget(c.campaignBudget, filters.budgetRange)) return false;

        // 4. Platform
        if (filters.platform !== 'All Platforms') {
          const hasPlat = c.targetPlatforms?.some(
            (p) => p.toLowerCase() === filters.platform.toLowerCase()
          );
          if (!hasPlat) return false;
        }

        // 5. Campaign / Deliverable Type
        if (!matchesCampaignType(c, filters.campaignType)) return false;

        // 6. Match Scores
        if (filters.minMatchScore > 0 && c.matchScore < filters.minMatchScore) return false;
        if (filters.minAudienceScore > 0 && c.audienceMatchScore < filters.minAudienceScore) return false;
        if (filters.minNicheScore > 0 && c.nicheMatchScore < filters.minNicheScore) return false;

        // 7. Demographics (Gender & Age)
        if (!matchesDemographics(c, filters.targetGender, filters.targetAge)) return false;

        // 8. Trust & Escrow
        if (filters.isVerifiedOnly && c.isVerified === false) return false;
        if (filters.escrowOnly && c.escrowSetup === false) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.companyName.localeCompare(b.companyName);
        if (sortBy === 'highestBudget') {
          const [_, maxA] = parseCompanyBudgetBounds(a.campaignBudget);
          const [__, maxB] = parseCompanyBudgetBounds(b.campaignBudget);
          return maxB - maxA;
        }
        if (sortBy === 'lowestBudget') {
          const [minA] = parseCompanyBudgetBounds(a.campaignBudget);
          const [minB] = parseCompanyBudgetBounds(b.campaignBudget);
          return minA - minB;
        }
        if (sortBy === 'newest') {
          return Number(b.foundedYear || 2024) - Number(a.foundedYear || 2024);
        }
        return b.matchScore - a.matchScore;
      });
  }, [companies, search, filters, sortBy]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters, sortBy]);

  // Pagination Computations
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage, pageSize]);

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
        <CompanyLoadingSkeleton />
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
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                : 'flex flex-col space-y-3'
            }
          >
            {paginatedCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewDetails={setDetailCompany}
                onPitchBrand={setPitchCompany}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Pagination Bar */}
          <CompanyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCompanies.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </>
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
