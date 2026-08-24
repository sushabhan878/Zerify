import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InfluencerRepository } from './influencer.repository';
import { UpdateInfluencerProfileDto } from './dto/update-profile.dto';

@Injectable()
export class InfluencerService {
  constructor(
    private readonly influencerRepository: InfluencerRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async clearCache(userId?: string) {
    try {
      if (userId) {
        await this.cacheManager.del(`influencer:profile:${userId}`);
      }
      await this.cacheManager.del(`influencer:profile:first`);
    } catch (e) {
      console.warn('Cache purge error:', e);
    }
  }

  private calculateCompletionPercentage(profile: any): number {
    if (!profile) return 0;
    let score = 0;

    // Section 1: Basic Information & Profile Photo (20% Max)
    let section1 = 0;
    if (profile.user?.name) section1 += 4;
    if (profile.handle) section1 += 4;
    if (profile.bio) section1 += 4;
    if (profile.avatarUrl) section1 += 4;
    if (profile.location || profile.phoneNumber) section1 += 4;
    score += Math.min(section1, 20);

    // Section 2: Niches & Content Languages (20% Max)
    let section2 = 0;
    if (profile.niches && profile.niches.length > 0) section2 += 10;
    if (profile.contentLanguages && profile.contentLanguages.length > 0) section2 += 10;
    score += Math.min(section2, 20);

    // Section 3: Collaboration Preferences & Pricing (20% Max)
    let section3 = 0;
    if (profile.minPricePerReel || profile.pricingRange) section3 += 10;
    if (
      (profile.collaborationTypes && profile.collaborationTypes.length > 0) ||
      profile.availableForBarter ||
      profile.availableForRelocation
    ) {
      section3 += 10;
    }
    score += Math.min(section3, 20);

    // Section 4: Connected Accounts & Past Deliverables (20% Max)
    let section4 = 0;
    const hasSocialAccounts = profile.user?.socialAccounts && profile.user.socialAccounts.length > 0;
    if (hasSocialAccounts) section4 += 10;
    if (profile.pastDeliverables && profile.pastDeliverables.length > 0) section4 += 10;
    score += Math.min(section4, 20);

    // Section 5: Payment Details & Bank Setup (20% Max)
    let section5 = 0;
    if (profile.paymentDetails) section5 += 20;
    score += Math.min(section5, 20);

    return Math.min(score, 100);
  }

  private async syncAndSaveCompletionPercentage(userId: string) {
    try {
      const profile = await this.influencerRepository.findByUserId(userId);
      if (!profile) return null;

      const completionPercentage = this.calculateCompletionPercentage(profile);
      const updated = await this.influencerRepository.updateProfile(userId, {
        completionPercentage,
      } as any);

      return {
        ...updated,
        completionPercentage,
      };
    } catch (e) {
      console.warn('Error saving completion percentage for influencer profile:', e);
      return null;
    }
  }

  async getProfile(userId?: string) {
    const cacheKey = `influencer:profile:${userId || 'first'}`;

    try {
      const cachedProfile = await this.cacheManager.get(cacheKey);
      if (cachedProfile) {
        return cachedProfile;
      }
    } catch (e) {
      console.warn('Cache read error, falling back to database:', e);
    }

    let profile: any = null;
    if (userId) {
      profile = await this.influencerRepository.findByUserId(userId);
    }

    if (!profile) {
      profile = await this.influencerRepository.findFirstProfile();
    }

    if (!profile) {
      throw new NotFoundException('Influencer profile not found');
    }

    const completionPercentage = this.calculateCompletionPercentage(profile);
    if (profile.completionPercentage !== completionPercentage) {
      this.influencerRepository
        .updateProfile(profile.userId, { completionPercentage } as any)
        .catch(() => {});
    }

    const result = {
      ...profile,
      completionPercentage,
    };

    try {
      await this.cacheManager.set(cacheKey, result, 300 * 1000);
    } catch (e) {
      console.warn('Cache write error:', e);
    }

    return result;
  }

  async updateProfile(userId: string | undefined, dto: UpdateInfluencerProfileDto) {
    let targetUserId = userId;

    if (!targetUserId) {
      const firstProfile = await this.influencerRepository.findFirstProfile();
      if (firstProfile) {
        targetUserId = firstProfile.userId;
      } else {
        throw new NotFoundException('No target influencer profile found to update');
      }
    }

    try {
      await this.influencerRepository.updateProfile(targetUserId, dto);
      const result = await this.syncAndSaveCompletionPercentage(targetUserId);
      await this.clearCache(targetUserId);
      return result;
    } catch (err: any) {
      console.error('Error updating influencer profile:', err);
      throw new BadRequestException(err.message || 'Could not update influencer profile in database.');
    }
  }

  async updateSocialAccounts(userId: string | undefined, accounts: any[]) {
    const profile = await this.getProfile(userId);
    await this.influencerRepository.syncConnectedAccounts(profile.id, accounts);
    const result = await this.syncAndSaveCompletionPercentage(profile.userId);
    await this.clearCache(profile.userId);
    return result;
    }

  async updatePortfolio(userId: string | undefined, items: any[]) {
    const profile = await this.getProfile(userId);
    await this.influencerRepository.syncPastDeliverables(profile.id, items);
    const result = await this.syncAndSaveCompletionPercentage(profile.userId);
    await this.clearCache(profile.userId);
    return result;
  }

  async updatePaymentDetails(userId: string | undefined, paymentDto: any) {
    const profile = await this.getProfile(userId);
    await this.influencerRepository.upsertPaymentDetails(profile.id, paymentDto);
    const result = await this.syncAndSaveCompletionPercentage(profile.userId);
    await this.clearCache(profile.userId);
    return result;
  }

  async getDiscoveryInfluencers() {
    const cacheKey = 'influencer:discovery:all';
    try {
      const cached = await this.cacheManager.get<any>(cacheKey);
      if (cached) return cached;
    } catch (e) {}

    const influencers = await this.influencerRepository.findAllForDiscovery();

    try {
      await this.cacheManager.set(cacheKey, influencers, 60 * 1000);
    } catch (e) {}

    return influencers;
  }
}
