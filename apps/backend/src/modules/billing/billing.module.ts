import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { CashfreeVerificationService } from './services/cashfree-verification.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [BillingController],
  providers: [BillingService, CashfreeVerificationService],
  exports: [BillingService, CashfreeVerificationService],
})
export class BillingModule {}
