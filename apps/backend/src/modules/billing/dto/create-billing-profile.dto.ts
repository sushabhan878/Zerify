import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { BillingProfileOwnerType } from '@prisma/client';

export class CreateBillingProfileDto {
  @IsEnum(BillingProfileOwnerType, { message: 'ownerType must be BRAND or CREATOR' })
  ownerType: BillingProfileOwnerType;

  @IsString()
  @MaxLength(200, { message: 'legalName cannot exceed 200 characters' })
  legalName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tradeName?: string;

  @IsOptional()
  @IsString()
  billingEmail?: string;

  @IsOptional()
  @IsString()
  billingPhone?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsString()
  stateCode?: string;

  @IsOptional()
  @IsString()
  stateName?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;
}
