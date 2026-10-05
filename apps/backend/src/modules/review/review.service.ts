import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { CampaignStatus, ReviewType, CampaignReviewStatus } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async submitReview(userId: string, dto: SubmitReviewDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: dto.campaignId },
      include: {
        brandProfile: true,
        participants: {
          include: { influencerProfile: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (
      campaign.status !== CampaignStatus.COMPLETED &&
      campaign.status !== CampaignStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Reviews can only be submitted for completed or cancelled campaigns',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { brandProfile: true, influencer: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.reviewType === 'BRAND_TO_INFLUENCER') {
      if (user.role !== 'BRAND') {
        throw new BadRequestException('Only brands can submit BRAND_TO_INFLUENCER reviews');
      }
      if (!dto.revieweeInfluencerId) {
        throw new BadRequestException('revieweeInfluencerId is required for BRAND_TO_INFLUENCER reviews');
      }
      const isParticipant = campaign.participants.some(
        (p) => p.influencerProfileId === dto.revieweeInfluencerId,
      );
      if (!isParticipant) {
        throw new BadRequestException('The influencer must be a participant of this campaign');
      }
    }

    if (dto.reviewType === 'INFLUENCER_TO_BRAND') {
      if (user.role !== 'INFLUENCER') {
        throw new BadRequestException('Only influencers can submit INFLUENCER_TO_BRAND reviews');
      }
      if (!dto.revieweeBrandId) {
        dto.revieweeBrandId = campaign.brandProfileId;
      }
      const isParticipant = campaign.participants.some(
        (p) => p.influencerProfile?.userId === userId,
      );
      if (!isParticipant && campaign.brandProfileId !== user.brandProfile?.id) {
        throw new BadRequestException('You must be a participant of this campaign to review it');
      }
    }

    const existingReview = await this.prisma.campaignReview.findUnique({
      where: {
        campaignId_reviewerUserId_reviewType: {
          campaignId: dto.campaignId,
          reviewerUserId: userId,
          reviewType: dto.reviewType as ReviewType,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already submitted a review for this campaign');
    }

    const questionIds = dto.ratings.map((r) => r.questionId);
    const questions = await this.prisma.reviewQuestion.findMany({
      where: {
        id: { in: questionIds },
        reviewType: dto.reviewType as ReviewType,
        isActive: true,
      },
    });

    if (questions.length !== dto.ratings.length) {
      throw new BadRequestException('Some question IDs are invalid or inactive');
    }

    const totalRating = dto.ratings.reduce((sum, r) => sum + r.rating, 0);
    const maxPossible = dto.ratings.length * 5;
    const normalizedRating = maxPossible > 0 ? (totalRating / maxPossible) * 5 : 0;
    const overallRating = Math.round(normalizedRating * 100) / 100;

    const review = await this.prisma.campaignReview.create({
      data: {
        campaignId: dto.campaignId,
        reviewType: dto.reviewType as ReviewType,
        reviewerUserId: userId,
        reviewerBrandId: user.brandProfile?.id || null,
        reviewerInfluencerId: user.influencer?.id || null,
        revieweeInfluencerId: dto.revieweeInfluencerId || null,
        revieweeBrandId: dto.revieweeBrandId || null,
        overallRating,
        comment: dto.comment || null,
        status: CampaignReviewStatus.SUBMITTED,
        submittedAt: new Date(),
        ratings: {
          create: dto.ratings.map((r) => ({
            questionId: r.questionId,
            rating: r.rating,
          })),
        },
      },
      include: {
        ratings: {
          include: { question: true },
        },
      },
    });

    return review;
  }

  async getReviewQuestions(reviewType: 'BRAND_TO_INFLUENCER' | 'INFLUENCER_TO_BRAND') {
    return this.prisma.reviewQuestion.findMany({
      where: {
        reviewType: reviewType as ReviewType,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async getCampaignReviews(campaignId: string) {
    return this.prisma.campaignReview.findMany({
      where: { campaignId },
      include: {
        ratings: {
          include: { question: true },
        },
        reviewerUser: {
          select: { id: true, name: true, email: true },
        },
        revieweeInfluencer: {
          select: { id: true, handle: true, avatarUrl: true },
        },
        revieweeBrand: {
          select: { id: true, companyName: true, logoUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReviewStatus(campaignId: string, userId: string) {
    const reviews = await this.prisma.campaignReview.findMany({
      where: {
        campaignId,
        reviewerUserId: userId,
      },
      select: { reviewType: true, status: true },
    });

    return {
      hasBrandReview: reviews.some((r) => r.reviewType === 'BRAND_TO_INFLUENCER'),
      hasInfluencerReview: reviews.some((r) => r.reviewType === 'INFLUENCER_TO_BRAND'),
    };
  }

  async getInfluencerAverageRating(influencerProfileId: string) {
    const result = await this.prisma.campaignReview.aggregate({
      where: {
        revieweeInfluencerId: influencerProfileId,
        status: CampaignReviewStatus.SUBMITTED,
      },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    return {
      averageRating: result._avg.overallRating || 0,
      totalReviews: result._count.id,
    };
  }

  async getBrandAverageRating(brandProfileId: string) {
    const result = await this.prisma.campaignReview.aggregate({
      where: {
        revieweeBrandId: brandProfileId,
        status: CampaignReviewStatus.SUBMITTED,
      },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    return {
      averageRating: result._avg.overallRating || 0,
      totalReviews: result._count.id,
    };
  }
}
