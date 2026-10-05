import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Ensures the authenticated influencer user owns the payout addressed by
 * the request (or is admin). Attaches the payout to the request.
 */
@Injectable()
export class PayoutAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Authentication required');

    const payoutId = request.params.payoutId;
    if (!payoutId) return true;

    const payout = await this.prisma.zerifyPayout.findUnique({
      where: { id: payoutId },
      include: {
        beneficiary: {
          include: { influencer: { select: { userId: true } } },
        },
      },
    });

    if (!payout) throw new NotFoundException('Payout not found');

    const ownerUserId =
      payout.beneficiary?.influencer?.userId ??
      (
        await this.prisma.influencerProfile.findUnique({
          where: { id: payout.influencerProfileId },
          select: { userId: true },
        })
      )?.userId;

    if (ownerUserId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to access this payout');
    }

    request.payout = payout;
    return true;
  }
}
