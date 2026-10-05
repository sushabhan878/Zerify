import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a campaign review' })
  async submitReview(@Req() req: any, @Body() dto: SubmitReviewDto) {
    return this.reviewService.submitReview(req.user.id, dto);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get review questions by type' })
  @ApiQuery({ name: 'type', enum: ['BRAND_TO_INFLUENCER', 'INFLUENCER_TO_BRAND'] })
  async getReviewQuestions(
    @Query('type') type: 'BRAND_TO_INFLUENCER' | 'INFLUENCER_TO_BRAND',
  ) {
    return this.reviewService.getReviewQuestions(type);
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'Get all reviews for a campaign' })
  async getCampaignReviews(@Param('campaignId') campaignId: string) {
    return this.reviewService.getCampaignReviews(campaignId);
  }

  @Get('campaign/:campaignId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user has already reviewed this campaign' })
  async getReviewStatus(
    @Param('campaignId') campaignId: string,
    @Req() req: any,
  ) {
    return this.reviewService.getReviewStatus(campaignId, req.user.id);
  }

  @Get('influencer/:influencerId/rating')
  @ApiOperation({ summary: 'Get average rating for an influencer' })
  async getInfluencerRating(@Param('influencerId') influencerId: string) {
    return this.reviewService.getInfluencerAverageRating(influencerId);
  }

  @Get('brand/:brandId/rating')
  @ApiOperation({ summary: 'Get average rating for a brand' })
  async getBrandRating(@Param('brandId') brandId: string) {
    return this.reviewService.getBrandAverageRating(brandId);
  }
}
