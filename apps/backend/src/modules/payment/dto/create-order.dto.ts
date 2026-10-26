import { IsOptional, IsString, IsNumber, IsUUID, IsIn, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CardPaymentDetailsDto } from './add-money.dto';

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  @IsIn(['INR'], { message: 'Only INR is supported at launch' })
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  returnUrl?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: 'upi' | 'card' | 'netbanking';

  @IsOptional()
  @ValidateNested()
  @Type(() => CardPaymentDetailsDto)
  card?: CardPaymentDetailsDto;

  @IsOptional()
  @IsString()
  upiId?: string;

  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  channel?: string;
}
