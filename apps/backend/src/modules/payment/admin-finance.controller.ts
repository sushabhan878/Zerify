import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  PaymentStatus,
  PayoutStatus,
  RefundStatus,
  WebhookProcessingStatus,
} from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminFinanceService } from './admin-finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

/**
 * Financial admin API (TRD §21, §24).
 *
 * Every route is JWT-authenticated and requires the ADMIN role. Financial
 * mutations go through the domain services so state machines, idempotency,
 * and audit logging are enforced; this controller never writes directly.
 */
@ApiTags('admin-finance')
@Controller('admin/finance')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminFinanceController {
  constructor(private readonly adminFinanceService: AdminFinanceService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Aggregate payment, payout, refund, dispute and campaign finance totals' })
  async dashboard() {
    return this.adminFinanceService.getDashboard();
  }

  @Get('payments')
  @ApiOperation({ summary: 'List payments with payer and campaign context' })
  async listPayments(
    @Query('status') status?: PaymentStatus,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.adminFinanceService.listPayments(status, campaignId);
  }

  @Get('payouts')
  @ApiOperation({ summary: 'List payouts with beneficiary context' })
  async listPayouts(@Query('status') status?: PayoutStatus) {
    return this.adminFinanceService.listPayouts(status);
  }

  @Get('refunds')
  @ApiOperation({ summary: 'List refunds with payment context' })
  async listRefunds(@Query('status') status?: RefundStatus) {
    return this.adminFinanceService.listRefunds(status);
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'List webhook events and their processing status' })
  async listWebhooks(@Query('processingStatus') processingStatus?: WebhookProcessingStatus) {
    return this.adminFinanceService.listWebhookEvents(processingStatus);
  }

  @Post('webhooks/retry-failed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-drive failed or stalled webhook events' })
  async retryFailedWebhooks() {
    return this.adminFinanceService.retryFailedWebhooks();
  }

  @Post('payouts/:payoutId/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed payout through the provider' })
  async retryPayout(@Req() req: any, @Param('payoutId', ParseUUIDPipe) payoutId: string) {
    return this.adminFinanceService.retryPayout(req.user.id, payoutId);
  }

  @Get('payments/:paymentId/audit')
  @ApiOperation({ summary: 'Full audit timeline for a payment and its refunds' })
  async paymentAuditTrail(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.adminFinanceService.getPaymentAuditTrail(paymentId);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Recent financial audit events' })
  async recentAuditLogs(@Query('take') take?: string) {
    const parsed = take ? Math.min(Math.max(parseInt(take, 10) || 100, 1), 500) : 100;
    return this.adminFinanceService.listRecentAuditLogs(parsed);
  }
}
