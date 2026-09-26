import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export const deliverableInclude = {
  participant: { include: { campaign: { include: { brandProfile: true } }, influencerProfile: true } },
  revisions: { orderBy: { version: 'desc' as const } },
  events: { orderBy: { createdAt: 'desc' as const } },
};

@Injectable()
export class DeliverableAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string, id: string, role?: 'creator' | 'brand') {
    const d = await this.prisma.participantDeliverable.findUnique({ where: { id }, include: deliverableInclude });
    if (!d) throw new NotFoundException('Deliverable not found');
    this.authorize(userId, d.participant, role);
    return d;
  }

  authorize(userId: string, p: any, role?: 'creator' | 'brand') {
    const creator = p.influencerProfile.userId === userId;
    const brand = p.campaign.brandProfile.userId === userId;
    if (role === 'creator' ? !creator : role === 'brand' ? !brand : !creator && !brand) {
      throw new ForbiddenException('You do not have access to this collaboration');
    }
  }

  assertActive(p: any) {
    if (p.status !== 'PARTICIPANT_ACTIVE' || !['OPEN', 'FILLING', 'ACTIVE'].includes(p.campaign.status)) {
      throw new BadRequestException('Start the campaign first; cancelled, paused or completed collaborations cannot be changed');
    }
  }
}
