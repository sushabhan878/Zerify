import { apiRequest } from './api';

export interface OverviewCampaign {
  id: string;
  title: string;
  status: string;
  platforms: string[];
  createdAt: string;
  paidOutAmount: number;
  currency: string;
  applications: { id: string; status: string; submittedAt: string }[];
  participants: {
    id: string;
    influencerProfileId: string;
    name: string | null;
    status: string;
    joinedAt: string;
    deliverables: { id: string; status: string }[];
  }[];
}

export interface BrandOverviewData {
  updatedAt: string;
  campaigns: OverviewCampaign[];
}

export const BrandOverviewService = {
  getOverview: () => apiRequest<BrandOverviewData>('/brand/analytics/overview'),
};
