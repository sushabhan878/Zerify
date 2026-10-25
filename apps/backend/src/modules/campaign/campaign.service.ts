import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { CampaignLifecycleService } from './campaign-lifecycle.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CampaignService {
  constructor(
    private readonly repository: CampaignRepository,
    private readonly prisma: PrismaService,
    private readonly lifecycle: CampaignLifecycleService,
  ) {}

  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return `${baseSlug}-${randomSuffix}`;
  }

  async createCampaign(userId: string, dto: CreateCampaignDto) {
    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });

    if (!brandProfile) {
      throw new ForbiddenException('You must have a brand profile to create campaigns');
    }

    // Check if a campaign with this title already exists for this brand
    const existingCampaign = await this.prisma.campaign.findFirst({
      where: {
        brandProfileId: brandProfile.id,
        status: { not: CampaignStatus.DELETED },
        title: {
          equals: dto.title.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingCampaign) {
      throw new BadRequestException(`A campaign named "${dto.title.trim()}" already exists. Please choose a unique name.`);
    }

    // Business Rules Validation
    if (dto.applicationDeadline && dto.startDate) {
      if (new Date(dto.applicationDeadline) >= new Date(dto.startDate)) {
        throw new BadRequestException('Application deadline must be before campaign start date');
      }
    }

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) >= new Date(dto.endDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    if (dto.targetParticipants && dto.maxParticipants) {
      if (dto.maxParticipants < dto.targetParticipants) {
        throw new BadRequestException('Maximum participants must be greater than or equal to target participants');
      }
    }

    const slug = this.generateSlug(dto.title);

    const { deliverables, ...campaignData } = dto;

    const objectives: string[] = Array.isArray(campaignData.objective)
      ? campaignData.objective
      : campaignData.objective
      ? [campaignData.objective as string]
      : Array.isArray((campaignData as any).categories)
      ? (campaignData as any).categories
      : [];

    const hasProductData = Boolean(
      campaignData.productName ||
      campaignData.productType ||
      campaignData.landingPageUrl ||
      campaignData.hasFreeProduct !== undefined ||
      campaignData.freeProductValue !== undefined ||
      campaignData.shippingDetails ||
      campaignData.productInstructions
    );

    const req = campaignData.requirements as any;
    const social = req?.social;
    const inf = req?.influencer;
    const aud = req?.audience;
    const targetAgeGroup: string[] = Array.isArray(aud?.targetAgeGroup)
      ? aud.targetAgeGroup
      : Array.isArray(req?.targetAgeGroup)
      ? req.targetAgeGroup
      : Array.isArray(req?.targetAgeGroups)
      ? req.targetAgeGroups
      : Array.isArray(inf?.ageRanges)
      ? inf.ageRanges
      : typeof aud?.targetAgeGroup === 'string'
      ? [aud.targetAgeGroup]
      : [];

    const hasRequirementData = Boolean(
      req?.strictEligibility !== undefined ||
      social?.minFollowers !== undefined ||
      social?.minEngagementRate !== undefined ||
      social?.verifiedOnly !== undefined ||
      (inf?.countries && inf.countries.length > 0) ||
      (inf?.genders && inf.genders.length > 0) ||
      (inf?.languages && inf.languages.length > 0) ||
      (aud?.countries && aud.countries.length > 0) ||
      targetAgeGroup.length > 0
    );

    const campaign = await this.repository.createCampaign({
      brandProfile: { connect: { id: brandProfile.id } },
      title: campaignData.title,
      slug,
      objective: objectives,
      description: campaignData.description,
      industry: campaignData.industry,
      coverImageUrl: campaignData.coverImageUrl,
      platforms: campaignData.platforms || [],
      budgetTotalAmount: campaignData.budgetTotalAmount,
      budgetCurrency: campaignData.budgetCurrency || 'USD',
      budgetPaymentModel: campaignData.budgetPaymentModel,
      budgetMinPerInfluencer: campaignData.budgetMinPerInfluencer,
      budgetMaxPerInfluencer: campaignData.budgetMaxPerInfluencer,
      performanceMetric: campaignData.performanceMetric,
      performanceRate: campaignData.performanceRate,
      barterItems: campaignData.barterItems,
      shippingCovered: campaignData.shippingCovered,
      targetParticipants: campaignData.targetParticipants || 1,
      maxParticipants: campaignData.maxParticipants || 1,
      autoCloseWhenFilled: campaignData.autoCloseWhenFilled ?? false,
      contentGuidelines: campaignData.contentGuidelines ? (campaignData.contentGuidelines as any) : undefined,
      applicationDeadline: campaignData.applicationDeadline ? new Date(campaignData.applicationDeadline) : undefined,
      startDate: campaignData.startDate ? new Date(campaignData.startDate) : undefined,
      endDate: campaignData.endDate ? new Date(campaignData.endDate) : undefined,
      status: CampaignStatus.DRAFT,
      ...(hasProductData
        ? {
            product: {
              create: {
                productName: campaignData.productName || campaignData.title,
                productType: campaignData.productType,
                landingPageUrl: campaignData.landingPageUrl,
                coverImageUrl: campaignData.coverImageUrl,
                hasFreeProduct: campaignData.hasFreeProduct ?? false,
                freeProductValue: campaignData.freeProductValue,
                shippingDetails: campaignData.shippingDetails,
                productInstructions: campaignData.productInstructions,
              },
            },
          }
        : {}),
      ...(hasRequirementData
        ? {
            requirement: {
              create: {
                strictEligibility: req?.strictEligibility ?? false,
                minFollowers: social?.minFollowers,
                minEngagementRate: social?.minEngagementRate,
                verifiedOnly: social?.verifiedOnly ?? false,
                targetCountries: inf?.countries || [],
                targetGenders: inf?.genders || [],
                targetLanguages: inf?.languages || [],
                targetAgeGroup,
                audienceCountries: aud?.countries || [],
              },
            },
          }
        : {}),
      ...(deliverables && deliverables.length > 0
        ? {
            deliverables: {
              create: deliverables.map((d) => ({
                platform: d.platform,
                type: d.type,
                title: d.title,
                description: d.description,
                quantity: d.quantity || 1,
                dueDate: d.dueDate ? new Date(d.dueDate) : undefined,
                requiredCta: d.requiredCta,
                mandatoryHashtags: d.mandatoryHashtags || [],
                mandatoryMentions: d.mandatoryMentions || [],
                instructions: d.instructions,
                revisionLimit: d.revisionLimit ?? 2,
                requiresPreApproval: d.requiresPreApproval,
                requiresPublication: d.requiresPublication,
                allowLateSubmission: d.allowLateSubmission,
                maxFileSizeMb: d.maxFileSizeMb,
                allowedMimeTypes: d.allowedMimeTypes,
                publicationDeadline: d.publicationDeadline ? new Date(d.publicationDeadline) : undefined,
              })),
            },
          }
        : {}),
    });

    return campaign;
  }

  async listBrandCampaigns(userId: string) {
    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!brandProfile) {
      throw new ForbiddenException('Brand profile not found for user');
    }
    return this.repository.listCampaignsByBrand(brandProfile.id);
  }

  async getCampaignDetails(campaignId: string) {
    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async updateCampaign(campaignId: string, dto: UpdateCampaignDto) {
    return this.lifecycle.update(campaignId, dto);
  }

  async publishCampaign(campaignId: string) {
    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT campaigns can be published');
    }

    // Required fields check before publish
    if (!campaign.title || !campaign.description) {
      throw new BadRequestException('Title and description are required to publish');
    }

    return this.repository.updateCampaignStatus(campaignId, CampaignStatus.OPEN, {
      publishedAt: new Date(),
    });
  }

  async pauseCampaign(campaignId: string) {
    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (![CampaignStatus.OPEN, CampaignStatus.FILLING, CampaignStatus.ACTIVE].includes(campaign.status as any)) {
      throw new BadRequestException(`Cannot pause a campaign with status ${campaign.status}`);
    }


    return this.repository.updateCampaignStatus(campaignId, CampaignStatus.PAUSED);
  }

  async closeApplications(campaignId: string) {
    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status === CampaignStatus.DELETED) throw new BadRequestException('Campaign has been deleted');
    return this.repository.updateCampaignStatus(campaignId, campaign.status, {
      applicationsClosedAt: new Date(),
    });
  }

  async cancelCampaign(campaignId: string) {
    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status === CampaignStatus.DELETED) throw new BadRequestException('Campaign has been deleted');
    if (campaign.status === CampaignStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed campaign');
    }

    return this.repository.updateCampaignStatus(campaignId, CampaignStatus.CANCELLED, {
      cancelledAt: new Date(),
    });
  }

  async startCampaign(campaignId: string) {
    const campaign = await this.repository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status === CampaignStatus.DELETED || campaign.status === CampaignStatus.CANCELLED) {
      throw new BadRequestException(`Cannot start a ${campaign.status.toLowerCase()} campaign`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedCampaign = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          status: CampaignStatus.ACTIVE,
          startDate: campaign.startDate || new Date(),
        },
      });

      // Activate confirmed participants and their deliverables
      await tx.campaignParticipant.updateMany({
        where: { campaignId, status: 'CONFIRMED' },
        data: { status: 'PARTICIPANT_ACTIVE', startedAt: new Date() },
      });

      const confirmedParticipants = await tx.campaignParticipant.findMany({
        where: { campaignId },
        select: { id: true },
      });

      const participantIds = confirmedParticipants.map((p) => p.id);
      if (participantIds.length > 0) {
        await tx.participantDeliverable.updateMany({
          where: { participantId: { in: participantIds }, status: 'PENDING' },
          data: { status: 'IN_PROGRESS' },
        });
      }

      return updatedCampaign;
    });
  }
}

