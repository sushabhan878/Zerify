import { IsString, IsOptional, IsNumber, IsArray, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  socialAccountId: string;

  @IsOptional()
  @IsString()
  applicationMessage?: string;

  @IsOptional()
  @IsNumber()
  proposedAmount?: number;

  @IsOptional()
  @IsString()
  proposedCurrency?: string = 'USD';

  @IsOptional()
  @IsString()
  contentIdea?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioUrls?: string[];
}
