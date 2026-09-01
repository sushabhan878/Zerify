import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentModel } from '@prisma/client';

export class CampaignDeliverableDto {
  @IsOptional()
  @IsString()
  platform?: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  requiredCta?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mandatoryHashtags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mandatoryMentions?: string[];

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsNumber()
  revisionLimit?: number;
}

export class CampaignRequirementsSocialDto {
  @IsOptional()
  @IsNumber()
  minFollowers?: number;

  @IsOptional()
  @IsNumber()
  minEngagementRate?: number;

  @IsOptional()
  @IsBoolean()
  verifiedOnly?: boolean;

  @IsOptional()
  @IsNumber()
  minPostingFrequency?: number;
}

export class CampaignRequirementsInfluencerDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  states?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niches?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genders?: string[];
}

export class CampaignRequirementsAudienceDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetAgeGroup?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genderPreferences?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}

export class CampaignRequirementsDto {
  @IsOptional()
  @IsBoolean()
  strictEligibility?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignRequirementsSocialDto)
  social?: CampaignRequirementsSocialDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignRequirementsInfluencerDto)
  influencer?: CampaignRequirementsInfluencerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignRequirementsAudienceDto)
  audience?: CampaignRequirementsAudienceDto;
}

export class CampaignContentGuidelinesDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredHashtags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredMentions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredCtas?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assetUrls?: string[];
}

export class CreateCampaignDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objective?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  // Product Info
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productType?: string;

  @IsOptional()
  @IsString()
  landingPageUrl?: string;

  @IsOptional()
  @IsString()
  internalReference?: string;

  @IsOptional()
  @IsBoolean()
  hasFreeProduct?: boolean;

  @IsOptional()
  @IsNumber()
  freeProductValue?: number;

  @IsOptional()
  @IsString()
  shippingDetails?: string;

  @IsOptional()
  @IsString()
  productInstructions?: string;

  // Platforms
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  // Requirements
  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignRequirementsDto)
  requirements?: CampaignRequirementsDto;

  // Budget
  @IsOptional()
  @IsNumber()
  budgetTotalAmount?: number;

  @IsOptional()
  @IsString()
  budgetCurrency?: string;

  @IsOptional()
  @IsEnum(PaymentModel)
  budgetPaymentModel?: PaymentModel;

  @IsOptional()
  @IsNumber()
  budgetMinPerInfluencer?: number;

  @IsOptional()
  @IsNumber()
  budgetMaxPerInfluencer?: number;

  @IsOptional()
  @IsString()
  performanceMetric?: string;

  @IsOptional()
  @IsNumber()
  performanceRate?: number;

  @IsOptional()
  @IsString()
  barterItems?: string;

  @IsOptional()
  @IsBoolean()
  shippingCovered?: boolean;

  // Participant Settings
  @IsOptional()
  @IsNumber()
  @Min(1)
  targetParticipants?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsBoolean()
  autoCloseWhenFilled?: boolean;

  // Content Guidelines
  @IsOptional()
  @ValidateNested()
  @Type(() => CampaignContentGuidelinesDto)
  contentGuidelines?: CampaignContentGuidelinesDto;

  // Timeline
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Deliverables
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignDeliverableDto)
  deliverables?: CampaignDeliverableDto[];
}
