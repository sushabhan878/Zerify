import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CounterOfferDto {
  @IsNumber()
  @Min(1)
  proposedAmount: number;

  @IsOptional()
  @IsString()
  proposedCurrency?: string = 'USD';

  @IsOptional()
  @IsString()
  message?: string;
}
