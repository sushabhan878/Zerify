import { apiRequest } from './api';

export interface ParticipantDeliverableItem {
  id: string;
  campaignId: string;
  participantId: string;
  platform?: string;
  type: string;
  title?: string;
  description?: string;
  quantity: number;
  dueDate?: string;
  status:
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'SUBMITTED'
    | 'REVISION_REQUESTED'
    | 'APPROVED'
    | 'READY_TO_PUBLISH'
    | 'PUBLISHED'
    | 'VERIFIED'
    | 'DELIVERABLE_REJECTED';
  contentUrls: string[];
  submissionNotes?: string;
  submittedAt?: string;
  reviewStatus?: string;
  reviewComments?: string;
  revisionCount: number;
  publishedUrl?: string;
  publishedAt?: string;
  proofUrls?: string[];
  verifiedAt?: string;
  revisions?: any[];
  participant?: any;
}

export const DeliverableService = {
  // Get deliverables for participant
  async getParticipantDeliverables(participantId: string): Promise<ParticipantDeliverableItem[]> {
    return apiRequest(`/participants/${participantId}/deliverables`);
  },

  async getDeliverableDetails(deliverableId: string): Promise<ParticipantDeliverableItem> {
    return apiRequest(`/deliverables/${deliverableId}`);
  },

  // Influencer: Submit draft
  async submitDraft(deliverableId: string, data: {
    contentUrls: string[];
    notes?: string;
  }): Promise<ParticipantDeliverableItem> {
    return apiRequest(`/deliverables/${deliverableId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Brand: Review draft
  async reviewDeliverable(deliverableId: string, data: {
    decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';
    comments?: string;
  }): Promise<ParticipantDeliverableItem> {
    return apiRequest(`/deliverables/${deliverableId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Influencer: Submit published live URL
  async publishDeliverable(deliverableId: string, data: {
    publishedUrl: string;
    proofUrls?: string[];
  }): Promise<ParticipantDeliverableItem> {
    return apiRequest(`/deliverables/${deliverableId}/publish`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Brand: Verify publication
  async verifyDeliverable(deliverableId: string): Promise<ParticipantDeliverableItem> {
    return apiRequest(`/deliverables/${deliverableId}/verify`, {
      method: 'POST',
    });
  },

  // Influencer: Collaborations
  async getMyCollaborations(): Promise<any[]> {
    return apiRequest('/influencer/my-collaborations');
  },

  // Brand: Get campaign participants
  async getCampaignParticipants(campaignId: string): Promise<any[]> {
    return apiRequest(`/campaigns/${campaignId}/participants`);
  },

  async getParticipantDetails(participantId: string): Promise<any> {
    return apiRequest(`/participants/${participantId}`);
  },
};
