import { apiRequest } from './api';

export interface CampaignDeliverable {
  id?: string;
  platform?: string;
  type: string;
  title?: string;
  description?: string;
  quantity?: number;
  dueDate?: string;
  requiredCta?: string;
  mandatoryHashtags?: string[];
  mandatoryMentions?: string[];
  instructions?: string;
  revisionLimit?: number;
}

export interface CampaignItem {
  id: string;
  title: string;
  slug: string;
  objective: string[] | string;
  description?: string;
  industry?: string;
  categories?: string[];
  coverImageUrl?: string;
  product?: {
    productName?: string;
    productType?: string;
    landingPageUrl?: string;
    coverImageUrl?: string;
    hasFreeProduct?: boolean;
    freeProductValue?: number;
    shippingDetails?: string;
    productInstructions?: string;
  };
  landingPageUrl?: string;
  requirement?: any;
  status: 'DRAFT' | 'OPEN' | 'FILLING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  platforms: string[];
  requirements?: any;
  budgetTotalAmount?: number;
  budgetCurrency?: string;
  budgetPaymentModel?: string;
  budgetMinPerInfluencer?: number;
  budgetMaxPerInfluencer?: number;
  targetParticipants: number;
  maxParticipants: number;
  autoCloseWhenFilled: boolean;
  contentGuidelines?: any;
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  publishedAt?: string;
  deliverables?: CampaignDeliverable[];
  brandProfile?: {
    id: string;
    companyName: string;
    logoUrl?: string;
    industry?: string;
    location?: string;
  };
  _count?: {
    applications: number;
    participants: number;
  };
  eligibility?: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  matchScore?: number;
  matchReasons?: any[];
}

export const CampaignService = {
  // Brand Endpoints
  async createCampaign(data: any): Promise<CampaignItem> {
    return apiRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getBrandCampaigns(): Promise<CampaignItem[]> {
    return apiRequest('/campaigns');
  },

  async getCampaignDetails(id: string): Promise<CampaignItem> {
    return apiRequest(`/campaigns/${id}`);
  },

  async updateCampaign(id: string, data: any): Promise<CampaignItem> {
    return apiRequest(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async publishCampaign(id: string): Promise<CampaignItem> {
    return apiRequest(`/campaigns/${id}/publish`, {
      method: 'POST',
    });
  },

  async pauseCampaign(id: string): Promise<CampaignItem> {
    return apiRequest(`/campaigns/${id}/pause`, {
      method: 'POST',
    });
  },

  async closeApplications(id: string): Promise<CampaignItem> {
    return apiRequest(`/campaigns/${id}/close-applications`, {
      method: 'POST',
    });
  },

  async cancelCampaign(id: string): Promise<CampaignItem> {
    return apiRequest(`/campaigns/${id}/cancel`, {
      method: 'POST',
    });
  },

  // Discovery Endpoints
  async discoverCampaigns(params: Record<string, any> = {}): Promise<{
    campaigns: CampaignItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return apiRequest(`/campaigns/discover?${query.toString()}`);
  },

  async checkEligibility(campaignId: string): Promise<{
    eligibility: string;
    score: number;
    reasons: any[];
  }> {
    return apiRequest(`/campaigns/${campaignId}/eligibility`);
  },
};
