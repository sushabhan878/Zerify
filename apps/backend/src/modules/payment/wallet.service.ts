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
  FinancialAccountType,
  LedgerDirection,
  PayoutStatus,
} from '@prisma/client';
import { AddMoneyDto } from './dto/add-money.dto';
import { WithdrawMoneyDto } from './dto/withdraw-money.dto';
import { resolveCashfreeBankCode } from './utils/cashfree-banks';
import { LedgerService } from './ledger.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cashfreeProvider: CashfreePaymentProvider,
    private readonly configService: ConfigService,
    private readonly ledgerService: LedgerService,
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
    const savedBankAccounts: any[] = Array.isArray(escrowSetup.savedBankAccounts) ? escrowSetup.savedBankAccounts : [];

    return {
      id: wallet.id,
      brandId: wallet.brandId,
      currency: wallet.currency,
      balancePaise: wallet.balancePaise.toString(),
      balance,
      savedUpiIds,
      savedBankAccounts,
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
    const customerPhone =
      (brandProfile as any).contactPhone ||
      (brandProfile as any).phone ||
      (brandProfile.user as any)?.phone ||
      '9999999999';
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

    let upiCollectInitiated = false;
    let qrCodeData: string | null = null;
    let upiCollectResponse: any = null;
    let netbankingUrl: string | null = null;

    if (cfOrder.paymentSessionId) {
      const isSandbox = this.configService.get<string>('CASHFREE_ENVIRONMENT', 'sandbox') === 'sandbox';

      // 1. Dynamic QR Code flow
      if (dto.channel === 'qrcode') {
        try {
          const qrResponse: any = await this.cashfreeProvider.paySession(cfOrder.paymentSessionId, {
            upi: { channel: 'qrcode' },
          });
          qrCodeData = qrResponse?.data?.payload?.qrcode || null;
          this.logger.log(`Generated dynamic Cashfree QR Code for order ${payment.id}`);
        } catch (err: any) {
          this.logger.warn(`Cashfree QR generation note: ${err.message}`);
        }
      }
      // 2. UPI VPA Collect request flow
      else if (dto.upiId && dto.upiId.trim()) {
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

          // In sandbox environment only, simulate test approval
          const cfPaymentId = upiCollectResponse?.cf_payment_id ? String(upiCollectResponse.cf_payment_id) : null;
          if (isSandbox && cfPaymentId) {
            const simStatus = cleanUpi.toLowerCase().includes('fail') ? 'FAILED' : 'SUCCESS';
            await this.cashfreeProvider.simulatePayment(cfPaymentId, simStatus).catch((err) => {
              this.logger.warn(`Sandbox simulate notice: ${err.message}`);
            });
            this.logger.log(`Sandbox: Simulated payment status ${simStatus} for payment ID ${cfPaymentId}`);
          }
        } catch (err: any) {
          this.logger.warn(`Direct UPI collect session call note: ${err.message}`);
        }
      }
      // 3. Card payment flow
      else if (dto.paymentMethod === 'card' && dto.card) {
        try {
          const cleanCardNumber = dto.card.cardNumber.replace(/\D/g, '');
          if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            throw new BadRequestException('Card number must be between 13 and 19 digits.');
          }

          const expMonth = parseInt(dto.card.cardExpiryMm, 10);
          let expYear = parseInt(
            dto.card.cardExpiryYy.length === 2 ? `20${dto.card.cardExpiryYy}` : dto.card.cardExpiryYy,
            10,
          );
          if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
            throw new BadRequestException('Invalid expiration month (must be between 01 and 12).');
          }

          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth() + 1;
          if (isNaN(expYear) || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            throw new BadRequestException('Card has expired. Please check the expiration date.');
          }

          const cleanCvv = dto.card.cardCvv.replace(/\D/g, '');
          if (cleanCvv.length < 3 || cleanCvv.length > 4) {
            throw new BadRequestException('CVV code must be 3 or 4 digits.');
          }

          const cardPayload = {
            card: {
              channel: 'link',
              card_number: cleanCardNumber,
              card_holder_name: dto.card.cardHolderName || 'Zerify Customer',
              card_expiry_mm: dto.card.cardExpiryMm.padStart(2, '0'),
              card_expiry_yy: dto.card.cardExpiryYy.slice(-2),
              card_cvv: cleanCvv,
            },
          };

          let cfPaymentId: string | null = null;
          let isSimulatedSandboxCard = false;

          try {
            const cardResponse: any = await this.cashfreeProvider.paySession(cfOrder.paymentSessionId, cardPayload);
            cfPaymentId = cardResponse?.cf_payment_id ? String(cardResponse.cf_payment_id) : null;
            this.logger.log(`Initiated Card payment for order ${payment.id} (card: ****${cleanCardNumber.slice(-4)})`);
          } catch (payErr: any) {
            const errMsg = payErr.message || '';
            // If Cashfree merchant does not have S2S card mode enabled (standard in sandbox without PCI-DSS attestation)
            if (
              isSandbox &&
              (errMsg.includes('mode not enabled') ||
                errMsg.includes('1005') ||
                errMsg.includes('disabled mode') ||
                errMsg.includes('feature is not enabled'))
            ) {
              this.logger.warn(
                `Cashfree sandbox S2S mode restriction: ${errMsg}. Activating Sandbox Test Card simulation for card ****${cleanCardNumber.slice(-4)}`,
              );
              isSimulatedSandboxCard = true;
            } else {
              throw payErr;
            }
          }

          if (isSimulatedSandboxCard) {
            const isFailureCard = cleanCardNumber.endsWith('0005') || cleanCardNumber.endsWith('1112');
            if (isFailureCard) {
              await this.prisma.addMoneyPayment.update({
                where: { id: payment.id },
                data: {
                  providerPaymentId: 'sim_fail_card_0005',
                  status: AddMoneyPaymentStatus.FAILED,
                },
              });
              throw new BadRequestException(
                'Transaction declined: Card failed authentication or payment test simulator reported decline.',
              );
            } else {
              const simPaymentId = `sim_card_${cleanCardNumber.slice(-4)}_${Date.now()}`;
              await this.prisma.addMoneyPayment.update({
                where: { id: payment.id },
                data: { providerPaymentId: simPaymentId },
              });
              this.logger.log(`Sandbox: Registered simulated test card payment ${simPaymentId} for order ${payment.id}`);
            }
          } else if (isSandbox && cfPaymentId) {
            // Determine success or fail based on card number (e.g. failure test cards)
            const isFailureCard = cleanCardNumber.endsWith('0005') || cleanCardNumber.endsWith('1112');
            const simStatus = isFailureCard ? 'FAILED' : 'SUCCESS';
            await this.cashfreeProvider.simulatePayment(cfPaymentId, simStatus).catch((err) => {
              this.logger.warn(`Sandbox simulate card notice: ${err.message}`);
            });
            this.logger.log(`Sandbox: Simulated Card payment status ${simStatus} for payment ID ${cfPaymentId}`);
          }
        } catch (err: any) {
          this.logger.error(`Cashfree Card payment error: ${err.message}`);
          let msg = err.message || 'Card payment processing failed';
          const lower = msg.toLowerCase();
          if (lower.includes('expired')) {
            msg = 'Card has expired. Please check the expiration date.';
          } else if (lower.includes('cvv')) {
            msg = 'The CVV security code provided is invalid.';
          } else if (lower.includes('card_number') || lower.includes('checksum')) {
            msg = 'The card number provided is invalid or unsupported.';
          } else if (lower.includes('declined') || lower.includes('decline')) {
            msg = 'Card was declined by the bank or payment test simulator.';
          }
          throw new BadRequestException(msg);
        }
      }
      // 4. NetBanking payment flow
      else if (dto.paymentMethod === 'netbanking') {
        try {
          const numericBankCode = resolveCashfreeBankCode(dto.bankCode, isSandbox);
          const nbPayload = {
            netbanking: {
              channel: 'link',
              netbanking_bank_code: numericBankCode,
            },
          };

          let cfPaymentId: string | null = null;
          let isSimulatedSandboxNb = false;

          try {
            const nbResponse: any = await this.cashfreeProvider.paySession(cfOrder.paymentSessionId, nbPayload);
            cfPaymentId = nbResponse?.cf_payment_id ? String(nbResponse.cf_payment_id) : null;
            netbankingUrl = nbResponse?.data?.url || nbResponse?.payment_url || null;
            this.logger.log(`Initiated NetBanking payment for order ${payment.id} (Bank: ${numericBankCode})`);
          } catch (payErr: any) {
            const errMsg = payErr.message || '';
            if (
              isSandbox &&
              (errMsg.includes('mode not enabled') ||
                errMsg.includes('disabled mode') ||
                errMsg.includes('feature is not enabled'))
            ) {
              this.logger.warn(`Cashfree sandbox NetBanking mode restriction: ${errMsg}. Activating Sandbox NetBanking simulation.`);
              isSimulatedSandboxNb = true;
            } else {
              throw payErr;
            }
          }

          if (isSimulatedSandboxNb) {
            const simPaymentId = `sim_nb_${numericBankCode}_${Date.now()}`;
            await this.prisma.addMoneyPayment.update({
              where: { id: payment.id },
              data: { providerPaymentId: simPaymentId },
            });
            this.logger.log(`Sandbox: Registered simulated NetBanking payment ${simPaymentId} for order ${payment.id}`);
          } else if (isSandbox && cfPaymentId) {
            await this.cashfreeProvider.simulatePayment(cfPaymentId, 'SUCCESS').catch((err) => {
              this.logger.warn(`Sandbox simulate NetBanking notice: ${err.message}`);
            });
            this.logger.log(`Sandbox: Simulated NetBanking status SUCCESS for payment ID ${cfPaymentId}`);
          }

          if (netbankingUrl) {
            await this.prisma.addMoneyPayment.update({
              where: { id: payment.id },
              data: { paymentUrl: netbankingUrl },
            });
          }
        } catch (err: any) {
          this.logger.error(`Cashfree NetBanking payment error: ${err.message}`);
          throw new BadRequestException(err.message || 'NetBanking payment initiation failed');
        }
      }
    }

    return {
      id: payment.id,
      providerOrderId: payment.providerOrderId,
      paymentSessionId: payment.providerSessionId,
      paymentUrl: netbankingUrl || payment.paymentUrl,
      amount: dto.amount,
      currency: payment.currency,
      status: payment.status,
      upiCollectInitiated,
      upiId: dto.upiId || undefined,
      qrCode: qrCodeData,
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

    const isSandbox = this.configService.get<string>('CASHFREE_ENVIRONMENT', 'sandbox') === 'sandbox';

    if (
      cfStatus.status === 'SUCCESSFUL' ||
      (isSandbox && (payment.providerPaymentId?.startsWith('sim_card_') || payment.providerPaymentId?.startsWith('sim_nb_')))
    ) {
      const updatedWallet = await this.creditWalletAtomically({
        paymentId: payment.id,
        walletId: payment.walletId,
        amountPaise: payment.amountPaise,
        currency: payment.currency,
        providerPaymentId: cfStatus.providerPaymentId || payment.providerPaymentId || null,
      });

      return {
        id: payment.id,
        providerOrderId: payment.providerOrderId,
        providerPaymentId: cfStatus.providerPaymentId || payment.providerPaymentId,
        status: AddMoneyPaymentStatus.PAID,
        amount: Number(payment.amountPaise) / 100,
        currency: payment.currency,
        walletBalance: Number(updatedWallet.balancePaise) / 100,
        message: 'Payment verified and funds successfully credited to Zerify Wallet',
      };
    } else if (cfStatus.status === 'FAILED' || (isSandbox && payment.providerPaymentId?.startsWith('sim_fail_card'))) {
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
        failureReason: cfStatus.failureReason || 'Card payment was declined by issuing bank (Sandbox Simulation)',
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
   * Simulates a successful payment for testing QR / UPI in sandbox mode.
   */
  async simulateAddMoneyPayment(userId: string, paymentIdentifier: string) {
    const isSandbox = this.configService.get<string>('CASHFREE_ENVIRONMENT', 'sandbox') === 'sandbox';
    if (!isSandbox) {
      throw new BadRequestException('Payment simulation is only available in sandbox mode');
    }

    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!brandProfile) {
      throw new NotFoundException('Brand profile not found');
    }

    const payment = await this.prisma.addMoneyPayment.findFirst({
      where: {
        brandId: brandProfile.id,
        OR: [{ id: paymentIdentifier }, { providerOrderId: paymentIdentifier }],
      },
    });
    if (!payment) {
      throw new NotFoundException(`Payment record '${paymentIdentifier}' not found`);
    }

    // Retrieve order payments to find cf_payment_id
    const payments = await this.cashfreeProvider.getOrderPayments(payment.providerOrderId).catch(() => []);
    const pendingPayment = Array.isArray(payments) && payments.length > 0 ? payments[0] : null;
    const cfPaymentId = pendingPayment?.cf_payment_id ? String(pendingPayment.cf_payment_id) : null;

    if (cfPaymentId) {
      await this.cashfreeProvider.simulatePayment(cfPaymentId, 'SUCCESS').catch((err) => {
        this.logger.warn(`Simulation notice: ${err.message}`);
      });
      this.logger.log(`Simulated payment SUCCESS for cf_payment_id ${cfPaymentId}`);
    }

    return this.verifyAddMoneyPayment(userId, payment.id);
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

  /**
   * Withdraws funds from BrandWallet (Brand) or Milestone Payable (Influencer) to Bank Account, Card, or UPI VPA via Cashfree.
   * Influencer withdrawals deduct a 7% Zerify platform service fee.
   */
  async withdrawMoney(userId: string, dto: WithdrawMoneyDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const isInfluencer = user?.role === 'INFLUENCER' || dto.zerifyFee !== undefined;

    const influencerProfile = isInfluencer
      ? await this.prisma.influencerProfile.findUnique({
          where: { userId },
          include: { user: true },
        })
      : null;

    const brandProfile = !influencerProfile
      ? await this.prisma.brandProfile.findUnique({
          where: { userId },
          include: { user: true },
        })
      : null;

    if (!brandProfile && !influencerProfile) {
      throw new NotFoundException('User profile not found for this account');
    }

    if (dto.payoutMethod === 'bank_transfer' || dto.payoutMethod === 'netbanking') {
      if (!dto.bankAccount?.accountNumber && !dto.bankCode) {
        throw new BadRequestException('Bank account details or bank selection is required');
      }
    } else if (dto.payoutMethod === 'card') {
      if (!dto.card?.cardNumber || !dto.card.cardNumber.replace(/\D/g, '')) {
        throw new BadRequestException('A valid 15 or 16-digit card number is required for Card withdrawal');
      }
    } else if (dto.payoutMethod === 'upi') {
      if (!dto.upiId || !dto.upiId.trim() || !dto.upiId.includes('@')) {
        throw new BadRequestException('A valid UPI ID (e.g. name@okhdfcbank) is required for UPI payout');
      }
    } else {
      throw new BadRequestException('Invalid payout method. Supported methods: upi, card, netbanking, bank_transfer');
    }

    const transferId = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cleanCard = dto.card?.cardNumber ? dto.card.cardNumber.replace(/\D/g, '') : undefined;

    if (brandProfile) {
      // BRAND FLOW (0% fee, from BrandWallet)
      const wallet = await this.prisma.brandWallet.findUnique({
        where: { brandId: brandProfile.id },
      });

      if (!wallet) {
        throw new NotFoundException('Brand wallet not found');
      }

      const amountInRupees = Number(dto.amount);
      if (isNaN(amountInRupees) || amountInRupees < 100) {
        throw new BadRequestException('Minimum withdrawal amount is ₹100');
      }

      const amountPaise = BigInt(Math.round(amountInRupees * 100));
      if (wallet.balancePaise < amountPaise) {
        throw new BadRequestException(
          `Insufficient wallet balance. Available: ₹${(Number(wallet.balancePaise) / 100).toFixed(2)}, Requested: ₹${amountInRupees}`,
        );
      }

      const beneficiaryName =
        dto.payoutMethod === 'card'
          ? dto.card?.cardHolderName?.trim() || brandProfile.companyName || brandProfile.user?.name || 'Zerify Customer'
          : dto.payoutMethod === 'bank_transfer' || dto.payoutMethod === 'netbanking'
          ? dto.bankAccount?.accountHolderName?.trim() || brandProfile.companyName || brandProfile.user?.name || 'Zerify Brand'
          : brandProfile.companyName || brandProfile.user?.name || 'Zerify Brand';

      const beneficiaryPhone =
        (brandProfile as any).contactPhone ||
        (brandProfile as any).phone ||
        (brandProfile.user as any)?.phone ||
        '9999999999';
      const beneficiaryEmail = brandProfile.user?.email || 'billing@zerify.in';

      let payoutResult: { status: string; referenceId: string; raw?: any };
      try {
        payoutResult = await this.cashfreeProvider.directPayoutTransfer({
          transferId,
          amount: amountInRupees,
          transferMode: dto.payoutMethod === 'upi' ? 'upi' : dto.payoutMethod === 'card' ? 'card' : 'banktransfer',
          beneficiaryName,
          beneficiaryPhone,
          beneficiaryEmail,
          accountNumber: dto.bankAccount?.accountNumber?.replace(/\s+/g, '') || (dto.bankCode ? `99990000${dto.bankCode}` : undefined),
          ifsc: dto.bankAccount?.ifscCode?.trim()?.toUpperCase() || `${dto.bankCode || 'HDFC'}0000123`,
          vpa: dto.upiId?.trim(),
          cardNumber: cleanCard,
        });
      } catch (payoutErr: any) {
        this.logger.error(`Cashfree withdrawal failure: ${payoutErr.message}`);
        throw new BadRequestException(payoutErr.message || 'Failed to process payout via Cashfree');
      }

      const updatedWallet = await this.prisma.$transaction(async (tx) => {
        const freshWallet = await tx.brandWallet.findUniqueOrThrow({
          where: { id: wallet.id },
        });

        if (freshWallet.balancePaise < amountPaise) {
          throw new BadRequestException('Insufficient wallet balance');
        }

        const decWallet = await tx.brandWallet.update({
          where: { id: wallet.id },
          data: {
            balancePaise: { decrement: amountPaise },
          },
        });

        const destLabel =
          dto.payoutMethod === 'upi'
            ? `UPI (${dto.upiId?.trim()})`
            : dto.payoutMethod === 'card'
            ? `Card (••••${cleanCard?.slice(-4) || 'CARD'})`
            : `Net Banking (${dto.bankCode || dto.bankAccount?.bankName || 'Bank'})`;

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: WalletTransactionType.REFUND,
            status: WalletTransactionStatus.COMPLETED,
            amountPaise: amountPaise,
            currency: wallet.currency,
            description: `Withdrawal to ${destLabel} [Ref: ${payoutResult.referenceId}]`,
          },
        });

        if (dto.saveDestination) {
          const currentEscrow = (brandProfile.escrowSetup as any) || {};
          if (dto.payoutMethod === 'upi' && dto.upiId?.trim()) {
            const currentUpis: string[] = Array.isArray(currentEscrow.savedUpiIds) ? currentEscrow.savedUpiIds : [];
            if (!currentUpis.includes(dto.upiId.trim())) {
              await tx.brandProfile.update({
                where: { id: brandProfile.id },
                data: {
                  escrowSetup: {
                    ...currentEscrow,
                    savedUpiIds: [dto.upiId.trim(), ...currentUpis].slice(0, 5),
                  },
                },
              });
            }
          } else if (dto.payoutMethod === 'bank_transfer' && dto.bankAccount) {
            const currentBanks: any[] = Array.isArray(currentEscrow.savedBankAccounts) ? currentEscrow.savedBankAccounts : [];
            const cleanAcc = dto.bankAccount.accountNumber.replace(/\s+/g, '');
            const exists = currentBanks.some((b: any) => b.accountNumber === cleanAcc);
            if (!exists) {
              const bankToSave = {
                accountNumber: cleanAcc,
                ifscCode: dto.bankAccount.ifscCode.trim().toUpperCase(),
                accountHolderName: dto.bankAccount.accountHolderName.trim(),
                bankName: dto.bankAccount.bankName?.trim() || 'Bank',
              };
              await tx.brandProfile.update({
                where: { id: brandProfile.id },
                data: {
                  escrowSetup: {
                    ...currentEscrow,
                    savedBankAccounts: [bankToSave, ...currentBanks].slice(0, 5),
                  },
                },
              });
            }
          }
        }

        return decWallet;
      });

      this.logger.log(
        `Processed withdrawal of ₹${amountInRupees} for brand ${brandProfile.id} [Ref: ${payoutResult.referenceId}]. New balance: ₹${Number(updatedWallet.balancePaise) / 100}`,
      );

      return {
        success: true,
        transferId,
        referenceId: payoutResult.referenceId,
        amount: amountInRupees,
        currency: wallet.currency,
        payoutMethod: dto.payoutMethod,
        newBalance: Number(updatedWallet.balancePaise) / 100,
        message: `Successfully processed withdrawal of ₹${amountInRupees} via ${dto.payoutMethod === 'upi' ? 'UPI' : 'Bank Transfer'}.`,
      };
    } else {
      // INFLUENCER FLOW (7% Zerify Platform Fee deduction)
      const balanceMinor = await this.ledgerService.getBalance({
        ownerType: 'INFLUENCER',
        ownerId: influencerProfile!.id,
        accountType: FinancialAccountType.INFLUENCER_PAYABLE,
        currency: 'INR',
      });

      const balanceInRupees = Number(balanceMinor) / 100;
      const requestedGross = dto.grossAmount ? Number(dto.grossAmount) : Math.round(Number(dto.amount) / 0.93);

      if (isNaN(requestedGross) || requestedGross < 100) {
        throw new BadRequestException('Minimum withdrawal amount is ₹100');
      }

      if (requestedGross > balanceInRupees) {
        throw new BadRequestException(
          `Cannot exceed available balance of ₹${balanceInRupees.toLocaleString('en-IN')}`,
        );
      }

      // 7% Zerify platform fee
      const zerifyFee = Number((requestedGross * 0.07).toFixed(2));
      const netPayoutRupees = Number((requestedGross - zerifyFee).toFixed(2));
      const grossPaise = BigInt(Math.round(requestedGross * 100));
      const zerifyFeePaise = BigInt(Math.round(zerifyFee * 100));
      const netPayoutPaise = grossPaise - zerifyFeePaise;

      const beneficiaryName =
        dto.payoutMethod === 'card'
          ? dto.card?.cardHolderName?.trim() || influencerProfile!.user?.name || influencerProfile!.handle || 'Creator'
          : dto.payoutMethod === 'bank_transfer' || dto.payoutMethod === 'netbanking'
          ? dto.bankAccount?.accountHolderName?.trim() || influencerProfile!.user?.name || influencerProfile!.handle || 'Creator'
          : influencerProfile!.user?.name || influencerProfile!.handle || 'Creator';

      const beneficiaryPhone = (influencerProfile!.user as any)?.phoneNumber || '9999999999';
      const beneficiaryEmail = influencerProfile!.user?.email || 'creator@zerify.in';

      let payoutResult: { status: string; referenceId: string; raw?: any };
      try {
        payoutResult = await this.cashfreeProvider.directPayoutTransfer({
          transferId,
          amount: netPayoutRupees,
          transferMode: dto.payoutMethod === 'upi' ? 'upi' : dto.payoutMethod === 'card' ? 'card' : 'banktransfer',
          beneficiaryName,
          beneficiaryPhone,
          beneficiaryEmail,
          accountNumber: dto.bankAccount?.accountNumber?.replace(/\s+/g, '') || (dto.bankCode ? `99990000${dto.bankCode}` : undefined),
          ifsc: dto.bankAccount?.ifscCode?.trim()?.toUpperCase() || `${dto.bankCode || 'HDFC'}0000123`,
          vpa: dto.upiId?.trim(),
          cardNumber: cleanCard,
        });
      } catch (payoutErr: any) {
        this.logger.error(`Cashfree creator withdrawal failure: ${payoutErr.message}`);
        throw new BadRequestException(payoutErr.message || 'Failed to process payout via Cashfree');
      }

      // Post balanced ledger transaction for influencer withdrawal
      await this.ledgerService.postTransaction({
        referenceType: 'PAYOUT',
        referenceId: transferId,
        description: `Creator withdrawal via ${dto.payoutMethod.toUpperCase()} (Net: ₹${netPayoutRupees}, 7% Fee: ₹${zerifyFee}) [Ref: ${payoutResult.referenceId}]`,
        idempotencyKey: `wd:${transferId}:ledger`,
        currency: 'INR',
        legs: [
          {
            ownerType: 'INFLUENCER',
            ownerId: influencerProfile!.id,
            accountType: FinancialAccountType.INFLUENCER_PAYABLE,
            direction: LedgerDirection.DEBIT,
            amountMinor: grossPaise,
          },
          {
            ownerType: 'PLATFORM',
            ownerId: null,
            accountType: FinancialAccountType.PLATFORM_REVENUE,
            direction: LedgerDirection.CREDIT,
            amountMinor: zerifyFeePaise,
          },
          {
            ownerType: 'PLATFORM',
            ownerId: null,
            accountType: FinancialAccountType.PAYMENT_CLEARING,
            direction: LedgerDirection.CREDIT,
            amountMinor: netPayoutPaise,
          },
        ],
      });

      // Record ZerifyPayout row
      await this.prisma.zerifyPayout.create({
        data: {
          influencerProfileId: influencerProfile!.id,
          amountMinor: netPayoutPaise,
          grossAmountMinor: grossPaise,
          tdsAmountMinor: zerifyFeePaise,
          netPayoutMinor: netPayoutPaise,
          currency: 'INR',
          status: PayoutStatus.COMPLETED,
          provider: 'CASHFREE',
          providerPayoutId: payoutResult.referenceId,
          idempotencyKey: transferId,
        },
      });

      const newBalance = Math.max(0, balanceInRupees - requestedGross);

      return {
        success: true,
        transferId,
        referenceId: payoutResult.referenceId,
        amount: netPayoutRupees,
        grossAmount: requestedGross,
        zerifyFee,
        currency: 'INR',
        payoutMethod: dto.payoutMethod,
        newBalance,
        message: `Successfully processed withdrawal of ₹${netPayoutRupees.toLocaleString('en-IN')} (after 7% Zerify platform fee: ₹${zerifyFee.toLocaleString('en-IN')}) via ${dto.payoutMethod.toUpperCase()}.`,
      };
    }
  }
}
