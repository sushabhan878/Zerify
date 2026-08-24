import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BrandRepository } from './brand.repository';
import {
  UpdateBrandCompanyInfoDto,
  UpdateBrandCampaignGoalsDto,
  CreateBrandProductDto,
  UpdateBrandTargetInfluencersDto,
  UpdateBrandEscrowDto,
} from './dto/brand-profile.dto';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async clearCache(userId: string) {
    try {
      if (userId) {
        await this.cacheManager.del(`brand:profile:${userId}`);
      }
    } catch (e) {
      console.warn('Brand cache purge error:', e);
    }
  }

  private async syncAndSaveCompletionPercentage(userId: string) {
    try {
      const profile = await this.brandRepository.findByUserId(userId);
      if (!profile) return null;
      
      const pct = this.calculateCompletionPercentage(profile);
      const updated = await this.brandRepository.upsertProfile(userId, { completionPercentage: pct });
      return {
        ...updated,
        completionPercentage: pct,
      };
    } catch (e) {
      console.warn('Error saving completion percentage to DB:', e);
      return null;
    }
  }

  async getProfile(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }

    const cacheKey = `brand:profile:${userId}`;
    try {
      const cached = await this.cacheManager.get<any>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (e) {
      // Fallback to database
    }

    let profile = await this.brandRepository.findByUserId(userId);
    if (!profile) {
      // Auto-create empty profile if user exists but profile not initialized yet
      profile = await this.brandRepository.upsertProfile(userId, {});
    }

    const completionPercentage = this.calculateCompletionPercentage(profile);
    if (profile.completionPercentage !== completionPercentage) {
      this.brandRepository.upsertProfile(userId, { completionPercentage }).catch(() => {});
    }

    const result = {
      ...profile,
      completionPercentage,
    };

    try {
      await this.cacheManager.set(cacheKey, result, 300 * 1000);
    } catch (e) {}

    return result;
  }

  async updateCompanyInfo(userId: string, dto: UpdateBrandCompanyInfoDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    if (dto.companyName) {
      this.brandRepository.updateUserName(userId, dto.companyName).catch(() => {});
    }
    await this.brandRepository.upsertProfile(userId, {
      companyName: dto.companyName ?? undefined,
      logoUrl: dto.logoUrl ?? undefined,
      website: dto.website ?? undefined,
      industry: dto.industry ?? undefined,
      location: dto.location ?? undefined,
      description: dto.description ?? undefined,
      foundedYear: dto.foundedYear ?? undefined,
      socialLinks: dto.socialLinks ?? undefined,
      brandValues: dto.brandValues ?? undefined,
    });

    const result = await this.syncAndSaveCompletionPercentage(userId);
    await this.clearCache(userId);
    return result;
  }

  async updateCampaignGoals(userId: string, dto: UpdateBrandCampaignGoalsDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    await this.brandRepository.upsertProfile(userId, {
      primaryGoals: dto.primaryGoals ?? undefined,
      targetPlatforms: dto.targetPlatforms ?? undefined,
      targetAudience: dto.targetAudience ?? undefined,
    });

    const result = await this.syncAndSaveCompletionPercentage(userId);
    await this.clearCache(userId);
    return result;
  }

  async addProduct(userId: string, dto: CreateBrandProductDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    const profile = await this.brandRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Brand profile not found.');
    }
    await this.brandRepository.addProduct(profile.id, dto);
    const result = await this.syncAndSaveCompletionPercentage(userId);
    await this.clearCache(userId);
    return result;
  }

  async deleteProduct(userId: string, productId: string) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    const profile = await this.brandRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Brand profile not found.');
    }
    await this.brandRepository.deleteProduct(productId, profile.id);
    await this.syncAndSaveCompletionPercentage(userId);
    await this.clearCache(userId);
    return { success: true, message: 'Product removed successfully.' };
  }

  async updateTargetInfluencers(userId: string, dto: UpdateBrandTargetInfluencersDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    await this.brandRepository.upsertProfile(userId, {
      creatorTiers: dto.creatorTiers ?? undefined,
      creatorLocations: dto.creatorLocations ?? undefined,
      preferredCreatorGender: dto.preferredCreatorGender,
      verifiedOnly: dto.verifiedOnly,
      minEngagementRate: dto.minEngagementRate,
      campaignBudget: dto.campaignBudget,
      campaignFrequency: dto.campaignFrequency,
    });

    const result = await this.syncAndSaveCompletionPercentage(userId);
    await this.clearCache(userId);
    return result;
  }

  async updateEscrowSetup(userId: string, dto: UpdateBrandEscrowDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    await this.brandRepository.upsertProfile(userId, {
      escrowSetup: dto.escrowSetup ?? undefined,
      isOnboardingCompleted: dto.isOnboardingCompleted ?? true,
    });

    const result = await this.syncAndSaveCompletionPercentage(userId);
    await this.clearCache(userId);
    return result;
  }

  async completeOnboarding(userId: string) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    await this.brandRepository.upsertProfile(userId, {
      isOnboardingCompleted: true,
    });

    const result = await this.syncAndSaveCompletionPercentage(userId);
    await this.clearCache(userId);
    return result;
  }

  private calculateCompletionPercentage(profile: any): number {
    let score = 0;

    // Section 1: Company Info (20% Max)
    let section1 = 0;
    if (profile.companyName) section1 += 4;
    if (profile.logoUrl || profile.website) section1 += 4;
    if (profile.industry) section1 += 4;
    if (profile.location) section1 += 4;
    if (profile.description || (profile.brandValues && profile.brandValues.length > 0)) section1 += 4;
    score += Math.min(section1, 20);

    // Section 2: Campaign Goals (20% Max)
    let section2 = 0;
    if (profile.primaryGoals && profile.primaryGoals.length > 0) section2 += 10;
    if (profile.targetPlatforms && profile.targetPlatforms.length > 0) section2 += 10;
    score += Math.min(section2, 20);

    // Section 3: Products & Services (20% Max)
    let section3 = 0;
    if (profile.products && profile.products.length > 0) section3 += 20;
    score += Math.min(section3, 20);

    // Section 4: Target Influencers (20% Max)
    let section4 = 0;
    if (profile.creatorTiers && profile.creatorTiers.length > 0) section4 += 10;
    if (profile.campaignBudget || profile.campaignFrequency) section4 += 10;
    score += Math.min(section4, 20);

    // Section 5: Payments & Escrow Setup (20% Max)
    let section5 = 0;
    if (profile.escrowSetup || profile.isOnboardingCompleted) section5 += 20;
    score += Math.min(section5, 20);

    return Math.min(score, 100);
  }

  async getDiscoveryBrands() {
    const cacheKey = 'brand:discovery:all';
    try {
      const cached = await this.cacheManager.get<any>(cacheKey);
      if (cached) return cached;
    } catch (e) {}

    const brands = await this.brandRepository.findAllForDiscovery();
    
    try {
      await this.cacheManager.set(cacheKey, brands, 60 * 1000);
    } catch (e) {}

    return brands;
  }

  async toggleSavedCreator(userId: string | undefined, influencerId: string) {
    if (!userId) {
      throw new BadRequestException('Authentication required');
    }
    return this.brandRepository.toggleSavedCreator(userId, influencerId);
  }

  async getSavedCreatorIds(userId: string | undefined) {
    if (!userId) return [];
    return this.brandRepository.getSavedCreatorIds(userId);
  }

  async getSavedCreatorsDetailed(userId: string | undefined) {
    if (!userId) return [];
    return this.brandRepository.getSavedCreatorsDetailed(userId);
  }
}
