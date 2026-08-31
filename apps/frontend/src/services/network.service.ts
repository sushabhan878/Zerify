import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface BrandPartnerResponse {
  id: string;
  brandProfileId: string;
  name: string;
  industry: string;
  logoUrl?: string;
  website?: string;
  location?: string;
  totalDeals: number;
  totalPaid: string;
  rawTotalPaid: number;
  lastWorked: string;
  contactPerson: string;
  contactRole: string;
  verified: boolean;
  relationshipTag: 'PREFERRED' | 'REPEAT_SPONSOR' | 'COMPLETED';
  rating: number;
  notes?: string;
  pastCampaignsList: string[];
}

export const NetworkService = {
  async getMyNetwork(): Promise<BrandPartnerResponse[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
    const response = await axios.get(`${API_BASE}/influencer/my-network`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  async updateRelationshipTag(partnerId: string, tag: 'PREFERRED' | 'REPEAT_SPONSOR' | 'COMPLETED') {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
    const response = await axios.put(
      `${API_BASE}/influencer/my-network/${partnerId}/tag`,
      { tag },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    return response.data;
  },
};
