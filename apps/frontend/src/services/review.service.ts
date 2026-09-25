import { apiRequest } from './api';

export interface ReviewQuestion {
  id: string;
  text: string;
  category: string | null;
  reviewType: string;
  isActive: boolean;
  order: number;
}

export interface ReviewRating {
  id: string;
  questionId: string;
  question: ReviewQuestion;
  rating: number;
}

export interface CampaignReviewItem {
  id: string;
  campaignId: string;
  reviewType: 'BRAND_TO_INFLUENCER' | 'INFLUENCER_TO_BRAND';
  overallRating: number;
  comment: string | null;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  ratings: ReviewRating[];
  reviewerUser?: { id: string; name: string | null; email: string } | null;
  revieweeInfluencer?: { id: string; handle: string | null; avatarUrl: string | null } | null;
  revieweeBrand?: { id: string; companyName: string | null; logoUrl: string | null } | null;
}

export interface ReviewStatusResponse {
  hasBrandReview: boolean;
  hasInfluencerReview: boolean;
}

export interface ReviewRatingInput {
  questionId: string;
  rating: number;
}

export interface SubmitReviewPayload {
  campaignId: string;
  reviewType: 'BRAND_TO_INFLUENCER' | 'INFLUENCER_TO_BRAND';
  revieweeInfluencerId?: string;
  revieweeBrandId?: string;
  comment?: string;
  ratings: ReviewRatingInput[];
}

export interface AverageRating {
  averageRating: number;
  totalReviews: number;
}

export class ReviewService {
  static async getReviewQuestions(
    type: 'BRAND_TO_INFLUENCER' | 'INFLUENCER_TO_BRAND',
  ): Promise<ReviewQuestion[]> {
    return apiRequest<ReviewQuestion[]>(`/reviews/questions?type=${type}`);
  }

  static async submitReview(payload: SubmitReviewPayload): Promise<CampaignReviewItem> {
    return apiRequest<CampaignReviewItem>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async getCampaignReviews(campaignId: string): Promise<CampaignReviewItem[]> {
    return apiRequest<CampaignReviewItem[]>(`/reviews/campaign/${campaignId}`);
  }

  static async getReviewStatus(
    campaignId: string,
  ): Promise<ReviewStatusResponse> {
    return apiRequest<ReviewStatusResponse>(`/reviews/campaign/${campaignId}/status`);
  }

  static async getInfluencerRating(influencerId: string): Promise<AverageRating> {
    return apiRequest<AverageRating>(`/reviews/influencer/${influencerId}/rating`);
  }

  static async getBrandRating(brandId: string): Promise<AverageRating> {
    return apiRequest<AverageRating>(`/reviews/brand/${brandId}/rating`);
  }
}
