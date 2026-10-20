import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMoneyDto {
  @ApiProperty({
    description: 'Amount in INR to deposit into Zerify Brand Wallet',
    example: 5000,
  })
  @IsNumber()
  @Min(100, { message: 'Minimum deposit amount is ₹100' })
  amount: number;

  @ApiPropertyOptional({
    description: 'ISO-4217 Currency code',
    default: 'INR',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Client idempotency key to prevent double funding',
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({
    description: 'Callback or return URL after completing checkout',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiPropertyOptional({
    description: 'Customer Virtual Payment Address (UPI ID) for direct UPI collect',
    example: 'success@upi',
  })
  @IsOptional()
  @IsString()
  upiId?: string;

  @ApiPropertyOptional({
    description: 'Whether to save this UPI ID to brand profile for future quick checkouts',
  })
  @IsOptional()
  saveUpiId?: boolean;

  @ApiPropertyOptional({
    description: 'UPI channel type: collect (VPA push) or qrcode (dynamic on-screen QR)',
    enum: ['collect', 'qrcode'],
    default: 'collect',
  })
  @IsOptional()
  @IsString()
  channel?: 'collect' | 'qrcode';
}
