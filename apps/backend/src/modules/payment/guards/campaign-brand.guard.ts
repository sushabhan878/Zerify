import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Ensures the authenticated brand user owns the campaign addressed by the
 * request (or is admin). Attaches the campaign to the request.
 */
@Injectable()
export class CampaignBrandGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Authentication required');

    const campaignId = request.params.campaignId;
    if (!campaignId) return true;

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { brandProfile: true },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.brandProfile.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to manage this campaign');
    }

    request.campaign = campaign;
    return true;
  }
}
