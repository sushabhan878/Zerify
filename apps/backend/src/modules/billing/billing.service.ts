import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  BillingProfileOwnerType,
  GstVerificationStatus,
  Prisma,
} from '@prisma/client';
import { CashfreeVerificationService } from './services/cashfree-verification.service';
import {
  normalizeGstin,
  isValidGstinFormat,
  getStateFromGstin,
  evaluateNameMatch,
} from './utils/gst-validator.util';
import {
  CreateBillingProfileDto,
} from './dto/create-billing-profile.dto';
import {
  CreateGstRegistrationDto,
  ConfirmMismatchDto,
} from './dto/create-gst-registration.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cashfreeVerification: CashfreeVerificationService,
  ) {}

  /**
   * Resolves whether the user is a Brand or Creator and finds their profile.
   */
  async resolveUserProfile(userId: string) {
    const brand = await this.prisma.brandProfile.findUnique({
      where: { userId },
      select: { id: true, companyName: true },
    });

    if (brand) {
      return {
        ownerType: BillingProfileOwnerType.BRAND,
        brandProfileId: brand.id,
        influencerProfileId: null,
        defaultName: brand.companyName || 'Brand',
      };
    }

    const creator = await this.prisma.influencerProfile.findUnique({
      where: { userId },
      select: { id: true, handle: true, user: { select: { name: true } } },
    });

    if (creator) {
      return {
        ownerType: BillingProfileOwnerType.CREATOR,
        brandProfileId: null,
        influencerProfileId: creator.id,
        defaultName: creator.user?.name || creator.handle || 'Creator',
      };
    }

    throw new NotFoundException('No active Brand or Influencer profile found for current user.');
  }

  /**
   * Asserts that the authenticated user owns the given billing profile.
   */
  async assertProfileAccess(userId: string, profileId: string) {
    const profile = await this.prisma.billingProfile.findUnique({
      where: { id: profileId },
      include: {
        brandProfile: { select: { userId: true } },
        influencerProfile: { select: { userId: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Billing profile ${profileId} not found.`);
    }

    const ownerUserId = profile.brandProfile?.userId || profile.influencerProfile?.userId;
    if (ownerUserId !== userId) {
      throw new ForbiddenException('You do not have permission to access this billing profile.');
    }

    return profile;
  }

  /**
   * Lists or auto-initializes the billing profile for the user.
   */
  async getOrCreateDefaultProfile(userId: string) {
    const userRole = await this.resolveUserProfile(userId);

    let profile = await this.prisma.billingProfile.findFirst({
      where: userRole.ownerType === BillingProfileOwnerType.BRAND
        ? { brandProfileId: userRole.brandProfileId }
        : { influencerProfileId: userRole.influencerProfileId },
      include: {
        gstRegistrations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      profile = await this.prisma.billingProfile.create({
        data: {
          ownerType: userRole.ownerType,
          brandProfileId: userRole.brandProfileId,
          influencerProfileId: userRole.influencerProfileId,
          legalName: userRole.defaultName,
          countryCode: 'IN',
          isDefault: true,
        },
        include: {
          gstRegistrations: true,
        },
      });
    }

    return profile;
  }

  /**
   * Retrieves all billing profiles for current user.
   */
  async listProfiles(userId: string) {
    const userRole = await this.resolveUserProfile(userId);

    return this.prisma.billingProfile.findMany({
      where: userRole.ownerType === BillingProfileOwnerType.BRAND
        ? { brandProfileId: userRole.brandProfileId }
        : { influencerProfileId: userRole.influencerProfileId },
      include: {
        gstRegistrations: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Creates an additional billing profile.
   */
  async createProfile(userId: string, dto: CreateBillingProfileDto) {
    const userRole = await this.resolveUserProfile(userId);

    return this.prisma.billingProfile.create({
      data: {
        ownerType: userRole.ownerType,
        brandProfileId: userRole.brandProfileId,
        influencerProfileId: userRole.influencerProfileId,
        legalName: dto.legalName,
        tradeName: dto.tradeName,
        billingEmail: dto.billingEmail,
        billingPhone: dto.billingPhone,
        billingAddress: dto.billingAddress,
        stateCode: dto.stateCode,
        stateName: dto.stateName,
        countryCode: dto.countryCode || 'IN',
        isDefault: false,
      },
      include: {
        gstRegistrations: true,
      },
    });
  }

  /**
   * Adds a GSTIN registration record to a billing profile.
   */
  async addGstRegistration(userId: string, profileId: string, dto: CreateGstRegistrationDto) {
    await this.assertProfileAccess(userId, profileId);

    const normalizedGstin = normalizeGstin(dto.gstin);
    if (!isValidGstinFormat(normalizedGstin)) {
      throw new BadRequestException('Invalid 15-character GSTIN format.');
    }

    const { stateCode, stateName } = getStateFromGstin(normalizedGstin);

    // Check duplicate under this profile
    const existing = await this.prisma.gstRegistration.findUnique({
      where: {
        billingProfileId_gstin: {
          billingProfileId: profileId,
          gstin: normalizedGstin,
        },
      },
    });

    if (existing) {
      if (dto.autoVerify) {
        return this.verifyGstRegistration(userId, profileId, existing.id, dto.businessName);
      }
      return existing;
    }

    const registration = await this.prisma.gstRegistration.create({
      data: {
        billingProfileId: profileId,
        gstin: normalizedGstin,
        legalName: dto.businessName,
        tradeName: dto.tradeName,
        principalPlaceAddress: dto.billingAddress,
        stateJurisdiction: stateName,
        internalVerificationStatus: GstVerificationStatus.UNVERIFIED,
      },
    });

    if (dto.autoVerify) {
      return this.verifyGstRegistration(userId, profileId, registration.id, dto.businessName);
    }

    return registration;
  }

  /**
   * Executes Cashfree verification for a GST registration (FR-03, FR-05, FR-06).
   */
  async verifyGstRegistration(
    userId: string,
    profileId: string,
    registrationId: string,
    manualBusinessName?: string,
  ) {
    const profile = await this.assertProfileAccess(userId, profileId);

    const registration = await this.prisma.gstRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.billingProfileId !== profileId) {
      throw new NotFoundException(`GST registration ${registrationId} not found under profile.`);
    }

    const businessNameToVerify = manualBusinessName || registration.legalName || profile.legalName;

    // Create an audit attempt in PENDING state
    const attempt = await this.prisma.gstVerificationAttempt.create({
      data: {
        gstRegistrationId: registration.id,
        provider: 'CASHFREE',
        status: GstVerificationStatus.PENDING,
        initiatedByUserId: userId,
      },
    });

    // Mark registration PENDING
    await this.prisma.gstRegistration.update({
      where: { id: registration.id },
      data: {
        internalVerificationStatus: GstVerificationStatus.PENDING,
        lastAttemptAt: new Date(),
      },
    });

    // Execute Cashfree verification
    const result = await this.cashfreeVerification.verifyGstin(
      registration.gstin,
      businessNameToVerify,
    );

    let internalStatus: GstVerificationStatus = GstVerificationStatus.FAILED;
    let nameMatchScore = 0;
    let isNameMatched = false;

    if (result.success && result.isValidGstin) {
      const isGstActive = result.providerGstStatus?.toLowerCase() === 'active';

      if (!isGstActive) {
        internalStatus = GstVerificationStatus.INACTIVE;
      } else {
        // Compare user entered name with provider returned names
        const nameEval = evaluateNameMatch(
          businessNameToVerify,
          result.legalName,
          result.tradeName,
        );

        nameMatchScore = nameEval.score;
        isNameMatched = nameEval.isMatched;

        if (nameEval.isMatched) {
          internalStatus = GstVerificationStatus.VERIFIED;
        } else {
          internalStatus = GstVerificationStatus.MISMATCH;
        }
      }
    } else {
      internalStatus = GstVerificationStatus.FAILED;
    }

    // Complete the audit attempt record
    await this.prisma.gstVerificationAttempt.update({
      where: { id: attempt.id },
      data: {
        providerReferenceId: result.providerReferenceId || null,
        status: internalStatus,
        failureCode: result.failureCode || null,
        sanitizedMessage: result.errorMessage || (internalStatus === GstVerificationStatus.VERIFIED ? 'Verified successfully' : `Verification resolved to ${internalStatus}`),
        responseMetadata: (result.rawResponse as Prisma.InputJsonValue) || Prisma.JsonNull,
        completedAt: new Date(),
      },
    });

    // Update the GST registration record with provider data
    const updated = await this.prisma.gstRegistration.update({
      where: { id: registration.id },
      data: {
        legalName: result.legalName || registration.legalName,
        tradeName: result.tradeName || registration.tradeName,
        providerGstStatus: result.providerGstStatus,
        taxpayerType: result.taxpayerType,
        businessConstitution: result.businessConstitution,
        registrationDate: result.registrationDate,
        lastProviderUpdateDate: result.lastProviderUpdateDate,
        principalPlaceAddress: result.principalPlaceAddress || registration.principalPlaceAddress,
        stateJurisdiction: result.stateJurisdiction || registration.stateJurisdiction,
        centerJurisdiction: result.centerJurisdiction || registration.centerJurisdiction,
        internalVerificationStatus: internalStatus,
        providerReferenceId: result.providerReferenceId || null,
        nameMatchScore,
        isNameMatched,
        verifiedAt: internalStatus === GstVerificationStatus.VERIFIED ? new Date() : null,
      },
    });

    return {
      registration: updated,
      verification: {
        status: internalStatus,
        providerGstStatus: result.providerGstStatus,
        providerLegalName: result.legalName,
        providerTradeName: result.tradeName,
        nameMatchScore,
        isNameMatched,
        message: result.errorMessage || (internalStatus === GstVerificationStatus.VERIFIED ? 'GSTIN verified successfully.' : undefined),
      },
    };
  }

  /**
   * Resolves a name mismatch by letting user accept the registered legal name or update.
   */
  async confirmMismatch(
    userId: string,
    profileId: string,
    registrationId: string,
    dto: ConfirmMismatchDto,
  ) {
    await this.assertProfileAccess(userId, profileId);

    const registration = await this.prisma.gstRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found.');
    }

    if (dto.acceptProviderName) {
      return this.prisma.gstRegistration.update({
        where: { id: registrationId },
        data: {
          internalVerificationStatus: GstVerificationStatus.VERIFIED,
          isNameMatched: true,
          nameMatchScore: 1.0,
          verifiedAt: new Date(),
        },
      });
    }

    if (dto.updatedBusinessName) {
      return this.verifyGstRegistration(userId, profileId, registrationId, dto.updatedBusinessName);
    }

    return registration;
  }

  /**
   * Retrieves audit attempt history for a GST registration (FR-08).
   */
  async getVerificationHistory(userId: string, profileId: string, registrationId: string) {
    await this.assertProfileAccess(userId, profileId);

    return this.prisma.gstVerificationAttempt.findMany({
      where: { gstRegistrationId: registrationId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        provider: true,
        providerReferenceId: true,
        status: true,
        failureCode: true,
        sanitizedMessage: true,
        startedAt: true,
        completedAt: true,
      },
    });
  }

  /**
   * Deletes/detaches a GST registration.
   */
  async deleteGstRegistration(userId: string, profileId: string, registrationId: string) {
    await this.assertProfileAccess(userId, profileId);

    const registration = await this.prisma.gstRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.billingProfileId !== profileId) {
      throw new NotFoundException('Registration not found.');
    }

    return this.prisma.gstRegistration.delete({
      where: { id: registrationId },
    });
  }
}
