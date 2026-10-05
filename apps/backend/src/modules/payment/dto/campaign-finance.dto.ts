import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class SetBudgetDto {
  @IsNumber()
  @Min(1)
  @Max(1000000000)
  grossBudget: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class QuoteFeesDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class CommitParticipantDto {
  @IsString()
  influencerProfileId: string;

  @IsNumber()
  @Min(1)
  agreedAmount: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class AttributePayableDto {
  @IsString()
  influencerProfileId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}
