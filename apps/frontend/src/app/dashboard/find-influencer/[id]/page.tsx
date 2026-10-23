'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import CreatorProfileFullView from '@/components/dashboard/brand-views/find-influencers/CreatorProfileFullView';
import CreatorInviteModal from '@/components/dashboard/brand-views/find-influencers/CreatorInviteModal';
import { CreatorItem } from '@/components/dashboard/brand-views/find-influencers/CreatorCard';
import { MOCK_CREATORS } from '@/components/dashboard/brand-views/find-influencers/mockCreators';
import { slugify, getCreatorSlug } from '@/utils/dashboardRoutes';
import LottieLoader from '@/components/ui/LottieLoader';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, convertCurrency } from '@/utils/currency';

const AVATAR_COLORS = [
  'bg-purple-600',
  'bg-indigo-600',
  'bg-pink-600',
  'bg-cyan-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-violet-600',
  'bg-rose-600',
];

function formatFollowerCount(count: number): string {
  if (!count || count <= 0) return '250K';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(count);
}

function getTierFromReach(reachNum: number): string {
  if (reachNum >= 1_000_000) return 'Mega (1M+)';
  if (reachNum >= 500_000) return 'Macro (500K - 1M)';
  if (reachNum >= 100_000) return 'Mid-Tier (100K - 500K)';
  if (reachNum >= 10_000) return 'Micro (10K - 100K)';
  return 'Nano (1K - 10K)';
}

