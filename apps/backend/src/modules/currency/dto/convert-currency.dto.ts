import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ConvertCurrencyDto {
  @IsNotEmpty()
  amount: number | string;

  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;

  @IsOptional()
  date?: string;
}
