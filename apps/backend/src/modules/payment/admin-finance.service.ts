import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentStatus, PayoutStatus, RefundStatus, WebhookProcessingStatus } from '@prisma/client';
import { PaymentRepository } from './payment.repository';
import { AuditService } from './audit.service';
import { WebhookService } from './webhook.service';
import { PayoutService } from './payout.service';
import { fromMinor } from './money.util';

/**
 * Read-model aggregations for the admin financial dashboard (TRD §21).
 *
 * Everything here is derived — the admin dashboard never mutates financial
 * state directly; money only moves through the payment/payout/refund
 * services with their guards and audit trail.
 */
@Injectable()
export class AdminFinanceService {
  private readonly logger = new Logger(AdminFinanceService.name);

  constructor(
    private readonly repository: PaymentRepository,
    private readonly audit: AuditService,
    private readonly webhookService: WebhookService,
    private readonly payoutService: PayoutService,
  ) {}

  /** Dashboard summary across payments, payouts, refunds, disputes (TRD §21). */
  async getDashboard() {
    const summary = await this.repository.getAdminFinanceSummary();

    const payments: Record<string, { count: number; amount: string }> = {};
    for (const group of summary.paymentsByStatus) {
      payments[group.status] = {
        count: group._count._all,
        amount: fromMinor(Number(group._sum.amountMinor ?? 0), 'INR'),
      };
    }

    const payouts: Record<string, { count: number; amount: string }> = {};
    for (const group of summary.payoutsByStatus) {
      payouts[group.status] = {
        count: group._count._all,
        amount: fromMinor(Number(group._sum.amountMinor ?? 0), 'INR'),
      };
    }

    const refunds: Record<string, { count: number; amount: string }> = {};
    for (const group of summary.refundsByStatus) {
      refunds[group.status] = {
        count: group._count._all,
        amount: fromMinor(Number(group._sum.amountMinor ?? 0), 'INR'),
      };
    }

    const finance = summary.campaignFinanceAgg;

    return {
      payments,
      payouts,
      refunds,
      openDisputes: summary.openDisputes,
      campaignFinance: {
        campaigns: finance._count._all,
        fundedAmount: fromMinor(Number(finance._sum.fundedAmountMinor ?? 0), 'INR'),
        platformFee: fromMinor(Number(finance._sum.platformFeeMinor ?? 0), 'INR'),
        influencerPayable: fromMinor(Number(finance._sum.influencerPayableMinor ?? 0), 'INR'),
        refundedAmount: fromMinor(Number(finance._sum.refundedAmountMinor ?? 0), 'INR'),
        paidOutAmount: fromMinor(Number(finance._sum.paidOutAmountMinor ?? 0), 'INR'),
      },
    };
  }

  async listPayments(status?: PaymentStatus, campaignId?: string) {
    return this.repository.listPaymentsForAdmin({ status, campaignId });
  }

  async listPayouts(status?: PayoutStatus) {
    return this.repository.listPayoutsForAdmin({ status });
  }

  async listRefunds(status?: RefundStatus) {
    return this.repository.listRefundsForAdmin({ status });
  }

  async listWebhookEvents(processingStatus?: WebhookProcessingStatus) {
    return this.webhookService.listEvents({ status: processingStatus });
  }

  async retryFailedWebhooks() {
    return this.webhookService.retryStalledEvents();
  }

  async retryPayout(adminUserId: string, payoutId: string) {
    const payout = await this.payoutService.retryPayout(payoutId);
    await this.audit.record(
      {
        action: 'PAYOUT_RETRY_ADMIN',
        entityType: 'PAYOUT',
        entityId: payoutId,
        newStatus: payout.status,
      },
      { actorType: 'ADMIN', actorId: adminUserId },
    );
    return payout;
  }

  /** Full audit timeline for a payment and everything attached to it. */
  async getPaymentAuditTrail(paymentId: string) {
    const payment = await this.repository.findPaymentById(paymentId);
    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

    const [paymentLogs, refundLogs] = await Promise.all([
      this.audit.listForEntity('PAYMENT', paymentId, 200),
      this.repository.listRefundsForPayment(paymentId).then(async (refunds) => {
        const all = await Promise.all(
          refunds.map((r) => this.audit.listForEntity('REFUND', r.id, 50)),
        );
        return all.flat();
      }),
    ]);

    return {
      paymentId,
      events: [...paymentLogs, ...refundLogs].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      ),
    };
  }

  async listRecentAuditLogs(take = 100) {
    return this.audit.listRecent(take);
  }
}
