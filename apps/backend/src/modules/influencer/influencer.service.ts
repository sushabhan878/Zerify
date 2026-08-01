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

    try {
      await this.cacheManager.set(cacheKey, profile, 300 * 1000);
    } catch (e) {
      console.warn('Cache write error:', e);
    }

    return profile;
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
      const updated = await this.influencerRepository.updateProfile(targetUserId, dto);
      await this.clearCache(targetUserId);
      return updated;
    } catch (err: any) {
      console.error('Error updating influencer profile:', err);
      throw new BadRequestException(err.message || 'Could not update influencer profile in database.');
    }
  }

  async updateSocialAccounts(userId: string | undefined, accounts: any[]) {
    const profile = await this.getProfile(userId);
    const updated = await this.influencerRepository.syncConnectedAccounts(profile.id, accounts);
    await this.clearCache(profile.userId);
    return updated;
  }

  async updatePortfolio(userId: string | undefined, items: any[]) {
    const profile = await this.getProfile(userId);
    const updated = await this.influencerRepository.syncPastDeliverables(profile.id, items);
    await this.clearCache(profile.userId);
    return updated;
  }

  async updatePaymentDetails(userId: string | undefined, paymentDto: any) {
    const profile = await this.getProfile(userId);
    const updated = await this.influencerRepository.upsertPaymentDetails(profile.id, paymentDto);
    await this.clearCache(profile.userId);
    return updated;
  }
}
