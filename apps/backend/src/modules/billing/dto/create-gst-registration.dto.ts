import { IsString, IsOptional, MaxLength, Matches, IsBoolean } from 'class-validator';

export class CreateGstRegistrationDto {
  @IsString()
  @Matches(/^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}[Zz]{1}[0-9A-Za-z]{1}$/, {
    message: 'Invalid GSTIN format. Expected 15-character Indian GSTIN.',
  })
  gstin: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Business name cannot exceed 200 characters.' })
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tradeName?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsBoolean()
  autoVerify?: boolean;
}

export class VerifyGstRegistrationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessName?: string;
}

export class ConfirmMismatchDto {
  @IsBoolean()
  acceptProviderName: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  updatedBusinessName?: string;
}
