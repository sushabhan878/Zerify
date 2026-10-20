import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CashfreePaymentProvider } from './providers/cashfree/cashfree.provider';
import {
  AddMoneyPaymentStatus,
  WalletTransactionType,
  WalletTransactionStatus,
  Prisma,
} from '@prisma/client';
import { AddMoneyDto } from './dto/add-money.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cashfreeProvider: CashfreePaymentProvider,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Resolves or initializes the brand wallet for a given user.
   */
  async getOrCreateWallet(userId: string) {
    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!brandProfile) {
      throw new NotFoundException('Brand profile not found for this user account');
    }

    let wallet = await this.prisma.brandWallet.findUnique({
      where: { brandId: brandProfile.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      wallet = await this.prisma.brandWallet.create({
        data: {
          brandId: brandProfile.id,
          currency: 'INR',
          balancePaise: BigInt(0),
        },
        include: {
          transactions: true,
        },
      });
      this.logger.log(`Created new BrandWallet for brandProfile ${brandProfile.id}`);
    }

    const balancePaise = Number(wallet.balancePaise);
    const balance = balancePaise / 100;
    const escrowSetup = (brandProfile.escrowSetup as any) || {};
    const savedUpiIds: string[] = Array.isArray(escrowSetup.savedUpiIds) ? escrowSetup.savedUpiIds : [];

    return {
      id: wallet.id,
      brandId: wallet.brandId,
      currency: wallet.currency,
      balancePaise: wallet.balancePaise.toString(),
      balance,
      savedUpiIds,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      transactions: wallet.transactions.map((tx) => ({
        id: tx.id,
        walletId: tx.walletId,
        paymentId: tx.paymentId,
        type: tx.type,
        status: tx.status,
        amount: Number(tx.amountPaise) / 100,
        amountPaise: tx.amountPaise.toString(),
        currency: tx.currency,
        description: tx.description,
        createdAt: tx.createdAt,
      })),
    };
  }

  /**
   * Initiates adding funds to brand wallet via Cashfree Payment Gateway.
   */
  async addMoney(userId: string, dto: AddMoneyDto) {
    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!brandProfile) {
      throw new NotFoundException('Brand profile not found. Please complete profile setup first.');
    }

    // Ensure wallet exists
    let wallet = await this.prisma.brandWallet.findUnique({
      where: { brandId: brandProfile.id },
    });

    if (!wallet) {
      wallet = await this.prisma.brandWallet.create({
        data: {
          brandId: brandProfile.id,
          currency: 'INR',
          balancePaise: BigInt(0),
        },
      });
    }

    const currency = dto.currency || 'INR';
    const amountPaise = BigInt(Math.round(dto.amount * 100));
    const idempotencyKey =
      dto.idempotencyKey ||
      `topup_${brandProfile.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Check idempotency for existing order
    const existing = await this.prisma.addMoneyPayment.findUnique({
      where: {
        brandId_idempotencyKey: {
          brandId: brandProfile.id,
          idempotencyKey,
        },
      },
    });

    if (existing) {
      if (existing.status === AddMoneyPaymentStatus.PAID) {
        throw new ConflictException('Payment for this order has already been completed.');
      }
      return {
        id: existing.id,
        providerOrderId: existing.providerOrderId,
        paymentSessionId: existing.providerSessionId,
        paymentUrl: existing.paymentUrl,
        amount: Number(existing.amountPaise) / 100,
        currency: existing.currency,
        status: existing.status,
      };
    }

    // Generate unique internal ID and Cashfree provider order ID
    const paymentId = `topup_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const returnUrl =
      dto.returnUrl ||
      this.configService.get<string>(
        'CASHFREE_RETURN_URL',
        'http://localhost:3000/dashboard?tab=payments&status=success',
      );

    const customerId = `cust_${brandProfile.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)}`;
    const customerPhone = '9999999999';
    const customerEmail = brandProfile.user?.email || 'billing@zerify.in';
    const customerName = brandProfile.companyName || brandProfile.user?.name || 'Zerify Brand';

    // Create Order with Cashfree
    const cfOrder = await this.cashfreeProvider.createOrder({
      paymentId,
      amountMinor: Number(amountPaise),
      currency,
      orderDescription: `Zerify Wallet Top-up ₹${dto.amount}`,
      returnUrl,
      customer: {
        customerId,
        customerPhone,
        customerEmail,
        customerName,
      },
    });

    // Store AddMoneyPayment record
    const payment = await this.prisma.addMoneyPayment.create({
      data: {
        id: paymentId,
        brandId: brandProfile.id,
        walletId: wallet.id,
        provider: 'cashfree',
        providerOrderId: cfOrder.providerOrderId,
        providerSessionId: cfOrder.paymentSessionId || null,
        paymentUrl: cfOrder.paymentUrl || null,
        amountPaise,
        currency,
        status: AddMoneyPaymentStatus.PENDING,
        idempotencyKey,
      },
    });

    this.logger.log(
      `Initialized AddMoneyPayment ${payment.id} (Order: ${cfOrder.providerOrderId}) for ₹${dto.amount}`,
    );

    // If UPI ID was provided, trigger direct UPI collect request to user's UPI app!
    let upiCollectInitiated = false;
    let upiCollectResponse: any = null;

    if (dto.upiId && dto.upiId.trim() && cfOrder.paymentSessionId) {
      const cleanUpi = dto.upiId.trim();

      // If requested, save UPI ID for future quick payments
      if (dto.saveUpiId) {
        await this.persistSavedUpiId(brandProfile.id, cleanUpi);
      }

      try {
        upiCollectResponse = await this.cashfreeProvider.paySession(cfOrder.paymentSessionId, {
          upi: {
            channel: 'collect',
            upi_id: cleanUpi,
          },
        });
        upiCollectInitiated = true;
        this.logger.log(`Initiated UPI collect request to ${cleanUpi} for payment ${payment.id}`);
      } catch (err: any) {
        this.logger.warn(`Direct UPI collect session call note: ${err.message}`);
      }
    }

    return {
      id: payment.id,
      providerOrderId: payment.providerOrderId,
      paymentSessionId: payment.providerSessionId,
      paymentUrl: payment.paymentUrl,
      amount: dto.amount,
      currency: payment.currency,
      status: payment.status,
      upiCollectInitiated,
      upiId: dto.upiId || undefined,
    };
  }

  /**
   * Verifies an AddMoneyPayment with Cashfree and credits the wallet atomically.
   */
  async verifyAddMoneyPayment(userId: string, paymentIdentifier: string) {
    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });

    if (!brandProfile) {
      throw new NotFoundException('Brand profile not found');
    }

    const payment = await this.prisma.addMoneyPayment.findFirst({
      where: {
        brandId: brandProfile.id,
        OR: [
          { id: paymentIdentifier },
          { providerOrderId: paymentIdentifier },
        ],
      },
      include: { wallet: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record '${paymentIdentifier}' not found`);
    }

    // If already paid, return early (idempotent)
    if (payment.status === AddMoneyPaymentStatus.PAID) {
      return {
        id: payment.id,
        providerOrderId: payment.providerOrderId,
        status: AddMoneyPaymentStatus.PAID,
        creditedAt: payment.creditedAt,
        amount: Number(payment.amountPaise) / 100,
        currency: payment.currency,
        walletBalance: Number(payment.wallet.balancePaise) / 100,
        message: 'Payment has already been successfully credited',
      };
    }

    // Inquire Cashfree for ground truth order status
    const cfStatus = await this.cashfreeProvider.getOrder(payment.providerOrderId);

    if (cfStatus.status === 'SUCCESSFUL') {
      const updatedWallet = await this.creditWalletAtomically({
        paymentId: payment.id,
        walletId: payment.walletId,
        amountPaise: payment.amountPaise,
        currency: payment.currency,
        providerPaymentId: cfStatus.providerPaymentId || null,
      });

      return {
        id: payment.id,
        providerOrderId: payment.providerOrderId,
        providerPaymentId: cfStatus.providerPaymentId,
        status: AddMoneyPaymentStatus.PAID,
        amount: Number(payment.amountPaise) / 100,
        currency: payment.currency,
        walletBalance: Number(updatedWallet.balancePaise) / 100,
        message: 'Payment verified and funds successfully credited to Zerify Wallet',
      };
    } else if (cfStatus.status === 'FAILED') {
      await this.prisma.addMoneyPayment.update({
        where: { id: payment.id },
        data: { status: AddMoneyPaymentStatus.FAILED },
      });

      return {
        id: payment.id,
        providerOrderId: payment.providerOrderId,
        status: AddMoneyPaymentStatus.FAILED,
        amount: Number(payment.amountPaise) / 100,
        currency: payment.currency,
        failureReason: cfStatus.failureReason || 'Payment failed or declined by provider',
      };
    }

    // Still pending / active
    return {
      id: payment.id,
      providerOrderId: payment.providerOrderId,
      status: AddMoneyPaymentStatus.PENDING,
      amount: Number(payment.amountPaise) / 100,
      currency: payment.currency,
      message: 'Payment is awaiting authorization or confirmation',
    };
  }

  /**
   * Internal atomic operation to credit wallet and log transaction.
   * Safe against concurrent calls / duplicate webhook deliveries.
   */
  async creditWalletAtomically(params: {
    paymentId: string;
    walletId: string;
    amountPaise: bigint;
    currency: string;
    providerPaymentId: string | null;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Re-read payment to prevent double credit
      const current = await tx.addMoneyPayment.findUnique({
        where: { id: params.paymentId },
      });

      if (!current || current.status === AddMoneyPaymentStatus.PAID) {
        return tx.brandWallet.findUniqueOrThrow({
          where: { id: params.walletId },
        });
      }

      // 1. Mark payment as PAID
      await tx.addMoneyPayment.update({
        where: { id: params.paymentId },
        data: {
          status: AddMoneyPaymentStatus.PAID,
          providerPaymentId: params.providerPaymentId,
          creditedAt: new Date(),
        },
      });

      // 2. Increment wallet balance
      const updatedWallet = await tx.brandWallet.update({
        where: { id: params.walletId },
        data: {
          balancePaise: { increment: params.amountPaise },
        },
      });

      // 3. Create wallet transaction record
      await tx.walletTransaction.create({
        data: {
          walletId: params.walletId,
          paymentId: params.paymentId,
          type: WalletTransactionType.TOPUP,
          status: WalletTransactionStatus.COMPLETED,
          amountPaise: params.amountPaise,
          currency: params.currency,
          description: `Zerify Wallet Top-up via Cashfree (₹${Number(params.amountPaise) / 100})`,
        },
      });

      this.logger.log(
        `Wallet ${params.walletId} credited with ${params.amountPaise} paise. New balance: ${updatedWallet.balancePaise}`,
      );

      return updatedWallet;
    });
  }

  /**
   * Processes webhook events from Cashfree specifically for wallet add-money payments.
   */
  async processWebhookPayment(providerOrderId: string, cfPaymentId?: string) {
    const payment = await this.prisma.addMoneyPayment.findUnique({
      where: { providerOrderId },
    });

    if (!payment) {
      return null;
    }

    if (payment.status === AddMoneyPaymentStatus.PAID) {
      this.logger.log(`Webhook: AddMoneyPayment ${payment.id} already marked as PAID`);
      return payment;
    }

    const updated = await this.creditWalletAtomically({
      paymentId: payment.id,
      walletId: payment.walletId,
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      providerPaymentId: cfPaymentId || null,
    });

    return updated;
  }

  /**
   * Helper to persist a UPI ID in the brand's escrowSetup JSON
   */
  async persistSavedUpiId(brandProfileId: string, upiId: string) {
    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { id: brandProfileId },
    });
    if (!brandProfile) return;

    const currentSetup = (brandProfile.escrowSetup as any) || {};
    const existingList: string[] = Array.isArray(currentSetup.savedUpiIds)
      ? currentSetup.savedUpiIds
      : [];
    const cleanId = upiId.trim();

    if (cleanId && !existingList.includes(cleanId)) {
      existingList.push(cleanId);
      await this.prisma.brandProfile.update({
        where: { id: brandProfileId },
        data: {
          escrowSetup: {
            ...currentSetup,
            savedUpiIds: existingList,
          },
        },
      });
    }
    return existingList;
  }

  /**
   * User-triggered save UPI ID endpoint handler
   */
  async saveUpiId(userId: string, upiId: string) {
    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!brandProfile) throw new NotFoundException('Brand profile not found');
    const saved = await this.persistSavedUpiId(brandProfile.id, upiId);
    return { savedUpiIds: saved || [] };
  }

  /**
   * User-triggered remove saved UPI ID endpoint handler
   */
  async deleteUpiId(userId: string, upiId: string) {
    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!brandProfile) throw new NotFoundException('Brand profile not found');

    const currentSetup = (brandProfile.escrowSetup as any) || {};
    const existingList: string[] = Array.isArray(currentSetup.savedUpiIds)
      ? currentSetup.savedUpiIds
      : [];
    const updated = existingList.filter((id) => id.toLowerCase() !== upiId.trim().toLowerCase());

    await this.prisma.brandProfile.update({
      where: { id: brandProfile.id },
      data: {
        escrowSetup: {
          ...currentSetup,
          savedUpiIds: updated,
        },
      },
    });

    return { savedUpiIds: updated };
  }
}
