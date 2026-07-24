import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterBrandDto {
  @IsEmail({}, { message: 'Please provide a valid business email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  website?: string;
}
