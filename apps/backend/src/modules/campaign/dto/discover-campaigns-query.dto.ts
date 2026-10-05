import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentModel } from '@prisma/client';

export enum CampaignSortOption {
  BEST_MATCH = 'BEST_MATCH',
  NEWEST = 'NEWEST',
  HIGHEST_BUDGET = 'HIGHEST_BUDGET',
  DEADLINE = 'DEADLINE',
  MOST_RELEVANT = 'MOST_RELEVANT',
}

export class DiscoverCampaignsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsEnum(PaymentModel)
  paymentModel?: PaymentModel;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minBudget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxBudget?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minFollowers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxFollowers?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verifiedOnly?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  eligibleOnly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minMatchScore?: number;

  @IsOptional()
  @IsEnum(CampaignSortOption)
  sort?: CampaignSortOption = CampaignSortOption.NEWEST;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 50;
}
