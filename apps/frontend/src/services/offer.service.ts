import { apiRequest } from './api';

export interface CampaignOfferItem {
  id: string;
  campaignId: string;
  applicationId: string;
  influencerProfileId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'OFFER_EXPIRED' | 'CANCELLED';
  compensationAmount: number;
  compensationCurrency: string;
  compensationPaymentModel: string;
  startDate?: string;
  endDate?: string;
  responseDeadline?: string;
  termsSnapshot?: any;
  customNotes?: string;
  sentAt: string;
  application?: any;
  participant?: any;
}

export const OfferService = {
  // Brand: Send Offer
  async sendOffer(applicationId: string, data: {
    compensationAmount: number;
    compensationCurrency?: string;
    compensationPaymentModel?: string;
    startDate?: string;
    endDate?: string;
    responseDeadline?: string;
    customNotes?: string;
    isCounterOffer?: boolean;
  }): Promise<CampaignOfferItem> {
    return apiRequest(`/applications/${applicationId}/offers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getOfferDetails(offerId: string): Promise<CampaignOfferItem> {
    return apiRequest(`/offers/${offerId}`);
  },

  // Influencer: Accept / Decline
  async acceptOffer(offerId: string): Promise<{ offer: CampaignOfferItem; participant: any }> {
    return apiRequest(`/offers/${offerId}/accept`, {
      method: 'POST',
    });
  },

  async declineOffer(offerId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/offers/${offerId}/decline`, {
      method: 'POST',
    });
  },

  async counterOffer(
    offerId: string,
    data: { proposedAmount: number; proposedCurrency?: string; message?: string },
  ): Promise<CampaignOfferItem> {
    return apiRequest(`/offers/${offerId}/counter`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async cancelCounterOffer(offerId: string): Promise<CampaignOfferItem> {
    return apiRequest(`/offers/${offerId}/cancel-counter`, {
      method: 'POST',
    });
  },

  // Brand: Cancel
  async cancelOffer(offerId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/offers/${offerId}/cancel`, {
      method: 'POST',
    });
  },

  // Influencer: List My Offers
  async getMyOffers(): Promise<CampaignOfferItem[]> {
    return apiRequest('/influencer/my-offers');
  },

  // Brand: List Offers for Campaign
  async getCampaignOffers(campaignId: string): Promise<CampaignOfferItem[]> {
    return apiRequest(`/campaigns/${campaignId}/offers`);
  },

  // Brand: Direct Invite Creator to Campaign
  async inviteCreatorToCampaign(campaignId: string, data: {
    influencerProfileId: string;
    compensationAmount: number;
    compensationCurrency?: string;
    compensationPaymentModel?: string;
    customNotes?: string;
    startDate?: string;
    endDate?: string;
    responseDeadline?: string;
  }): Promise<CampaignOfferItem> {
    return apiRequest(`/campaigns/${campaignId}/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Brand: Get list of campaign IDs where creator is already invited
  async getInvitedCampaignIds(creatorId: string): Promise<string[]> {
    try {
      const res = await apiRequest(`/creators/${creatorId}/invited-campaign-ids`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },
};
