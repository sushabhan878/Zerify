import { ForbiddenException } from '@nestjs/common';
import { BrandOverviewController } from './brand-overview.controller';
import { BrandOverviewRepository } from './brand-overview.repository';
import { BrandOverviewService } from './brand-overview.service';
import { PrismaService } from '../../database/prisma.service';
import { INBOUND_APPLICATIONS_WHERE } from '../campaign/campaign.repository';

describe('Brand overview', () => {
  const findCampaigns = jest.fn();
  const service = new BrandOverviewService({ findCampaigns } as unknown as BrandOverviewRepository);

  beforeEach(() => jest.clearAllMocks());

  it('returns an empty overview when the brand has no campaigns', async () => {
    findCampaigns.mockResolvedValue([]);
    expect((await service.getOverview('brand-user')).campaigns).toEqual([]);
    expect(findCampaigns).toHaveBeenCalledWith('brand-user');
  });

  it('uses recorded payouts in major units and returns zero when finance is missing', async () => {
    findCampaigns.mockResolvedValue([
      { id: 'paid', finance: { currency: 'INR', paidOutAmountMinor: 125050n }, participants: [
        { id: 'creator', influencerProfile: { user: { name: 'Creator' } } },
      ] },
      { id: 'unpaid', finance: null, participants: [] },
    ]);
    const result = await service.getOverview('brand-user');
    expect(result.campaigns[0]).toMatchObject({ paidOutAmount: 1250.5, currency: 'INR', participants: [{ name: 'Creator' }] });
    expect(result.campaigns[0]).not.toHaveProperty('finance');
    expect(result.campaigns[1]).toMatchObject({ paidOutAmount: 0 });
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('restricts the database query to the authenticated owner and excludes direct invites from applications', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new BrandOverviewRepository({ campaign: { findMany } } as unknown as PrismaService);
    await repository.findCampaigns('owner-id');
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { brandProfile: { userId: 'owner-id' } },
      select: expect.objectContaining({ applications: expect.objectContaining({ where: INBOUND_APPLICATIONS_WHERE }) }),
    }));
  });

  it('rejects a non-brand caller before querying data', () => {
    const controller = new BrandOverviewController(service);
    expect(() => controller.getOverview({ user: { id: 'creator', role: 'INFLUENCER' } })).toThrow(ForbiddenException);
    expect(findCampaigns).not.toHaveBeenCalled();
  });
});
