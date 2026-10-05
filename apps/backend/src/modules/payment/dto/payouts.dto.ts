import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  Max,
  ArrayMaxSize,
} from 'class-validator';

export class UpsertBeneficiaryDto {
  @IsOptional()
  @IsString()
  @IsIn(['CASHFREE'])
  provider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerBeneficiaryId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'])
  kycStatus?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'ACTIVE', 'SUSPENDED'])
  beneficiaryStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  accountHolderName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  accountLast4?: string;

  @IsOptional()
  @IsString()
  @MaxLength(11)
  ifscCode?: string;
}

export class CreatePayoutDto {
  @IsUUID()
  influencerProfileId: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tdsPercent?: number;

  @IsOptional()
  @IsString()
  invoiceReference?: string;
}

export class ResolveDisputeDto {
  @IsIn(['REFUND_COMPANY', 'RELEASE_INFLUENCER', 'SPLIT', 'NO_ACTION'])
  resolution: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  evidence?: string[];
}
