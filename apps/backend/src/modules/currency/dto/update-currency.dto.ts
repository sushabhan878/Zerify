import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateCurrencyPreferenceDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  currency: string;
}
