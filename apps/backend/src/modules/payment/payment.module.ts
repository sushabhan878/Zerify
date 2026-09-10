import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { PaymentRepository } from './payment.repository';
import { LedgerService } from './ledger.service';
import { FeeEngine } from './fee-engine.service';
import { AuditService } from './audit.service';
import { PaymentService } from './payment.service';
import { PayoutService } from './payout.service';
import { CampaignFinanceService } from './campaign-finance.service';
import { WebhookService } from './webhook.service';
import { DisputeService } from './dispute.service';
import { AdminFinanceService } from './admin-finance.service';

import { PaymentProviderFactory } from './providers/payment-provider.factory';
import { CashfreePaymentProvider } from './providers/cashfree/cashfree.provider';
import { PAYMENT_PROVIDER } from './payment-provider.interface';

import { PaymentController } from './payment.controller';
import { PayoutController } from './payout.controller';
import { DisputeController } from './dispute.controller';
import { WebhookController } from './webhook.controller';
import { AdminFinanceController } from './admin-finance.controller';

import { AdminGuard } from './guards/admin.guard';
import { PaymentOwnerGuard } from './guards/payment-owner.guard';
import { CampaignBrandGuard } from './guards/campaign-brand.guard';
import { PayoutAccessGuard } from './guards/payout-access.guard';
import { DisputeAccessGuard } from './guards/dispute-access.guard';

/**
 * Payments & financials domain (TRD, PRD Zerify_Payment_Escrow_Architecture).
 *
 * The module owns collection, ledger, fees, campaign finance, payouts,
 * refunds, disputes, webhooks, audit, and the provider abstraction. All
 * money movement flows through the services here; controllers are thin and
 * guarded.
 */
@Module({
  imports: [PrismaModule, ConfigModule, AuthModule],
  controllers: [
    PaymentController,
    PayoutController,
    DisputeController,
    WebhookController,
    AdminFinanceController,
  ],
  providers: [
    PaymentRepository,
    LedgerService,
    FeeEngine,
    AuditService,
    PaymentService,
    PayoutService,
    CampaignFinanceService,
    WebhookService,
    DisputeService,
    AdminFinanceService,
    PaymentProviderFactory,
    CashfreePaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      useFactory: (factory: PaymentProviderFactory) => factory.getProvider('CASHFREE'),
      inject: [PaymentProviderFactory],
    },
    AdminGuard,
    PaymentOwnerGuard,
    CampaignBrandGuard,
    PayoutAccessGuard,
    DisputeAccessGuard,
  ],
  exports: [
    PaymentRepository,
    PaymentService,
    PayoutService,
    CampaignFinanceService,
    LedgerService,
    FeeEngine,
    AuditService,
    WebhookService,
    DisputeService,
  ],
})
export class PaymentModule {}
