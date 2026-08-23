import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { ApplicationService } from './application.service';
import { OfferService } from './offer.service';
import { ParticipantService } from './participant.service';
import { DiscoverCampaignsQueryDto } from './dto/discover-campaigns-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('campaign-discovery')
@Controller()
export class DiscoveryController {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly applicationService: ApplicationService,
    private readonly offerService: OfferService,
    private readonly participantService: ParticipantService,
  ) {}

  @Get('campaigns/discover')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Discover open campaigns with rich filtering, search and sorting' })
  async discoverCampaigns(@Req() req: any, @Query() query: DiscoverCampaignsQueryDto) {
    return this.discoveryService.discoverCampaigns(query, req?.user?.id);
  }

  @Get('campaigns/:campaignId/eligibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check real-time eligibility for a specific campaign' })
  async checkEligibility(@Req() req: any, @Param('campaignId') campaignId: string) {
    return this.discoveryService.checkEligibility(campaignId, req.user.id);
  }

  @Get('influencer/my-applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all campaigns applied to by the authenticated influencer' })
  async listMyApplications(@Req() req: any) {
    return this.applicationService.listApplicationsForInfluencer(req.user.id);
  }

  @Get('influencer/my-offers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all collaboration offers received by the authenticated influencer' })
  async listMyOffers(@Req() req: any) {
    return this.offerService.listOffersForInfluencer(req.user.id);
  }

  @Get('influencer/my-collaborations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all active and completed campaign collaborations for the influencer' })
  async listMyCollaborations(@Req() req: any) {
    return this.participantService.listInfluencerCollaborations(req.user.id);
  }
}
