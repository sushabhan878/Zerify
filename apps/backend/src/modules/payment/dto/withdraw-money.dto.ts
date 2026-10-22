import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BankAccountDto {
  @ApiProperty({ example: '123456789012', description: 'Bank account number' })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 'HDFC0000123', description: 'Bank IFSC Code' })
  @IsNotEmpty()
  @IsString()
  ifscCode: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of account holder' })
  @IsNotEmpty()
  @IsString()
  accountHolderName: string;

  @ApiPropertyOptional({ example: 'HDFC Bank', description: 'Name of the bank' })
  @IsOptional()
  @IsString()
  bankName?: string;
}

export class CardPayoutDto {
  @ApiProperty({ example: '4706131211212123', description: 'Debit or Credit card number' })
  @IsNotEmpty()
  @IsString()
  cardNumber: string;

  @ApiProperty({ example: 'Test', description: 'Name printed on card' })
  @IsNotEmpty()
  @IsString()
  cardHolderName: string;

  @ApiPropertyOptional({ example: '03', description: 'Expiry month' })
  @IsOptional()
  @IsString()
  cardExpiryMm?: string;

  @ApiPropertyOptional({ example: '28', description: 'Expiry year' })
  @IsOptional()
  @IsString()
  cardExpiryYy?: string;

  @ApiPropertyOptional({ example: '123', description: 'Card security CVV' })
  @IsOptional()
  @IsString()
  cardCvv?: string;
}

export class WithdrawMoneyDto {
  @ApiProperty({ example: 5000, description: 'Amount in Rupees to withdraw' })
  @IsNumber()
  @Min(100, { message: 'Minimum withdrawal amount is ₹100' })
  amount: number;

  @ApiPropertyOptional({ example: 'INR', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    example: 'upi',
    enum: ['upi', 'card', 'netbanking', 'bank_transfer'],
    description: 'Payout destination method',
  })
  @IsNotEmpty()
  @IsString()
  payoutMethod: 'upi' | 'card' | 'netbanking' | 'bank_transfer';

  @ApiPropertyOptional({ description: 'Bank account details if payoutMethod is bank_transfer or netbanking' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankAccountDto)
  bankAccount?: BankAccountDto;

  @ApiPropertyOptional({ description: 'Card details if payoutMethod is card' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardPayoutDto)
  card?: CardPayoutDto;

  @ApiPropertyOptional({ example: 'brand@okhdfcbank', description: 'UPI VPA address if payoutMethod is upi' })
  @IsOptional()
  @IsString()
  upiId?: string;

  @ApiPropertyOptional({ example: 'HDFC', description: 'Bank code for Net Banking' })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiPropertyOptional({ example: true, description: 'Save destination details for future 1-click withdrawals' })
  @IsOptional()
  @IsBoolean()
  saveDestination?: boolean;

  @ApiPropertyOptional({ example: 'Unused escrow balance withdrawal', description: 'Optional reason for withdrawal' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 5000, description: 'Gross withdrawal amount before platform fee' })
  @IsOptional()
  @IsNumber()
  grossAmount?: number;

  @ApiPropertyOptional({ example: 350, description: 'Zerify 7% platform fee' })
  @IsOptional()
  @IsNumber()
  zerifyFee?: number;
}
