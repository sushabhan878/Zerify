import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
  constructor(private readonly brandRepository: BrandRepository) {}

  async getProfile(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }

    let profile = await this.brandRepository.findByUserId(userId);
    if (!profile) {
      // Auto-create empty profile if user exists but profile not initialized yet
      profile = await this.brandRepository.upsertProfile(userId, {});
    }

    const completionPercentage = this.calculateCompletionPercentage(profile);
    return {
      ...profile,
      completionPercentage,
    };
  }

  async updateCompanyInfo(userId: string, dto: UpdateBrandCompanyInfoDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    if (dto.companyName) {
      this.brandRepository.updateUserName(userId, dto.companyName).catch(() => {});
    }
    return this.brandRepository.upsertProfile(userId, {
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
  }

  async updateCampaignGoals(userId: string, dto: UpdateBrandCampaignGoalsDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    return this.brandRepository.upsertProfile(userId, {
      primaryGoals: dto.primaryGoals ?? undefined,
      targetPlatforms: dto.targetPlatforms ?? undefined,
      targetAudience: dto.targetAudience ?? undefined,
    });
  }

  async addProduct(userId: string, dto: CreateBrandProductDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    const profile = await this.brandRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Brand profile not found.');
    }
    return this.brandRepository.addProduct(profile.id, dto);
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
    return { success: true, message: 'Product removed successfully.' };
  }

  async updateTargetInfluencers(userId: string, dto: UpdateBrandTargetInfluencersDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    return this.brandRepository.upsertProfile(userId, {
      creatorTiers: dto.creatorTiers ?? undefined,
      creatorLocations: dto.creatorLocations ?? undefined,
      preferredCreatorGender: dto.preferredCreatorGender,
      verifiedOnly: dto.verifiedOnly,
      minEngagementRate: dto.minEngagementRate,
      campaignBudget: dto.campaignBudget,
      campaignFrequency: dto.campaignFrequency,
    });
  }

  async updateEscrowSetup(userId: string, dto: UpdateBrandEscrowDto) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    return this.brandRepository.upsertProfile(userId, {
      escrowSetup: dto.escrowSetup ?? undefined,
      isOnboardingCompleted: dto.isOnboardingCompleted ?? true,
    });
  }

  async completeOnboarding(userId: string) {
    if (!userId) {
      throw new BadRequestException('User authentication session expired. Please log in again.');
    }
    return this.brandRepository.upsertProfile(userId, {
      isOnboardingCompleted: true,
    });
  }

  private calculateCompletionPercentage(profile: any): number {
    let score = 0;
    const totalWeight = 100;

    // Section 1: Company Info (25%)
    if (profile.companyName) score += 5;
    if (profile.logoUrl) score += 5;
    if (profile.website) score += 5;
    if (profile.industry) score += 5;
    if (profile.description) score += 5;

    // Section 2: Campaign Goals (20%)
    if (profile.primaryGoals && profile.primaryGoals.length > 0) score += 10;
    if (profile.targetPlatforms && profile.targetPlatforms.length > 0) score += 10;

    // Section 3: Products (20%)
    if (profile.products && profile.products.length > 0) score += 20;

    // Section 4: Target Influencers (20%)
    if (profile.creatorTiers && profile.creatorTiers.length > 0) score += 10;
    if (profile.campaignBudget) score += 10;

    // Section 5: Escrow (15%)
    if (profile.escrowSetup) score += 15;

    return Math.min(score, totalWeight);
  }
}
