import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ApplicationOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const applicationId = request.params.applicationId || request.params.id;
    if (!applicationId) {
      return true;
    }

    const application = await this.prisma.campaignApplication.findUnique({
      where: { id: applicationId },
      include: {
        influencerProfile: true,
        campaign: {
          include: { brandProfile: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Influencer owner or campaign owner brand or admin
    const isApplicant = application.influencerProfile.userId === user.id;
    const isCampaignOwner = application.campaign.brandProfile.userId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isApplicant && !isCampaignOwner && !isAdmin) {
      throw new ForbiddenException('You do not have permission to access this application');
    }

    request.application = application;
    return true;
  }
}
