import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Ensures the authenticated user is a party to the dispute addressed by the
 * request — the payer of the disputed payment or the influencer being paid
 * (or an admin).
 */
@Injectable()
export class DisputeAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Authentication required');

    const disputeId = request.params.disputeId;
    if (!disputeId) return true;

    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        payment: { select: { userId: true, campaignId: true } },
      },
    });

    if (!dispute) throw new NotFoundException('Dispute not found');

    let influencerUserId: string | undefined;
    if (dispute.influencerProfileId) {
      const profile = await this.prisma.influencerProfile.findUnique({
        where: { id: dispute.influencerProfileId },
        select: { userId: true },
      });
      influencerUserId = profile?.userId;
    }

    const isPayer = dispute.payment.userId === user.id;
    const isInfluencer = influencerUserId === user.id;

    if (!isPayer && !isInfluencer && user.role !== 'ADMIN') {
      throw new ForbiddenException('You are not a party to this dispute');
    }

    request.dispute = dispute;
    return true;
  }
}
