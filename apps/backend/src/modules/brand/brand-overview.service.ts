import { Injectable } from '@nestjs/common';
import { BrandOverviewRepository } from './brand-overview.repository';
import { fromMinor } from '../payment/money.util';

@Injectable()
export class BrandOverviewService {
  constructor(private readonly repository: BrandOverviewRepository) {}

  async getOverview(userId: string) {
    const campaigns = await this.repository.findCampaigns(userId);
    return {
      updatedAt: new Date().toISOString(),
      campaigns: campaigns.map(({ finance, participants, ...campaign }) => ({
        ...campaign,
        // Finance stores minor units. Budget and agreed compensation are not spend.
        paidOutAmount: finance ? Number(fromMinor(Number(finance.paidOutAmountMinor), finance.currency)) : 0,
        currency: finance?.currency ?? 'INR',
        participants: participants.map(({ influencerProfile, ...participant }) => ({
          ...participant,
          name: influencerProfile.user.name || null,
        })),
      })),
    };
  }
}
