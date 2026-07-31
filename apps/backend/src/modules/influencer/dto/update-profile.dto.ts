import { IsOptional } from 'class-validator';

export class UpdateInfluencerProfileDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  handle?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  phoneCode?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  dob?: string | Date;

  @IsOptional()
  gender?: string;

  @IsOptional()
  avatarUrl?: string | null;

  @IsOptional()
  niches?: string[];

  @IsOptional()
  contentLanguages?: string[];

  @IsOptional()
  availableForBarter?: boolean;

  @IsOptional()
  availableForRelocation?: boolean;

  @IsOptional()
  collaborationTypes?: string[];

  @IsOptional()
  minPricePerReel?: number;

  @IsOptional()
  currency?: string;

  @IsOptional()
  responseTime?: string;
}
