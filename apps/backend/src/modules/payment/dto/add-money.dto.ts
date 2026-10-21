import { IsNumber, IsString, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CardPaymentDetailsDto {
  @ApiProperty({ description: '15-16 digit card number', example: '4706131211212123' })
  @IsString()
  cardNumber: string;

  @ApiProperty({ description: 'Cardholder name', example: 'Test Customer' })
  @IsString()
  cardHolderName: string;

  @ApiProperty({ description: 'Expiry month (2 digits)', example: '12' })
  @IsString()
  cardExpiryMm: string;

  @ApiProperty({ description: 'Expiry year (2 digits)', example: '28' })
  @IsString()
  cardExpiryYy: string;

  @ApiProperty({ description: 'CVV security code (3 or 4 digits)', example: '123' })
  @IsString()
  cardCvv: string;
}

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
    description: 'Payment method type: upi, card, or netbanking',
    enum: ['upi', 'card', 'netbanking'],
  })
  @IsOptional()
  @IsString()
  paymentMethod?: 'upi' | 'card' | 'netbanking';

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

  @ApiPropertyOptional({
    description: 'Card details for direct card payments',
    type: CardPaymentDetailsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardPaymentDetailsDto)
  card?: CardPaymentDetailsDto;

  @ApiPropertyOptional({
    description: 'Bank code for NetBanking transactions (e.g. HDFC, SBIN, ICIC, UTIB, 3021, or 3333)',
    example: 'HDFC',
  })
  @IsOptional()
  @IsString()
  bankCode?: string;
}

