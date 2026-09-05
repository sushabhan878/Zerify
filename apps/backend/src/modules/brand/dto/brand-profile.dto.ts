import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBrandCompanyInfoDto {
  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'https://acme.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'E-commerce & Fashion' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ example: 'New York, USA' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Leading sustainable apparel brand.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2021' })
  @IsOptional()
  @IsString()
  foundedYear?: string;

  @ApiPropertyOptional({ example: { instagram: 'https://instagram.com/acme', linkedin: 'https://linkedin.com/company/acme' } })
  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({ example: ['Sustainability', 'Inclusivity', 'Innovation'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandValues?: string[];

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateBrandCampaignGoalsDto {
  @ApiPropertyOptional({ example: ['Brand Awareness', 'Sales & Conversions'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primaryGoals?: string[];

  @ApiPropertyOptional({ example: ['Instagram', 'YouTube', 'TikTok'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetPlatforms?: string[];

  @ApiPropertyOptional({ example: { ageRanges: ['18-24', '25-34'], gender: 'All', locations: ['USA', 'India'], interests: ['Fashion', 'Tech'] } })
  @IsOptional()
  @IsObject()
  targetAudience?: Record<string, any>;
}

export class CreateBrandProductDto {
  @ApiPropertyOptional({ example: 'Eco-Friendly Sneakers' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'https://acme.com/images/sneaker.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'https://acme.com/products/sneaker' })
  @IsOptional()
  @IsString()
  productUrl?: string;

  @ApiPropertyOptional({ example: 'Footwear & Apparel' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '$120' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ example: '100% recycled cotton sneakers.' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateBrandTargetInfluencersDto {
  @ApiPropertyOptional({ example: ['Micro', 'Mid'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  creatorTiers?: string[];

  @ApiPropertyOptional({ example: ['India', 'USA', 'UK'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  creatorLocations?: string[];

  @ApiPropertyOptional({ example: 'Any' })
  @IsOptional()
  @IsString()
  preferredCreatorGender?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  verifiedOnly?: boolean;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  minEngagementRate?: number;

  @ApiPropertyOptional({ example: '$5,000 - $10,000' })
  @IsOptional()
  @IsString()
  campaignBudget?: string;

  @ApiPropertyOptional({ example: 'Monthly' })
  @IsOptional()
  @IsString()
  campaignFrequency?: string;
}

export class UpdateBrandEscrowDto {
  @ApiPropertyOptional({ example: { billingEmail: 'finance@acme.com', taxId: 'GSTIN1234', paymentMethod: 'Escrow Wallet', autoDeposit: true } })
  @IsOptional()
  @IsObject()
  escrowSetup?: Record<string, any>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isOnboardingCompleted?: boolean;
}
