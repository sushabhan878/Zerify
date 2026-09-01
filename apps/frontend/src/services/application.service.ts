import { apiRequest } from './api';

export interface CampaignApplicationItem {
  id: string;
  campaignId: string;
  influencerProfileId: string;
  socialAccountId: string;
  status:
    | 'APPLIED'
    | 'UNDER_REVIEW'
    | 'SHORTLISTED'
    | 'REJECTED'
    | 'WITHDRAWN'
    | 'EXPIRED'
    | 'OFFER_SENT'
    | 'OFFER_ACCEPTED'
    | 'OFFER_DECLINED'
    | 'OFFER_EXPIRED';
  applicationMessage?: string;
  proposedAmount?: number;
  proposedCurrency?: string;
  contentIdea?: string;
  portfolioUrls?: string[];
  matchSnapshot?: {
    score: number;
    eligibility: string;
    reasons: any[];
    calculatedAt: string;
  };
  profileSnapshot?: {
    displayName: string;
    username: string;
    platform: string;
    followersCount: number;
    engagementRate: number;
    categories: string[];
    location: any;
  };
  reviewNotes?: string;
  submittedAt: string;
  campaign?: any;
  influencerProfile?: any;
  socialAccount?: any;
  offers?: any[];
}

export const ApplicationService = {
  // Influencer Apply
  async applyToCampaign(campaignId: string, data: {
    socialAccountId: string;
    applicationMessage?: string;
    proposedAmount?: number;
    proposedCurrency?: string;
    contentIdea?: string;
    portfolioUrls?: string[];
  }): Promise<CampaignApplicationItem> {
    return apiRequest(`/campaigns/${campaignId}/applications`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Influencer My Applications
  async getMyApplications(): Promise<CampaignApplicationItem[]> {
    return apiRequest('/influencer/my-applications');
  },

  // Influencer Withdraw
  async withdrawApplication(applicationId: string): Promise<CampaignApplicationItem> {
    return apiRequest(`/applications/${applicationId}/withdraw`, {
      method: 'POST',
    });
  },

  // Brand: List Applications for Campaign
  async getCampaignApplications(campaignId: string, status?: string): Promise<CampaignApplicationItem[]> {
    const url = status
      ? `/campaigns/${campaignId}/applications?status=${status}`
      : `/campaigns/${campaignId}/applications`;
    return apiRequest(url);
  },

  // Brand: List Applications Across All Campaigns
  async getBrandApplications(status?: string): Promise<CampaignApplicationItem[]> {
    const url = status ? `/brand/applications?status=${status}` : `/brand/applications`;
    return apiRequest(url);
  },

  async getApplicationDetails(applicationId: string): Promise<CampaignApplicationItem> {
    return apiRequest(`/applications/${applicationId}`);
  },

  // Brand: Review actions
  async markUnderReview(applicationId: string, notes?: string): Promise<CampaignApplicationItem> {
    return apiRequest(`/applications/${applicationId}/review`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  async shortlistApplication(applicationId: string): Promise<CampaignApplicationItem> {
    return apiRequest(`/applications/${applicationId}/shortlist`, {
      method: 'POST',
    });
  },

  async rejectApplication(applicationId: string, notes?: string): Promise<CampaignApplicationItem> {
    return apiRequest(`/applications/${applicationId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },
};
