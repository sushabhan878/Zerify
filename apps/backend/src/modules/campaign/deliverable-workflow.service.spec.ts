import { DeliverableWorkflowService } from './deliverable-workflow.service';
import { DeliverableAccessService } from './deliverable-access.service';
import { DeliverableEventsService } from './deliverable-events.service';

// Exercise real workflow, access checks and audit/outbox production together;
// only the database and message transport are replaced in this unit suite.
describe('deliverable workflow', () => {
  let d: any, tx: any, service: DeliverableWorkflowService, outbox: any;
  beforeEach(() => {
    d = { id: 'd1', campaignId: 'campaign', participantId: 'p1', type: 'Instagram Reel', version: 0,
      status: 'IN_PROGRESS', requirements: {}, revisions: [],
      participant: { id: 'p1', applicationId: 'app', influencerProfileId: 'ip', status: 'PARTICIPANT_ACTIVE',
        influencerProfile: { userId: 'creator' }, campaign: { status: 'ACTIVE', title: 'Launch', brandProfile: { userId: 'brand' } } },
    };
    tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      participantDeliverable: {
        findUnique: jest.fn(async () => d), findUniqueOrThrow: jest.fn(async () => d), findFirst: jest.fn(async () => null),
        findMany: jest.fn(async () => [d]), update: jest.fn(async ({ data }) => { d = { ...d, ...data }; return d; }),
      },
      deliverableAsset: { findMany: jest.fn(async () => [{ id: 'asset', mimeType: 'video/mp4', size: 100 }]) },
      deliverableRevision: {
        create: jest.fn(async ({ data }) => { const r = { id: `v${data.version}`, status: 'SUBMITTED', ...data }; d.revisions.unshift(r); return r; }),
        update: jest.fn(async ({ where, data }) => { const r = d.revisions.find((r: any) => r.id === where.id); Object.assign(r, data); return r; }),
      },
      deliverableEvent: { create: jest.fn(async () => ({})) },
      campaignParticipant: { updateMany: jest.fn(async () => ({ count: 1 })) },
      financialAuditLog: { create: jest.fn(async () => ({})) },
    };
    const prisma = { ...tx, $transaction: (fn: any) => fn(tx) };
    outbox = { enqueue: jest.fn(async () => ({})) };
    service = new DeliverableWorkflowService(prisma as any, new DeliverableAccessService(prisma as any), new DeliverableEventsService(outbox));
  });
  const submit = (overrides = {}) => ({ submissionType: 'FILE' as const, isFinal: true, expectedVersion: 0, confirmed: true, assetIds: ['asset'], ...overrides });
  it('runs submission → revision → new immutable version → approval → publication → verification → eligibility', async () => {
    await service.submit('creator', 'd1', submit());
    expect(d.status).toBe('SUBMITTED'); expect(d.version).toBe(1);
    await service.review('brand', 'd1', { decision: 'REVISION_REQUESTED', expectedVersion: 1, comments: 'Add the product at 00:12' });
    const previous = { ...d.revisions[0] };
    await service.submit('creator', 'd1', submit({ expectedVersion: 1 }));
    expect(d.revisions[1]).toEqual(previous); expect(d.version).toBe(2);
    await service.review('brand', 'd1', { decision: 'APPROVED', expectedVersion: 2 });
    expect(d.status).toBe('READY_TO_PUBLISH');
    expect(tx.campaignParticipant.updateMany).not.toHaveBeenCalled();
    await service.publish('creator', 'd1', { publishedUrl: 'https://instagram.com/reel/post1?tracking=a', expectedVersion: 2 });
    expect(d.status).toBe('PUBLISHED'); expect(d.verificationStatus).toBe('MANUAL_REVIEW_REQUIRED');
    expect(tx.campaignParticipant.updateMany).not.toHaveBeenCalled();
    await service.verify('brand', 'd1', 2);
    expect(d.status).toBe('VERIFIED');
    expect(tx.campaignParticipant.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.financialAuditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'DELIVERABLES_COMPLETE_RELEASE_ELIGIBLE' }) }));
    expect(outbox.enqueue).toHaveBeenCalled();
    expect(tx.deliverableEvent.create).toHaveBeenCalledTimes(7);
  });
  it('draft approval returns to creation rather than completing or publishing', async () => {
    await service.submit('creator', 'd1', submit({ isFinal: false }));
    await service.review('brand', 'd1', { decision: 'APPROVED', expectedVersion: 1 });
    expect(d.status).toBe('IN_PROGRESS');
    expect(tx.campaignParticipant.updateMany).not.toHaveBeenCalled();
    await expect(service.publish('creator', 'd1', { publishedUrl: 'https://instagram.com/reel/a', expectedVersion: 1 })).rejects.toThrow();
  });
  it('completes final file-only work without requiring a URL', async () => {
    d.requirements = { requiresPublication: false };
    await service.submit('creator', 'd1', submit());
    await service.review('brand', 'd1', { decision: 'APPROVED', expectedVersion: 1 });
    expect(d.status).toBe('APPROVED'); expect(tx.campaignParticipant.updateMany).toHaveBeenCalled();
  });
  it('does not complete the assignment if another required deliverable is unfinished', async () => {
    d.requirements = { requiresPublication: false };
    tx.participantDeliverable.findMany.mockResolvedValue([{ status: 'APPROVED', requirements: { requiresPublication: false } }, { status: 'IN_PROGRESS', requirements: {} }]);
    await service.submit('creator', 'd1', submit());
    await service.review('brand', 'd1', { decision: 'APPROVED', expectedVersion: 1 });
    expect(tx.campaignParticipant.updateMany).not.toHaveBeenCalled();
  });
  it('supports post-publication submission but requires manual verification after review', async () => {
    d.requirements = { requiresPreApproval: false };
    await service.submit('creator', 'd1', submit({ submissionType: 'PUBLISHED_URL', assetIds: [], publishedUrl: 'https://instagram.com/reel/a' }));
    await service.review('brand', 'd1', { decision: 'APPROVED', expectedVersion: 1 });
    expect(d.status).toBe('PUBLISHED'); expect(tx.campaignParticipant.updateMany).not.toHaveBeenCalled();
  });
  it('requires preapproval where configured', async () => {
    await expect(service.submit('creator', 'd1', submit({ submissionType: 'PUBLISHED_URL', assetIds: [], publishedUrl: 'https://instagram.com/reel/a' }))).rejects.toThrow('approval');
  });
  it('rejects duplicate campaign URLs', async () => {
    d.requirements = { requiresPreApproval: false };
    tx.participantDeliverable.findFirst.mockResolvedValue({ id: 'other' });
    await expect(service.submit('creator', 'd1', submit({ submissionType: 'PUBLISHED_URL', assetIds: [], publishedUrl: 'https://instagram.com/reel/a' }))).rejects.toThrow('already');
  });
  it('rejects stale versions, repeated submissions and old-version approvals', async () => {
    await service.submit('creator', 'd1', submit());
    await expect(service.submit('creator', 'd1', submit())).rejects.toThrow('changed');
    await expect(service.review('brand', 'd1', { decision: 'APPROVED', expectedVersion: 0 })).rejects.toThrow('changed');
    expect(tx.deliverableRevision.create).toHaveBeenCalledTimes(1);
  });
  it('requires meaningful revision and rejection feedback', async () => {
    await service.submit('creator', 'd1', submit());
    for (const decision of ['REVISION_REQUESTED', 'REJECTED'] as const) {
      await expect(service.review('brand', 'd1', { decision, expectedVersion: 1, comments: '  ' })).rejects.toThrow('feedback');
    }
    expect(tx.deliverableRevision.update).not.toHaveBeenCalled();
  });
  it('enforces creator/brand access including read access', async () => {
    await expect(service.submit('outsider', 'd1', submit())).rejects.toThrow('access');
    await expect(service.submit('brand', 'd1', submit())).rejects.toThrow('access');
    await expect(service.review('creator', 'd1', { decision: 'APPROVED', expectedVersion: 1 })).rejects.toThrow('access');
    expect(tx.deliverableRevision.create).not.toHaveBeenCalled();
  });
  it.each(['CONFIRMED', 'PARTICIPANT_CANCELLED', 'PARTICIPANT_COMPLETED'])('blocks mutation for %s assignments', async status => {
    d.participant.status = status;
    await expect(service.submit('creator', 'd1', submit())).rejects.toThrow();
  });
  it.each(['CANCELLED', 'PAUSED', 'COMPLETED'])('blocks mutation for %s campaigns', async status => {
    d.participant.campaign.status = status;
    await expect(service.submit('creator', 'd1', submit())).rejects.toThrow();
  });
  it('enforces late-submission policy while allowing overdue recovery by default', async () => {
    d.dueDate = new Date('2020-01-01'); d.requirements = { allowLateSubmission: false };
    await expect(service.submit('creator', 'd1', submit())).rejects.toThrow('deadline');
    d.requirements.allowLateSubmission = true;
    await service.submit('creator', 'd1', submit()); expect(d.status).toBe('SUBMITTED');
  });
  it('rejects missing or foreign upload IDs', async () => {
    tx.deliverableAsset.findMany.mockResolvedValue([]);
    await expect(service.submit('creator', 'd1', submit())).rejects.toThrow('file');
    expect(tx.deliverableRevision.create).not.toHaveBeenCalled();
  });
});
