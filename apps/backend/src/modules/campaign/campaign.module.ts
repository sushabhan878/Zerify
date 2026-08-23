import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { CampaignController } from './campaign.controller';
import { ApplicationController } from './application.controller';
import { OfferController } from './offer.controller';
import { ParticipantController } from './participant.controller';
import { DeliverableController } from './deliverable.controller';
import { DiscoveryController } from './discovery.controller';

import { CampaignService } from './campaign.service';
import { ApplicationService } from './application.service';
import { OfferService } from './offer.service';
import { ParticipantService } from './participant.service';
import { DeliverableService } from './deliverable.service';
import { DiscoveryService } from './discovery.service';

import { CampaignRepository } from './campaign.repository';
import { CampaignOwnerGuard } from './guards/campaign-owner.guard';
import { ApplicationOwnerGuard } from './guards/application-owner.guard';

@Module({
  imports: [PrismaModule],
  controllers: [
    DiscoveryController,
    CampaignController,
    ApplicationController,
    OfferController,
    ParticipantController,
    DeliverableController,
  ],
  providers: [
    CampaignRepository,
    CampaignService,
    ApplicationService,
    OfferService,
    ParticipantService,
    DeliverableService,
    DiscoveryService,
    CampaignOwnerGuard,
    ApplicationOwnerGuard,
  ],
  exports: [
    CampaignRepository,
    CampaignService,
    ApplicationService,
    OfferService,
    ParticipantService,
    DeliverableService,
    DiscoveryService,
  ],
})
export class CampaignModule {}
