import { IsOptional, IsString, IsNumber, IsUUID, IsIn, MaxLength } from 'class-validator';

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
}
