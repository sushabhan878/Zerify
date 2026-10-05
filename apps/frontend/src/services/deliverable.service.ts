import { apiRequest } from './api';
import type { DeliverableRequirements, SubmissionVersion } from './deliverable-workflow';

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
  version: number;
  requirements?: DeliverableRequirements;
  verificationStatus?: string;
  revisions?: SubmissionVersion[];
  events?: { id: string; eventType: string; actorRole: string; createdAt: string }[];
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

  async submitDraft(deliverableId: string, data: {
    submissionType: 'FILE' | 'PUBLISHED_URL'; isFinal: boolean;
    expectedVersion: number; confirmed: boolean; assetIds?: string[];
    publishedUrl?: string; caption?: string; notes?: string;
  }): Promise<ParticipantDeliverableItem> {
    return apiRequest(`/deliverables/${deliverableId}/submit`, { method: 'POST', body: JSON.stringify(data) });
  },

  async reviewDeliverable(deliverableId: string, data: {
    decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED'; expectedVersion: number; comments?: string;
  }): Promise<ParticipantDeliverableItem> {
    return apiRequest(`/deliverables/${deliverableId}/review`, { method: 'POST', body: JSON.stringify(data) });
  },

  async publishDeliverable(deliverableId: string, data: { publishedUrl: string; expectedVersion: number }): Promise<ParticipantDeliverableItem> {
    return apiRequest(`/deliverables/${deliverableId}/publish`, { method: 'POST', body: JSON.stringify(data) });
  },

  async verifyDeliverable(deliverableId: string, expectedVersion: number): Promise<ParticipantDeliverableItem> {
    return apiRequest(`/deliverables/${deliverableId}/verify`, { method: 'POST', body: JSON.stringify({ expectedVersion, confirmed: true }) });
  },

  async upload(deliverableId: string, file: File): Promise<{ id: string; filename: string; size: number; duration?: number }> {
    const body = new FormData(); body.append('file', file);
    return apiRequest(`/deliverables/${deliverableId}/upload`, { method: 'POST', body });
  },

  async getAssetUrl(deliverableId: string, assetId: string): Promise<{ url: string }> {
    return apiRequest(`/deliverables/${deliverableId}/assets/${assetId}`);
  },

  async start(participantId: string) {
    return apiRequest(`/participants/${participantId}/start`, { method: 'POST' });
  },

  async completeParticipant(participantId: string) {
    return apiRequest(`/participants/${participantId}/complete`, { method: 'POST' });
  },

  async cancelParticipant(participantId: string) {
    return apiRequest(`/participants/${participantId}/cancel`, { method: 'POST' });
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

