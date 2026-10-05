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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { PayoutService } from './payout.service';
import { CampaignFinanceService } from './campaign-finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentOwnerGuard } from './guards/payment-owner.guard';
import { CampaignBrandGuard } from './guards/campaign-brand.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { ListPaymentsQueryDto } from './dto/list-query.dto';
import {
  presentPayment,
  presentRefund,
} from './interfaces/response-presenters';

/**
 * Payments API (TRD §28).
 *
 * Company funding, verification, and refunds. Payment status is only ever
 * resolved server-side via the provider — the client may ask for a sync, but
 * the answer comes from Cashfree, never from the redirect itself.
 */
@ApiTags('payments')
@Controller()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly campaignFinanceService: CampaignFinanceService,
  ) {}

  /** Brand initiates funding for a campaign (TRD §10, §33). */
  @Post('campaigns/:campaignId/payments')
  @UseGuards(JwtAuthGuard, CampaignBrandGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment order to fund a campaign' })
  async createCampaignPayment(
    @Req() req: any,
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateOrderDto,
  ) {
    const payment = await this.paymentService.createOrder({
      userId: req.user.id,
      actorUserId: req.user.id,
      brandProfileId: req.campaign.brandProfileId,
      campaignId,
      amount: dto.amount,
      currency: dto.currency,
      idempotencyKey: dto.idempotencyKey,
      returnUrl: dto.returnUrl,
    });
    return presentPayment(payment, dto.currency ?? 'INR');
  }

  @Post('payments/orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a standalone payment order' })
  async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    const payment = await this.paymentService.createOrder({
      userId: req.user.id,
      actorUserId: req.user.id,
      campaignId: dto.campaignId,
      amount: dto.amount,
      currency: dto.currency,
      idempotencyKey: dto.idempotencyKey,
      returnUrl: dto.returnUrl,
    });
    return presentPayment(payment, dto.currency ?? 'INR');
  }

  @Get('payments/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the authenticated user\u2019s payments' })
  async listMyPayments(@Req() req: any, @Query() query: ListPaymentsQueryDto) {
    const payments = await this.paymentService.listPaymentsForUser(req.user.id, query);
    return payments.map((p) => presentPayment(p, p.currency));
  }

  @Get('payments/:paymentId')
  @UseGuards(JwtAuthGuard, PaymentOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details' })
  async getPayment(@Req() req: any) {
    return presentPayment(req.payment, req.payment.currency);
  }

  /** Server-side verification — the only trusted status endpoint (TRD §11). */
  @Post('payments/:paymentId/verify')
  @UseGuards(JwtAuthGuard, PaymentOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Re-check payment status with the provider' })
  async verifyPayment(@Req() req: any, @Param('paymentId') paymentId: string) {
    const payment = await this.paymentService.syncPaymentStatus(paymentId);
    return presentPayment(payment, payment.currency);
  }

  @Post('payments/:paymentId/refund')
  @UseGuards(JwtAuthGuard, PaymentOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a payment (full or partial)' })
  async refundPayment(
    @Req() req: any,
    @Param('paymentId') paymentId: string,
    @Body() dto: CreateRefundDto,
  ) {
    const refund = await this.paymentService.refund({
      paymentId,
      amount: dto.amount,
      reason: dto.reason,
      idempotencyKey: dto.idempotencyKey,
      actorUserId: req.user.id,
    });
    return presentRefund(refund, refund.currency);
  }

  @Get('payments/:paymentId/refunds')
  @UseGuards(JwtAuthGuard, PaymentOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List refunds for a payment' })
  async listRefunds(@Req() req: any, @Param('paymentId') paymentId: string) {
    const refunds = await this.paymentService.listRefunds(paymentId);
    return refunds.map((r) => presentRefund(r, r.currency));
  }

  @Get('campaigns/:campaignId/finance')
  @UseGuards(JwtAuthGuard, CampaignBrandGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a campaign\u2019s financial position' })
  async getCampaignFinance(@Req() req: any, @Param('campaignId') campaignId: string) {
    return this.campaignFinanceService.getFinance(
      campaignId,
      req.campaign.brandProfileId,
    );
  }

  @Post('campaigns/:campaignId/finance/budget')
  @UseGuards(JwtAuthGuard, CampaignBrandGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set the campaign budget (commitment only, no money moves)' })
  async setBudget(@Req() req: any, @Param('campaignId') campaignId: string, @Body() dto: any) {
    return this.campaignFinanceService.setBudget({
      campaignId,
      brandProfileId: req.campaign.brandProfileId,
      grossBudget: dto.grossBudget,
      currency: dto.currency,
    });
  }

  @Post('campaigns/:campaignId/finance/quote')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, CampaignBrandGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Preview the fee split for a funding amount' })
  async quote(@Param('campaignId') campaignId: string, @Body() dto: any) {
    return this.campaignFinanceService.quote({ campaignId, amount: dto.amount, currency: dto.currency });
  }

  @Post('campaigns/:campaignId/finance/settle')
  @UseGuards(JwtAuthGuard, CampaignBrandGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Settle a funded campaign: split funds into payables, fees and tax' })
  async settle(@Req() req: any, @Param('campaignId') campaignId: string) {
    return this.campaignFinanceService.settle({
      campaignId,
      actorBrandProfileId: req.campaign.brandProfileId,
    });
  }

  @Post('campaigns/:campaignId/finance/attribute-payable')
  @UseGuards(JwtAuthGuard, CampaignBrandGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Attribute settled payable to a confirmed influencer' })
  async attributePayable(@Param('campaignId') campaignId: string, @Body() dto: any) {
    return this.campaignFinanceService.attributePayable({
      campaignId,
      influencerProfileId: dto.influencerProfileId,
      amount: dto.amount,
    });
  }

  @Get('campaigns/:campaignId/payments')
  @UseGuards(JwtAuthGuard, CampaignBrandGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List payments for a campaign' })
  async listCampaignPayments(@Req() req: any, @Param('campaignId') campaignId: string) {
    const payments = await this.paymentService.listPaymentsForUser(req.user.id, { campaignId });
    return payments.map((p) => presentPayment(p, p.currency));
  }
}
