import { IsNumber, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PaymentModel } from '@prisma/client';

export class CreateOfferDto {
  @IsNumber()
  compensationAmount: number;

  @IsOptional()
  @IsString()
  compensationCurrency?: string = 'USD';

  @IsOptional()
  @IsEnum(PaymentModel)
  compensationPaymentModel?: PaymentModel = PaymentModel.FIXED;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  responseDeadline?: string;

  @IsOptional()
  @IsString()
  customNotes?: string;
}
