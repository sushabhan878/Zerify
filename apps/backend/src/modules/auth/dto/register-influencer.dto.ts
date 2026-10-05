import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterInfluencerDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  handle?: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  openToAffiliate?: boolean;

  @IsBoolean()
  @IsOptional()
  openToUgc?: boolean;

  @IsString()
  @IsOptional()
  contactInfo?: string;

  @IsString()
  @IsOptional()
  pricingRange?: string;

  @IsOptional()
  platforms?: string[];

  @IsOptional()
  niches?: string[];

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  phoneCode?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  dob?: Date | string;

  @IsOptional()
  contentLanguages?: string[];

  @IsBoolean()
  @IsOptional()
  availableForBarter?: boolean;

  @IsBoolean()
  @IsOptional()
  availableForRelocation?: boolean;

  @IsOptional()
  collaborationTypes?: string[];

  @IsOptional()
  minPricePerReel?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  responseTime?: string;

  @IsOptional()
  portfolioLinks?: string[];
}
