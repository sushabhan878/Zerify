import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { CampaignLifecycleService } from './campaign-lifecycle.service';
import { CampaignOwnerGuard } from './guards/campaign-owner.guard';
import { buildCampaignUpdate, campaignChanges } from './campaign-edit.utils';
import { OUTBOX_EVENTS } from '../messaging/events/messaging-events';
import { buildSystemMetadata, renderSystemMessage } from '../messaging/events/system-message.templates';

describe('Campaign editing and soft deletion', () => {
  const original = {
    id: 'campaign', title: 'Original title', status: CampaignStatus.OPEN,
    brandProfileId: 'brand', brandProfile: { userId: 'brand-user', companyName: 'Brand' },
    targetParticipants: 2, maxParticipants: 4, description: 'Original brief',
    product: null, requirement: null, deliverables: [],
    applicationDeadline: new Date('2026-10-30'), startDate: new Date('2026-11-01'), endDate: new Date('2026-11-20'),
  };
  let tx: any;
  let prisma: any;
  let outbox: any;
  let service: CampaignLifecycleService;

  beforeEach(() => {
    tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      campaign: {
        findUnique: jest.fn().mockResolvedValue(original),
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn(async ({ data }) => ({ ...original, ...data })),
      },
      campaignApplication: { findMany: jest.fn().mockResolvedValue([
        { id: 'app-a', influencerProfile: { userId: 'creator-a' } },
        { id: 'app-b', influencerProfile: { userId: 'creator-b' } },
      ]) },
      campaignParticipant: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockResolvedValue([
          { applicationId: 'app-a', influencerProfile: { userId: 'creator-a' } },
          { applicationId: 'invite-c', influencerProfile: { userId: 'creator-c' } },
        ]),
      },
    };
    prisma = { $transaction: jest.fn((callback) => callback(tx)) };
    outbox = { enqueue: jest.fn().mockResolvedValue({}) };
    service = new CampaignLifecycleService(prisma, outbox);
  });

  it('queues one update per creator, including collaborators, with specific before/after values', async () => {
    await service.update('campaign', { description: 'New brief' });
    expect(outbox.enqueue).toHaveBeenCalledTimes(3);
    expect(outbox.enqueue).toHaveBeenCalledWith(tx, OUTBOX_EVENTS.CAMPAIGN_UPDATED, 'campaign', expect.objectContaining({
      influencerUserId: 'creator-a', changes: [{ field: 'Description', before: 'Original brief', after: 'New brief' }],
    }));
    expect(tx.campaign.update).toHaveBeenCalledWith(expect.objectContaining({ data: { description: 'New brief' } }));
  });

  it('does not notify when the saved values have not changed', async () => {
    await service.update('campaign', { description: 'Original brief' });
    expect(outbox.enqueue).not.toHaveBeenCalled();
  });

  it('retains the campaign and only changes its status and closes applications on deletion', async () => {
    const result = await service.delete('campaign');
    expect(result.status).toBe(CampaignStatus.DELETED);
    expect(tx.campaign.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: CampaignStatus.DELETED, applicationsClosedAt: expect.any(Date) } }));
    expect(outbox.enqueue).toHaveBeenCalledTimes(3);
    expect(outbox.enqueue.mock.calls.every((call: any[]) => call[1] === OUTBOX_EVENTS.CAMPAIGN_DELETED)).toBe(true);
  });

  it('does not send duplicate deletion notices when a request is retried', async () => {
    tx.campaign.findUnique.mockResolvedValue({ ...original, status: CampaignStatus.DELETED });
    await service.delete('campaign');
    expect(tx.campaign.update).not.toHaveBeenCalled();
    expect(outbox.enqueue).not.toHaveBeenCalled();
  });

  it('rejects edits to deleted campaigns', async () => {
    tx.campaign.findUnique.mockResolvedValue({ ...original, status: CampaignStatus.DELETED });
    await expect(service.update('campaign', { title: 'Resurrected' })).rejects.toThrow(BadRequestException);
    expect(tx.campaign.update).not.toHaveBeenCalled();
  });

  it('rejects a partial date change that conflicts with existing dates', async () => {
    await expect(service.update('campaign', { startDate: '2026-10-01' })).rejects.toThrow('Application deadline must be before');
    expect(tx.campaign.update).not.toHaveBeenCalled();
  });

  it('does not reduce capacity below existing collaborators', async () => {
    tx.campaignParticipant.count.mockResolvedValue(5);
    await expect(service.update('campaign', { maxParticipants: 3 })).rejects.toThrow('existing collaborators');
    expect(tx.campaign.update).not.toHaveBeenCalled();
  });

  it('propagates notification failures from inside the mutation transaction so it can roll back', async () => {
    outbox.enqueue.mockRejectedValue(new Error('outbox unavailable'));
    await expect(service.delete('campaign')).rejects.toThrow('outbox unavailable');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(outbox.enqueue.mock.calls[0][0]).toBe(tx);
  });

  it('updates product and creator requirements through their relations without touching accepted participants', () => {
    const update: any = buildCampaignUpdate({ productName: 'New product', requirements: { social: { minFollowers: 5000 }, influencer: { countries: [] } }, deliverables: [{ type: 'Reel', quantity: 2 }] }, original);
    expect(update.product.upsert.update.productName).toBe('New product');
    expect(update.requirement.upsert.update).toEqual({ minFollowers: 5000, targetCountries: [] });
    expect(update.deliverables.create).toEqual([{ type: 'Reel', quantity: 2 }]);
    expect(update).not.toHaveProperty('participants');
  });

  it('describes requirement and deliverable changes without database identifiers', () => {
    const changes = campaignChanges({ ...original, requirement: { minFollowers: 1000 } }, {
      ...original, requirement: { minFollowers: 5000 }, deliverables: [{ id: 'secret-id', type: 'Reel', quantity: 2 }],
    });
    expect(changes).toContainEqual({ field: 'Creator requirements · Min Followers', before: '1000', after: '5000' });
    expect(changes).toContainEqual({ field: 'Deliverable 1 · Quantity', before: '—', after: '2' });
    expect(JSON.stringify(changes)).not.toContain('secret-id');
  });

  it('renders changed values in system messages and preserves structured change metadata', () => {
    const payload = { applicationId: 'app-a', campaignId: 'campaign', campaignTitle: 'Launch', brandUserId: 'brand', influencerUserId: 'creator', actor: 'BRAND' as const, changes: [{ field: 'Description', before: 'Before', after: 'After' }] };
    const message = renderSystemMessage(OUTBOX_EVENTS.CAMPAIGN_UPDATED, payload)!;
    expect(message.text).toContain('Description: Before → After');
    expect(buildSystemMetadata(OUTBOX_EVENTS.CAMPAIGN_UPDATED, payload, message.messageKey)).toMatchObject({ changes: payload.changes });
    expect(renderSystemMessage(OUTBOX_EVENTS.CAMPAIGN_DELETED, payload)!.text).toContain('deleted the campaign "Launch"');
  });

  it('rejects a user who does not own the campaign', async () => {
    const guard = new CampaignOwnerGuard({ campaign: { findUnique: jest.fn().mockResolvedValue(original) } } as any);
    await expect(guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { id: 'outsider', role: 'BRAND' }, params: { id: 'campaign' } }) }) } as any)).rejects.toThrow(ForbiddenException);
  });
});
