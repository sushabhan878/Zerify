import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CampaignStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OutboxService } from '../messaging/outbox.service';
import { OUTBOX_EVENTS } from '../messaging/events/messaging-events';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { buildCampaignUpdate, campaignChanges } from './campaign-edit.utils';

const relations = { product: true, requirement: true, deliverables: { orderBy: { createdAt: 'asc' as const } }, brandProfile: true };

@Injectable()
export class CampaignLifecycleService {
  constructor(private readonly prisma: PrismaService, private readonly outbox: OutboxService) {}

  async update(campaignId: string, dto: UpdateCampaignDto) {
    return this.prisma.$transaction(async (tx) => {
      const campaign = await this.lockCampaign(tx, campaignId);
      if (['DELETED', 'CANCELLED', 'COMPLETED'].includes(campaign.status)) {
        throw new BadRequestException(`Cannot edit a ${campaign.status.toLowerCase()} campaign`);
      }
      if (dto.title !== undefined) {
        if (!dto.title?.trim()) throw new BadRequestException('Campaign name is required');
        const duplicate = await tx.campaign.findFirst({ where: {
          id: { not: campaignId }, brandProfileId: campaign.brandProfileId,
          status: { not: CampaignStatus.DELETED }, title: { equals: dto.title.trim(), mode: 'insensitive' },
        } });
        if (duplicate) throw new BadRequestException('A campaign with this name already exists');
      }
      const value = (key: string) => dto[key] !== undefined ? dto[key] : campaign[key];
      if (value('applicationDeadline') && value('startDate') && new Date(value('applicationDeadline')) >= new Date(value('startDate'))) throw new BadRequestException('Application deadline must be before campaign start date');
      if (value('startDate') && value('endDate') && new Date(value('startDate')) >= new Date(value('endDate'))) throw new BadRequestException('End date must be after start date');
      if (value('maxParticipants') < value('targetParticipants')) throw new BadRequestException('Maximum participants must be at least the target participants');
      const hired = await tx.campaignParticipant.count({ where: { campaignId, status: { not: 'PARTICIPANT_CANCELLED' } } });
      if (value('maxParticipants') < hired) throw new BadRequestException('Maximum participants cannot be less than the existing collaborators');

      const updated = await tx.campaign.update({ where: { id: campaignId }, data: buildCampaignUpdate(dto, campaign), include: relations });
      const changes = campaignChanges(campaign, updated);
      if (changes.length) await this.notify(tx, updated, OUTBOX_EVENTS.CAMPAIGN_UPDATED, changes);
      return updated;
    }, { timeout: 30000 });
  }

  async delete(campaignId: string) {
    return this.prisma.$transaction(async (tx) => {
      const campaign = await this.lockCampaign(tx, campaignId);
      if (campaign.status === CampaignStatus.DELETED) return campaign;
      const updated = await tx.campaign.update({ where: { id: campaignId }, data: { status: CampaignStatus.DELETED, applicationsClosedAt: campaign.applicationsClosedAt ?? new Date() }, include: relations });
      await this.notify(tx, updated, OUTBOX_EVENTS.CAMPAIGN_DELETED);
      return updated;
    }, { timeout: 30000 });
  }

  private async lockCampaign(tx: Prisma.TransactionClient, id: string) {
    await tx.$queryRaw`SELECT id FROM campaigns WHERE id = ${id} FOR UPDATE`;
    const campaign = await tx.campaign.findUnique({ where: { id }, include: relations });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  private async notify(tx: Prisma.TransactionClient, campaign: Awaited<ReturnType<CampaignLifecycleService['lockCampaign']>>, event: string, changes?: { field: string; before: string; after: string }[]) {
    const applications = await tx.campaignApplication.findMany({ where: { campaignId: campaign.id }, select: { id: true, influencerProfile: { select: { userId: true } } } });
    const participants = await tx.campaignParticipant.findMany({ where: { campaignId: campaign.id, status: { in: ['CONFIRMED', 'PARTICIPANT_ACTIVE'] } }, select: { applicationId: true, influencerProfile: { select: { userId: true } } } });
    const recipients = new Map(applications.map((a) => [a.influencerProfile.userId, a.id]));
    participants.forEach((p) => recipients.set(p.influencerProfile.userId, p.applicationId));
    for (const [influencerUserId, applicationId] of recipients) {
      await this.outbox.enqueue(tx, event, campaign.id, {
        applicationId, campaignId: campaign.id, campaignTitle: campaign.title,
        brandUserId: campaign.brandProfile.userId, brandName: campaign.brandProfile.companyName,
        influencerUserId, actor: 'BRAND', ...(changes ? { changes } : {}),
      });
    }
  }
}
