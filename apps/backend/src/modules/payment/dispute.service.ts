import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DisputeResolution, DisputeStatus, FinancialAccountType, PaymentStatus } from '@prisma/client';
import { PaymentRepository } from './payment.repository';
import { PaymentService } from './payment.service';
import { PayoutService } from './payout.service';
import { LedgerService } from './ledger.service';
import { AuditService } from './audit.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/payouts.dto';

/**
 * Dispute resolution (PRD §24, TRD §5.6).
 *
 * Opening a dispute freezes the money: while a dispute is open, no refund or
 * payout may proceed against the disputed payment. Resolution is an admin
 * action that executes exactly one outcome — refund the company, release to
 * the influencer, a split, or no action — and is audit-logged end to end.
 */
@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(
    private readonly repository: PaymentRepository,
    private readonly paymentService: PaymentService,
    private readonly payoutService: PayoutService,
    private readonly ledger: LedgerService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Opens a dispute against a payment. Only the payment parties may do so,
   * and only while the money is still held (successful and not yet fully
   * refunded/paid out).
   */
  async open(userId: string, paymentId: string, dto: CreateDisputeDto) {
    const payment = await this.repository.findPaymentById(paymentId);
    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

    // Only a party to the payment may dispute it. The payer is known; the
    // influencer side is resolved through the campaign participant records.
    const brandProfile = await this.repository.findBrandProfileByUser(userId);
    const influencerProfile = await this.repository.findInfluencerProfileByUser(userId);

    let isPayer = payment.userId === userId;
    let isInfluencer = false;
    if (!isPayer && influencerProfile && payment.campaignId) {
      const participant = await this.repository.findCampaignParticipant(
        payment.campaignId,
        influencerProfile.id,
      );
      isInfluencer = Boolean(participant);
    }
    if (!isPayer && !isInfluencer && brandProfile && payment.campaignId) {
      const campaign = await this.repository.findCampaignById(payment.campaignId);
      isPayer = campaign?.brandProfileId === brandProfile.id;
    }

    if (!isPayer && !isInfluencer) {
      throw new ForbiddenException('Only a party to this payment may open a dispute');
    }

    if (payment.status !== PaymentStatus.SUCCESSFUL) {
      throw new ConflictException(
        `Only successful payments can be disputed (is ${payment.status})`,
      );
    }

    const existing = await this.repository.findOpenDisputeForPayment(paymentId);
    if (existing) {
      throw new ConflictException(`An open dispute already exists for this payment (${existing.id})`);
    }

    const dispute = await this.repository.createDispute({
      paymentId,
      campaignId: payment.campaignId,
      influencerProfileId: influencerProfile?.id ?? null,
      brandProfileId: brandProfile?.id ?? null,
      openedBy: dto.openedBy === 'COMPANY' ? 'COMPANY' : 'INFLUENCER',
      openedByUserId: userId,
      reason: dto.reason,
      description: dto.description,
      evidence: dto.evidence ?? [],
      requestedResolution: dto.requestedResolution as DisputeResolution | undefined,
    });

    await this.audit.record(
      {
        action: 'DISPUTE_OPENED',
        entityType: 'DISPUTE',
        entityId: dispute.id,
        newStatus: DisputeStatus.OPEN,
        metadata: {
          paymentId,
          campaignId: payment.campaignId ?? null,
          reason: dto.reason,
          openedBy: dto.openedBy,
        },
      },
      { actorType: 'USER', actorId: userId },
    );

    return dispute;
  }

  async get(disputeId: string) {
    const dispute = await this.repository.findDisputeById(disputeId);
    if (!dispute) throw new NotFoundException(`Dispute ${disputeId} not found`);
    return dispute;
  }

  async listForUser(userId: string, status?: DisputeStatus) {
    return this.repository.listDisputesForUser(userId, { status });
  }

  async listAll(status?: DisputeStatus) {
    return this.repository.listDisputes({ status });
  }

  /** Marks a dispute as under admin review. Admin-only. */
  async beginReview(adminUserId: string, disputeId: string) {
    const dispute = await this.get(disputeId);
    if (dispute.status !== DisputeStatus.OPEN) {
      throw new ConflictException(`Cannot review a dispute in status ${dispute.status}`);
    }

    const updated = await this.repository.updateDispute(disputeId, {
      status: DisputeStatus.UNDER_REVIEW,
    });

    await this.audit.record(
      {
        action: 'DISPUTE_UNDER_REVIEW',
        entityType: 'DISPUTE',
        entityId: disputeId,
        previousStatus: DisputeStatus.OPEN,
        newStatus: DisputeStatus.UNDER_REVIEW,
      },
      { actorType: 'ADMIN', actorId: adminUserId },
    );

    return updated;
  }

  /**
   * Resolves a dispute (admin-only, PRD §24).
   *
   * REFUND_COMPANY  → refunds the payer in full via the provider.
   * RELEASE_INFLUENCER → credits the influencer's payable and dispatches a payout.
   * SPLIT → refunds half and releases the remainder.
   * NO_ACTION → closes without moving money.
   */
  async resolve(adminUserId: string, disputeId: string, dto: ResolveDisputeDto) {
    const dispute = await this.get(disputeId);
    if (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.CLOSED) {
      throw new ConflictException(`Dispute is already ${dispute.status}`);
    }

    const payment = await this.repository.findPaymentById(dispute.paymentId);
    if (!payment) throw new NotFoundException('Disputed payment no longer exists');

    const resolution = dto.resolution as DisputeResolution;
    const outcome: Record<string, unknown> = { resolution, refundId: null, payoutId: null };

    // Mark resolved before moving money: the release path pays out of a
    // campaign whose dispute lock must already be lifted.
    await this.repository.updateDispute(disputeId, {
      status: DisputeStatus.RESOLVED,
      adminDecision: resolution,
      adminDecisionNotes: dto.notes ?? null,
      resolvedBy: adminUserId,
      resolvedAt: new Date(),
    });

    try {
      if (resolution === DisputeResolution.REFUND_COMPANY) {
        outcome.refundId = await this.refundPayment(payment.id, payment.amountMinor, adminUserId, dto.notes);
      } else if (resolution === DisputeResolution.RELEASE_INFLUENCER) {
        outcome.payoutId = await this.releaseToInfluencer(dispute, payment, adminUserId, dto.notes);
      } else if (resolution === DisputeResolution.SPLIT) {
        const half = payment.amountMinor / 2n;
        outcome.refundId = await this.refundPayment(payment.id, half, adminUserId, dto.notes);
        outcome.payoutId = await this.releaseToInfluencer(dispute, payment, adminUserId, dto.notes, half);
      }
    } catch (error) {
      // Money movement failed: reopen the dispute rather than leave it
      // resolved with a half-executed outcome.
      await this.repository.updateDispute(disputeId, {
        status: DisputeStatus.UNDER_REVIEW,
        adminDecision: null,
        adminDecisionNotes: `Resolution attempt failed: ${(error as Error).message}`.slice(0, 5000),
        resolvedBy: null,
        resolvedAt: null,
      });
      throw error;
    }

    const updated = await this.repository.findDisputeById(disputeId);

    await this.audit.record(
      {
        action: 'DISPUTE_RESOLVED',
        entityType: 'DISPUTE',
        entityId: disputeId,
        previousStatus: dispute.status,
        newStatus: DisputeStatus.RESOLVED,
        metadata: { resolution, paymentId: payment.id, ...outcome },
      },
      { actorType: 'ADMIN', actorId: adminUserId },
    );

    return { dispute: updated, outcome };
  }

  /**
   * Whether a payment is currently blocked by an open dispute — refunds and
   * payouts must refuse to move disputed money.
   */
  async assertNotDisputed(paymentId: string) {
    const open = await this.repository.findOpenDisputeForPayment(paymentId);
    if (open) {
      throw new ConflictException(`Payment is under dispute (${open.id}); action blocked`);
    }
  }

  // ---------------------------------------------------------------- helpers

  private async refundPayment(
    paymentId: string,
    amountMinor: bigint,
    adminUserId: string,
    notes?: string,
  ) {
    // Amount comes back as a decimal string for the payment service, which
    // re-validates the cumulative cap against provider data. The dispute is
    // being resolved right now, so its lock is deliberately bypassed.
    const refund = await this.paymentService.refund({
      paymentId,
      amount: (Number(amountMinor) / 100).toFixed(2),
      reason: notes ?? 'Dispute resolved in favour of company',
      actorUserId: adminUserId,
      bypassDisputeLock: true,
    });
    return refund.id;
  }

  private async releaseToInfluencer(
    dispute: any,
    payment: any,
    adminUserId: string,
    notes?: string,
    amountMinorOverride?: bigint,
  ) {
    if (!dispute.influencerProfileId) {
      throw new BadRequestException(
        'Cannot release to influencer: no influencer is recorded on this dispute',
      );
    }

    const amountMinor = amountMinorOverride ?? payment.amountMinor;
    const campaignId = dispute.campaignId ?? payment.campaignId ?? null;

    // The influencer must have a KYC-verified destination before money can
    // leave the platform (TRD §16).
    const beneficiary = await this.repository.findBeneficiaryByInfluencer(
      dispute.influencerProfileId,
    );
    if (!beneficiary) {
      throw new BadRequestException(
        'Cannot release to influencer: no payout beneficiary is configured',
      );
    }

    // Money can only be paid from an attributed payable. The adjudicated
    // amount moves from campaign funds straight to the influencer's payable
    // (PRD §24), bypassing the fee engine — the admin decision governs the
    // split, not the standard pricing.
    if (campaignId) {
      const campaignFunds = await this.ledger.getBalance({
        ownerType: 'CAMPAIGN',
        ownerId: campaignId,
        accountType: FinancialAccountType.CAMPAIGN_FUNDS,
        currency: payment.currency,
      });

      if (campaignFunds < amountMinor) {
        throw new ConflictException(
          `Campaign funds hold ${(Number(campaignFunds) / 100).toFixed(2)} ` +
            `${payment.currency}, less than the ${(Number(amountMinor) / 100).toFixed(2)} ` +
            `${payment.currency} adjudicated for release`,
        );
      }

      await this.ledger.postDisputeRelease({
        disputeId: dispute.id,
        campaignId,
        influencerProfileId: dispute.influencerProfileId,
        amountMinor,
        currency: payment.currency,
      });
    }

    const payout = await this.payoutService.createPayout({
      influencerProfileId: dispute.influencerProfileId,
      campaignId,
      amount: (Number(amountMinor) / 100).toFixed(2),
      currency: payment.currency,
      invoiceReference: `dispute:${dispute.id}`,
    });

    await this.audit.record(
      {
        action: 'DISPUTE_PAYOUT_CREATED',
        entityType: 'PAYOUT',
        entityId: payout.id,
        newStatus: payout.status,
        metadata: { disputeId: dispute.id, paymentId: payment.id },
      },
      { actorType: 'ADMIN', actorId: adminUserId },
    );

    return payout.id;
  }
}
