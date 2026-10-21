export type GstVerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'INACTIVE'
  | 'MISMATCH'
  | 'FAILED'
  | 'REVIEW_REQUIRED';

export interface GstRegistration {
  id: string;
  billingProfileId: string;
  gstin: string;
  legalName?: string | null;
  tradeName?: string | null;
  providerGstStatus?: string | null;
  taxpayerType?: string | null;
  businessConstitution?: string | null;
  registrationDate?: string | null;
  lastProviderUpdateDate?: string | null;
  principalPlaceAddress?: string | null;
  stateJurisdiction?: string | null;
  centerJurisdiction?: string | null;
  internalVerificationStatus: GstVerificationStatus;
  providerReferenceId?: string | null;
  nameMatchScore?: number | null;
  isNameMatched: boolean;
  verifiedAt?: string | null;
  lastAttemptAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingProfile {
  id: string;
  ownerType: 'BRAND' | 'CREATOR';
  brandProfileId?: string | null;
  influencerProfileId?: string | null;
  legalName: string;
  tradeName?: string | null;
  billingEmail?: string | null;
  billingPhone?: string | null;
  billingAddress?: string | null;
  stateCode?: string | null;
  stateName?: string | null;
  countryCode: string;
  isDefault: boolean;
  gstRegistrations: GstRegistration[];
}

export interface GstVerificationAttempt {
  id: string;
  provider: string;
  providerReferenceId?: string | null;
  status: GstVerificationStatus;
  failureCode?: string | null;
  sanitizedMessage?: string | null;
  startedAt: string;
  completedAt?: string | null;
}
