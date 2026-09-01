import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NetworkService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveInfluencerProfileId(userId?: string): Promise<string> {
    if (userId) {
      const profile = await this.prisma.influencerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (profile) return profile.id;
    }
    const firstProfile = await this.prisma.influencerProfile.findFirst({
      select: { id: true },
    });
    if (firstProfile) return firstProfile.id;
    throw new NotFoundException('Influencer profile not found');
  }

  async getMyNetwork(userId?: string) {
    const influencerProfileId = await this.resolveInfluencerProfileId(userId);

    // Auto-sync completed campaign participants into InfluencerBrandPartner
    await this.syncCompletedCampaignsToNetwork(influencerProfileId);

    const partners = await (this.prisma as any).influencerBrandPartner.findMany({
      where: { influencerProfileId },
      include: {
        brandProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { lastWorked: 'desc' },
    });

    return partners.map((partner: any) => ({
      id: partner.id,
      brandProfileId: partner.brandProfileId,
      name: partner.brandProfile?.companyName || partner.brandProfile?.user?.name || 'Partner Brand',
      industry: partner.brandProfile?.industry || 'Consumer & Lifestyle',
      logoUrl: partner.brandProfile?.logoUrl,
      website: partner.brandProfile?.website,
      location: partner.brandProfile?.location,
      totalDeals: partner.totalDeals,
      totalPaid: `$${partner.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawTotalPaid: partner.totalPaid,
      lastWorked: partner.lastWorked
        ? new Date(partner.lastWorked).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Recent',
      contactPerson: partner.contactPerson || partner.brandProfile?.user?.name || 'Brand Partnerships Lead',
      contactRole: partner.contactRole || 'Influencer Marketing Manager',
      verified: partner.brandProfile?.isOnboardingCompleted || true,
      relationshipTag: partner.relationshipTag,
      rating: partner.rating || 5.0,
      notes: partner.notes,
      pastCampaignsList: partner.pastCampaignsList || [],
    }));
  }

  async recordBrandPartnerCompletion(
    influencerProfileId: string,
    brandProfileId: string,
    campaignTitle: string,
    payoutAmount: number,
    contactPerson?: string,
    contactRole?: string,
  ) {
    try {
      const existing = await (this.prisma as any).influencerBrandPartner.findUnique({
        where: {
          influencerProfileId_brandProfileId: {
            influencerProfileId,
            brandProfileId,
          },
        },
      });

      const campaignRecord = `${campaignTitle} ($${payoutAmount.toLocaleString('en-US')})`;

      if (existing) {
        const newTotalDeals = existing.totalDeals + 1;
        const newTotalPaid = (existing.totalPaid || 0) + payoutAmount;
        const updatedPastList = Array.isArray(existing.pastCampaignsList)
          ? [...existing.pastCampaignsList, campaignRecord]
          : [campaignRecord];

        let newTag = existing.relationshipTag;
        if (newTag !== 'PREFERRED' && newTotalDeals >= 2) {
          newTag = 'REPEAT_SPONSOR';
        }

        return await (this.prisma as any).influencerBrandPartner.update({
          where: { id: existing.id },
          data: {
            totalDeals: newTotalDeals,
            totalPaid: newTotalPaid,
            lastWorked: new Date(),
            pastCampaignsList: updatedPastList,
            relationshipTag: newTag,
            contactPerson: contactPerson || existing.contactPerson,
            contactRole: contactRole || existing.contactRole,
          },
        });
      } else {
        return await (this.prisma as any).influencerBrandPartner.create({
          data: {
            influencerProfileId,
            brandProfileId,
            totalDeals: 1,
            totalPaid: payoutAmount,
            lastWorked: new Date(),
            pastCampaignsList: [campaignRecord],
            relationshipTag: 'COMPLETED',
            contactPerson: contactPerson || 'Brand Partnerships Lead',
            contactRole: contactRole || 'Influencer Marketing Manager',
            rating: 5.0,
          },
        });
      }
    } catch (err) {
      console.warn('Failed to record brand partner completion in network:', err);
    }
  }

  async updateRelationshipTag(userId: string | undefined, partnerId: string, relationshipTag: string) {
    const influencerProfileId = await this.resolveInfluencerProfileId(userId);
    const partner = await (this.prisma as any).influencerBrandPartner.findUnique({
      where: { id: partnerId },
    });

    if (!partner || partner.influencerProfileId !== influencerProfileId) {
      throw new NotFoundException('Brand partner network entry not found');
    }

    return (this.prisma as any).influencerBrandPartner.update({
      where: { id: partnerId },
      data: { relationshipTag },
    });
  }

  private async syncCompletedCampaignsToNetwork(influencerProfileId: string) {
    try {
      const completedParticipants = await this.prisma.campaignParticipant.findMany({
        where: {
          influencerProfileId,
          status: 'PARTICIPANT_COMPLETED' as any,
        },
        include: {
          campaign: {
            include: {
              brandProfile: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      for (const participant of completedParticipants) {
        if (participant.campaign?.brandProfileId) {
          await this.recordBrandPartnerCompletion(
            influencerProfileId,
            participant.campaign.brandProfileId,
            participant.campaign.title || 'Completed Campaign',
            participant.agreedAmount || 0,
            participant.campaign.brandProfile.user?.name || participant.campaign.brandProfile.companyName || 'Brand Partner',
            'Brand Partnerships Lead',
          );
        }
      }
    } catch (err) {
      console.warn('Error during syncCompletedCampaignsToNetwork:', err);
    }
  }
}
