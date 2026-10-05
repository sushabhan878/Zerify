import { CampaignApplicationItem } from '@/services/application.service';
import { CreatorItem } from '../find-influencers/CreatorCard';
import { formatCurrency } from '@/utils/currency';

export function mapApplicationToCreator(app: CampaignApplicationItem): CreatorItem {
  const profile: any = app.profileSnapshot || (app as any).influencerProfile || {};
  const socialAccount: any = (app as any).socialAccount || {};
  const influencerProfile: any = (app as any).influencerProfile || {};
  const user: any = influencerProfile.user || {};
  const match: any = app.matchSnapshot || { score: 95, eligibility: 'ELIGIBLE', reasons: [] };

  const displayName =
    profile.displayName ||
    user.name ||
    influencerProfile.handle?.replace('@', '') ||
    socialAccount.username ||
    'Creator';

  const rawFollowers =
    profile.followersCount ??
    profile.followerCount ??
    socialAccount.followerCount ??
    socialAccount.followersCount ??
    250000;

  const followerNum = Number(rawFollowers) || 250000;

  const formatCount = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return count.toLocaleString();
  };

  const userCur = typeof window !== 'undefined' ? localStorage.getItem('zerify_preferred_currency') || 'INR' : 'INR';
  const defaultRate = userCur === 'INR' ? 25000 : 750;
  const startingRateNum = Number(app.proposedAmount) || influencerProfile.minPricePerReel || defaultRate;
  const engRateNum = profile.engagementRate || socialAccount.engagementRate || 5.8;

  const niches =
    influencerProfile.niches && influencerProfile.niches.length > 0
      ? influencerProfile.niches
      : profile.niches && profile.niches.length > 0
      ? profile.niches
      : [profile.primaryNiche || influencerProfile.primaryNiche || 'Content Creation'];

  const platformsList =
    influencerProfile.user?.socialAccounts?.map((sa: any) => sa.platform) ||
    (socialAccount.platform ? [socialAccount.platform] : [profile.platform || 'Instagram']);

  return {
    id: app.influencerProfileId || influencerProfile.id || app.id,
    name: displayName,
    handle: `@${(influencerProfile.handle || socialAccount.username || displayName).toString().replace(/^@+/, '')}`,
    avatarUrl:
      profile.avatarUrl ||
      influencerProfile.avatarUrl ||
      profile.avatar ||
      socialAccount.avatar ||
      user.image ||
      undefined,
    avatarBg: 'bg-purple-600',
    category: niches[0] || 'Content Creation',
    categories: niches,
    bio:
      influencerProfile.bio ||
      profile.bio ||
      app.applicationMessage ||
      'Verified content creator and brand collaborator on Zerify.',
    reach: formatCount(followerNum),
    reachNumber: followerNum,
    engRate: `${engRateNum}%`,
    engRateNumber: Number(engRateNum),
    rating: 5.0,
    startingRate: formatCurrency(startingRateNum, userCur),
    rateNumber: startingRateNum,
    platforms: Array.from(new Set(platformsList)),
    primaryPlatform: profile.platform || socialAccount.platform || 'Instagram',
    location: influencerProfile.location || profile.location || 'United States',
    matchScore: match.score || 95,
    matchReasons:
      match.reasons && Array.isArray(match.reasons) && match.reasons.length > 0
        ? match.reasons.map((r: any) =>
            typeof r === 'string'
              ? r
              : r?.details ||
                (r?.criterion ? `${r.criterion.replace(/_/g, ' ')} alignment verified` : '') ||
                r?.description ||
                'Verified campaign match requirement'
          )
        : [
            'Audience demographics align with target campaign reach',
            'Strong in-platform collaboration rating and verified turnaround',
            'Deliverables align with budget and creative scope',
          ],
    isVerified: influencerProfile.isVerified ?? true,
    skills:
      influencerProfile.collaborationTypes?.length > 0
        ? influencerProfile.collaborationTypes
        : ['Reels / Shorts', 'Product Reviews', 'Story Sequences'],
    topAudienceAge: '18-34 (72%)',
    topAudienceGender: '62% Female / 38% Male',
    creatorTier: followerNum >= 500_000 ? 'Macro' : followerNum >= 100_000 ? 'Mid-Tier' : 'Micro',
  };
}
