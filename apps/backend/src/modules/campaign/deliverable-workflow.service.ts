import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma, DeliverableStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { DeliverableAccessService, deliverableInclude } from './deliverable-access.service';
import { DeliverableEventsService } from './deliverable-events.service';
import { normalizeSocialUrl, rulesOf } from './deliverable-rules';
import { SubmitDeliverableDto } from './dto/submit-deliverable.dto';
import { ReviewDeliverableDto } from './dto/review-deliverable.dto';
import { PublishDeliverableDto } from './dto/publish-deliverable.dto';

@Injectable()
export class DeliverableWorkflowService {
  constructor(private readonly prisma: PrismaService, private readonly access: DeliverableAccessService, private readonly events: DeliverableEventsService) {}

  // Lock the campaign first: also serializes duplicate URL checks across its
  // creators and completion checks across a participant's deliverables.
  private async mutate(userId: string, id: string, role: 'creator' | 'brand', action: (tx: Prisma.TransactionClient, d: any) => Promise<unknown>) {
    const initial = await this.access.get(userId, id, role);
    return this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM campaigns WHERE id = ${initial.campaignId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM campaign_participants WHERE id = ${initial.participantId} FOR UPDATE`;
      const d = await tx.participantDeliverable.findUniqueOrThrow({ where: { id }, include: deliverableInclude });
      this.access.authorize(userId, d.participant, role);
      this.access.assertActive(d.participant);
      await action(tx, d);
      return tx.participantDeliverable.findUniqueOrThrow({ where: { id }, include: { revisions: { orderBy: { version: 'desc' } }, events: { orderBy: { createdAt: 'desc' } } } });
    });
  }

  private checkVersion(d: any, version: number) {
    if (d.version !== version) throw new ConflictException('This submission has changed. Refresh before continuing.');
  }

  private async checkUrl(tx: Prisma.TransactionClient, d: any, value: string) {
    const normalized = normalizeSocialUrl(value, d.platform, d.type);
    const duplicate = await tx.participantDeliverable.findFirst({ where: {
      campaignId: d.campaignId, id: { not: d.id }, OR: [
        { publishedUrl: normalized.url }, { revisions: { some: { publishedUrl: normalized.url } } },
      ],
    } });
    if (duplicate) throw new ConflictException('This post has already been submitted for this campaign');
    return normalized.url;
  }

  submit(userId: string, id: string, dto: SubmitDeliverableDto) {
    return this.mutate(userId, id, 'creator', async (tx, d) => {
      this.checkVersion(d, dto.expectedVersion);
      if (!['PENDING', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(d.status)) throw new BadRequestException('This deliverable is not accepting submissions');
      if (!dto.confirmed) throw new BadRequestException('Confirm the campaign requirements before submitting');
      const rules = rulesOf(d.requirements);
      if (!rules.allowLateSubmission && d.dueDate && new Date() > d.dueDate) throw new BadRequestException('The submission deadline has passed');
      let publishedUrl: string | undefined;
      const assetIds = [...new Set(dto.assetIds || [])];
      if (dto.submissionType === 'PUBLISHED_URL') {
        if (!dto.isFinal || !dto.publishedUrl || assetIds.length) throw new BadRequestException('Published posts must be final URL-only submissions');
        if (rules.requiresPreApproval) throw new BadRequestException('This deliverable needs file approval before publication');
        publishedUrl = await this.checkUrl(tx, d, dto.publishedUrl);
      } else {
        if (!assetIds.length || dto.publishedUrl) throw new BadRequestException('Upload at least one file before submitting');
        const assets = await tx.deliverableAsset.findMany({ where: { id: { in: assetIds }, deliverableId: id, uploadedBy: userId } });
        if (assets.length !== assetIds.length || assets.some(a => !rules.allowedMimeTypes.includes(a.mimeType) || a.size > rules.maxFileSizeMb * 1024 * 1024)) {
          throw new BadRequestException('A file is missing, belongs to another submission, or does not meet campaign limits');
        }
      }
      const version = d.version + 1;
      const revision = await tx.deliverableRevision.create({ data: {
        deliverableId: id, version, submittedBy: userId, submissionType: dto.submissionType,
        isFinal: dto.isFinal, assetIds, publishedUrl, notes: dto.notes, caption: dto.caption,
      } });
      await tx.participantDeliverable.update({ where: { id }, data: {
        version, status: 'SUBMITTED', contentUrls: [], submissionNotes: dto.notes, submittedAt: new Date(),
        reviewStatus: 'PENDING', reviewComments: null, reviewedBy: null, reviewedAt: null,
        publishedUrl: publishedUrl || null, publishedAt: null, verifiedAt: null, verifiedBy: null,
        verificationStatus: publishedUrl ? 'MANUAL_REVIEW_REQUIRED' : null,
      } });
      await this.events.record(tx, d, userId, version > 1 ? 'SUBMISSION_RESUBMITTED' : 'DELIVERABLE_SUBMITTED', 'SUBMITTED', { submissionId: revision.id, version });
    });
  }

  review(userId: string, id: string, dto: ReviewDeliverableDto) {
    return this.mutate(userId, id, 'brand', async (tx, d) => {
      this.checkVersion(d, dto.expectedVersion);
      if (!['SUBMITTED', 'PUBLISHED'].includes(d.status)) throw new BadRequestException('Only the current submitted version can be reviewed');
      if (dto.decision !== 'APPROVED' && !dto.comments?.trim()) throw new BadRequestException('Actionable feedback is required for revisions or rejection');
      if (d.status === 'PUBLISHED') {
        if (dto.decision !== 'REVISION_REQUESTED') throw new BadRequestException('Confirm publication or request a revision with feedback');
        await tx.participantDeliverable.update({ where: { id }, data: {
          status: 'REVISION_REQUESTED', verificationStatus: 'VERIFICATION_FAILED', reviewComments: dto.comments?.trim(),
          revisionCount: { increment: 1 },
        } });
        // Preserve the original content approval; publication review is a separate audit event.
        await this.events.record(tx, d, userId, 'PUBLICATION_REVISION_REQUESTED', 'REVISION_REQUESTED', { feedback: dto.comments!.trim(), url: d.publishedUrl });
        return;
      }
      const latest = d.revisions[0];
      if (!latest || latest.version !== dto.expectedVersion) throw new ConflictException('Refresh to review the current version');
      let status: DeliverableStatus = dto.decision === 'REJECTED' ? 'DELIVERABLE_REJECTED' : dto.decision;
      if (dto.decision === 'APPROVED') {
        if (!latest.isFinal) status = 'IN_PROGRESS'; // Draft approval is not final content approval.
        else if (latest.publishedUrl) status = 'PUBLISHED';
        else if (rulesOf(d.requirements).requiresPublication) status = 'READY_TO_PUBLISH';
      }
      await tx.deliverableRevision.update({ where: { id: latest.id }, data: {
        status: dto.decision, reviewComments: dto.comments?.trim(), reviewedBy: userId, reviewedAt: new Date(),
      } });
      await tx.participantDeliverable.update({ where: { id }, data: {
        status, reviewStatus: dto.decision, reviewComments: dto.comments?.trim(), reviewedBy: userId, reviewedAt: new Date(),
        ...(dto.decision === 'REVISION_REQUESTED' ? { revisionCount: { increment: 1 } } : {}),
      } });
      await this.events.record(tx, d, userId, `SUBMISSION_${dto.decision}`, status, { version: dto.expectedVersion, feedback: dto.comments || '' });
      await this.events.completeIfEligible(tx, { ...d, status }, userId);
    });
  }

  publish(userId: string, id: string, dto: PublishDeliverableDto) {
    return this.mutate(userId, id, 'creator', async (tx, d) => {
      this.checkVersion(d, dto.expectedVersion);
      if (!['APPROVED', 'READY_TO_PUBLISH'].includes(d.status) || !rulesOf(d.requirements).requiresPublication || !d.revisions[0]?.isFinal) {
        throw new BadRequestException('Final content must be approved for publication first');
      }
      const url = await this.checkUrl(tx, d, dto.publishedUrl);
      await tx.participantDeliverable.update({ where: { id }, data: { status: 'PUBLISHED', publishedUrl: url, verificationStatus: 'MANUAL_REVIEW_REQUIRED' } });
      await this.events.record(tx, d, userId, 'PUBLICATION_SUBMITTED', 'PUBLISHED', { url, version: d.version });
    });
  }

  verify(userId: string, id: string, expectedVersion: number) {
    return this.mutate(userId, id, 'brand', async (tx, d) => {
      this.checkVersion(d, expectedVersion);
      if (d.status !== 'PUBLISHED' || !d.publishedUrl) throw new BadRequestException('Only published deliverables can be verified');
      await tx.participantDeliverable.update({ where: { id }, data: { status: 'VERIFIED', verifiedAt: new Date(), verifiedBy: userId, verificationStatus: 'VERIFIED_MANUALLY' } });
      await this.events.record(tx, d, userId, 'PUBLICATION_VERIFIED_MANUALLY', 'VERIFIED', { url: d.publishedUrl, version: d.version });
      await this.events.completeIfEligible(tx, { ...d, status: 'VERIFIED' }, userId);
    });
  }
}
