import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutService } from './payout.service';
import { CampaignFinanceService } from './campaign-finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PayoutAccessGuard } from './guards/payout-access.guard';
import { CreatePayoutDto, UpsertBeneficiaryDto } from './dto/payouts.dto';
import { ListPayoutsQueryDto } from './dto/list-query.dto';
import { presentPayout } from './interfaces/response-presenters';
import { PaymentRepository } from './payment.repository';

/**
 * Influencer payout API (TRD §28).
 *
 * Beneficiary onboarding is self-service for the authenticated influencer;
 * payout creation and dispatch run through the PayoutService's KYC and
 * balance guards (TRD §16, §34).
 */
@ApiTags('payouts')
@Controller()
export class PayoutController {
  constructor(
    private readonly payoutService: PayoutService,
    private readonly campaignFinanceService: CampaignFinanceService,
    private readonly repository: PaymentRepository,
  ) {}

  /** Influencer registers/updates their payout destination (PRD §19). */
  @Post('payout-accounts/onboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upsert the authenticated influencer\u2019s payout beneficiary' })
  async onboardBeneficiary(@Req() req: any, @Body() dto: UpsertBeneficiaryDto) {
    const profile = await this.resolveInfluencerProfile(req.user.id);
    return this.payoutService.upsertBeneficiary({
      influencerProfileId: profile.id,
      ...dto,
    });
  }

  @Get('payout-accounts/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated influencer\u2019s payout beneficiary' })
  async getMyBeneficiary(@Req() req: any) {
    const profile = await this.resolveInfluencerProfile(req.user.id);
    return this.payoutService.getBeneficiary(profile.id);
  }

  @Get('payouts/me/payable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Influencer\u2019s current payable balance' })
  async getMyPayable(@Req() req: any, @Query('currency') currency?: string) {
    const profile = await this.resolveInfluencerProfile(req.user.id);
    return this.campaignFinanceService.getInfluencerPayable(
      profile.id,
      (currency ?? 'INR').toUpperCase(),
    );
  }

  @Post('payouts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create and dispatch a payout to a verified beneficiary' })
  async createPayout(@Req() req: any, @Body() dto: CreatePayoutDto) {
    // An influencer may only pay themselves; any other caller must be admin.
    if (req.user.role !== 'ADMIN') {
      const profile = await this.resolveInfluencerProfile(req.user.id);
      if (profile.id !== dto.influencerProfileId) {
        throw new ForbiddenException('You can only request payouts for yourself');
      }
    }

    const payout = await this.payoutService.createPayout({
      influencerProfileId: dto.influencerProfileId,
      campaignId: dto.campaignId,
      amount: dto.amount,
      currency: dto.currency,
      idempotencyKey: dto.idempotencyKey,
      tdsPercent: dto.tdsPercent,
      invoiceReference: dto.invoiceReference,
    });
    return presentPayout(payout, payout.currency);
  }

  @Get('payouts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the authenticated influencer\u2019s payouts' })
  async listMyPayouts(@Req() req: any, @Query() query: ListPayoutsQueryDto) {
    const profile = await this.resolveInfluencerProfile(req.user.id);
    const payouts = await this.payoutService.listPayouts(profile.id, query.status);
    return payouts.map((p) => presentPayout(p, p.currency));
  }

  @Get('payouts/:payoutId')
  @UseGuards(JwtAuthGuard, PayoutAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payout details' })
  async getPayout(@Req() req: any) {
    return presentPayout(req.payout, req.payout.currency);
  }

  @Post('payouts/:payoutId/verify')
  @UseGuards(JwtAuthGuard, PayoutAccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Re-check payout status with the provider' })
  async verifyPayout(@Req() req: any, @Param('payoutId') payoutId: string) {
    const payout = await this.payoutService.syncPayoutStatus(payoutId);
    return presentPayout(payout, payout.currency);
  }

  private async resolveInfluencerProfile(userId: string) {
    const profile = await this.repository.findInfluencerProfileByUser(userId);
    if (!profile) {
      throw new NotFoundException('Influencer profile not found for this account');
    }
    return profile;
  }
}