export default function InfluencerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const idParam = typeof params?.id === 'string' ? decodeURIComponent(params.id).toLowerCase() : '';

  const { currency, rates, formatBudget, convert, format } = useCurrency();
  const [creator, setCreator] = useState<CreatorItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCreatorForInvite, setSelectedCreatorForInvite] = useState<CreatorItem | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    async function fetchCreator() {
      setIsLoading(true);
      let list: CreatorItem[] = [];

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

        const res = await fetch(`${apiUrl}/influencer/discovery`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const dbData = await res.json();
          if (Array.isArray(dbData) && dbData.length > 0) {
            list = dbData.map((inf: any, idx: number) => {
              const socialAcc = inf.user?.socialAccounts?.[0] || {};
              const followerNum =
                inf.user?.socialAccounts?.reduce((sum: number, sa: any) => sum + (sa.followerCount || 0), 0) ||
                socialAcc.followerCount ||
                450000;
              const engRateNum = socialAcc.engagementRate || 6.5;

              // Read influencer budget and source currency saved in DB
              const infCurrency = inf.currency || 'USD';
              const rawPrice =
                typeof inf.minPricePerReel === 'number' && !isNaN(inf.minPricePerReel) && inf.minPricePerReel > 0
                  ? inf.minPricePerReel
                  : (infCurrency === 'INR' ? 25000 : 750);

              // Live conversion from influencer DB currency to brand's selected currency
              const convertedRate = convertCurrency(rawPrice, infCurrency, currency, rates);
              const mainPlatform = socialAcc.platform || 'Instagram';
              const platformsList =
                inf.user?.socialAccounts?.map((sa: any) => sa.platform) || [mainPlatform, 'YouTube'];

              return {
                id: inf.id || `creator_${idx}`,
                name: inf.user?.name || inf.handle?.replace('@', '') || `Creator ${idx + 1}`,
                handle: inf.handle || `@${(inf.user?.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
                avatarUrl: inf.avatarUrl,
                avatarBg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                category: inf.niches?.[0] || 'Technology & AI',
                categories: inf.niches && inf.niches.length > 0 ? inf.niches : [inf.niches?.[0] || 'Technology & AI'],
                bio:
                  inf.bio ||
                  'Professional content creator and verified brand ambassador delivering high engagement campaigns.',
                reach: formatFollowerCount(followerNum),
                reachNumber: followerNum,
                engRate: `${engRateNum}%`,
                engRateNumber: engRateNum,
                rating: Number((4.8 + ((idx % 3) * 0.1)).toFixed(1)),
                rawPrice,
                sourceCurrency: infCurrency,
                startingRate: formatCurrency(convertedRate, currency),
                rateNumber: convertedRate,
                platforms: Array.from(new Set(platformsList)),
                primaryPlatform: mainPlatform,
                socialAccounts: (inf.user?.socialAccounts || []).map((sa: any) => ({
                  platform: sa.platform,
                  handle: sa.handle,
                  followerCount: sa.followerCount,
                  subscribers: sa.followerCount,
                  connections: sa.followerCount,
                  engagementRate: sa.engagementRate,
                  isVerified: sa.isVerified,
                  profileUrl: sa.profileUrl,
                  status: sa.status,
                  audienceGenders: sa.audienceGenders || [],
                  audienceAgeGroups: sa.audienceAgeGroups || [],
                  audienceCountries: sa.audienceCountries || [],
                  audienceCities: sa.audienceCities || [],
                  performance: sa.performance || [],
                })),
                location: inf.location || 'United States',
                matchScore: Math.min(99, Math.max(68, 97 - (idx % 12) * 2)),
                matchReasons: [
                  'Audience demographics align with your brand consumer base',
                  `Strong organic engagement in ${inf.niches?.[0] || 'their category'}`,
                  'Verified creator with reliable turnaround track record',
                ],
                isVerified: Boolean(inf.isVerified || inf.user?.socialAccounts?.some((sa: any) => sa.isVerified === true) || socialAcc.isVerified),
                skills: inf.collaborationTypes?.length > 0
                  ? inf.collaborationTypes
                  : ['Reels / Shorts', 'Product Reviews', 'Story Sequences'],
                role: inf.title || inf.role || `${inf.niches?.[0] || 'Content'} Specialist`,
                statusText: 'Available for Collabs',
                topAudienceAge: '25-34 (58%)',
                topAudienceGender: '64% Female / 36% Male',
                creatorTier: getTierFromReach(followerNum),
              };
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch from discovery API:', err);
      }

      if (list.length === 0) {
        list = MOCK_CREATORS.map((mc) => {
          const rawAmt = mc.rawPrice ?? mc.rateNumber;
          const srcCurr = mc.sourceCurrency || 'USD';
          const converted = convertCurrency(rawAmt, srcCurr, currency, rates);
          return {
            ...mc,
            startingRate: formatCurrency(converted, currency),
            rateNumber: converted,
          };
        });
      }

      // Find by id or slug or handle or name
      const matched = list.find((c) => {
        const idLower = c.id.toLowerCase();
        const nameSlug = slugify(c.name);
        const handleClean = c.handle.replace('@', '').toLowerCase();
        return (
          idLower === idParam ||
          nameSlug === idParam ||
          handleClean === idParam ||
          c.name.toLowerCase() === idParam ||
          idParam.includes(nameSlug) ||
          idParam.includes(idLower)
        );
      });

      if (matched) {
        setCreator(matched);
      } else if (list.length > 0) {
        // Fallback to first creator if parameter does not match
        setCreator(list[0]);
      }

      setIsLoading(false);
    }

    fetchCreator();
  }, [idParam, currency, rates]);

  // Keep creator startingRate and rateNumber updated dynamically whenever active currency or live rates change
  useEffect(() => {
    if (creator) {
      const rawAmt = creator.rawPrice ?? creator.rateNumber;
      const srcCurr = creator.sourceCurrency || (creator.startingRate?.includes('$') ? 'USD' : 'INR');
      const converted = convertCurrency(rawAmt, srcCurr, currency, rates);
      setCreator((prev) =>
        prev
          ? {
              ...prev,
              startingRate: formatCurrency(converted, currency),
              rateNumber: converted,
            }
          : null
      );
    }
  }, [currency, rates]);

  if (isLoading) {
    return (
      <div className="h-full min-h-[450px] flex items-center justify-center">
        <LottieLoader size={220} message="Loading creator media kit & analytics..." />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-white/10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center mx-auto">
          <Users className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-white">Creator Profile Not Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          The requested creator profile could not be located in the verified database.
        </p>
        <button
          onClick={() => router.push('/dashboard/find-influencer')}
          type="button"
          className="px-4 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-md shadow-purple-950/40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Find Influencers</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CreatorProfileFullView
        creator={{
          ...creator,
          isBookmarked,
        }}
        onBack={() => router.push('/dashboard/find-influencer')}
        onInvite={(c) => setSelectedCreatorForInvite(c)}
        onToggleBookmark={() => setIsBookmarked((prev) => !prev)}
        onSelectCreator={(c) => router.push(`/dashboard/find-influencer/${getCreatorSlug(c)}`)}
      />

      <CreatorInviteModal
        creator={selectedCreatorForInvite}
        onClose={() => setSelectedCreatorForInvite(null)}
      />
    </div>
  );
}
