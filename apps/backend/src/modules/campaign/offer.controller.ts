import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('campaign-offers')
@Controller()
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post('applications/:applicationId/offers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand sends an offer to a shortlisted applicant' })
  async sendOffer(
    @Req() req: any,
    @Param('applicationId') applicationId: string,
    @Body() dto: CreateOfferDto,
  ) {
    return this.offerService.sendOffer(req.user.id, applicationId, dto);
  }

  @Get('offers/:offerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get offer terms and status' })
  async getOfferDetails(@Param('offerId') offerId: string) {
    return this.offerService.getOfferDetails(offerId);
  }

  @Post('offers/:offerId/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Influencer accepts offer and joins campaign' })
  async acceptOffer(@Req() req: any, @Param('offerId') offerId: string) {
    return this.offerService.acceptOffer(req.user.id, offerId);
  }

  @Post('offers/:offerId/decline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Influencer declines offer' })
  async declineOffer(@Req() req: any, @Param('offerId') offerId: string) {
    return this.offerService.declineOffer(req.user.id, offerId);
  }

  @Post('offers/:offerId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand cancels sent offer before response' })
  async cancelOffer(@Req() req: any, @Param('offerId') offerId: string) {
    return this.offerService.cancelOffer(req.user.id, offerId);
  }

  @Get('campaigns/:campaignId/offers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all offers sent for a campaign' })
  async listCampaignOffers(@Param('campaignId') campaignId: string) {
    return this.offerService.listOffersForCampaign(campaignId);
  }
}
