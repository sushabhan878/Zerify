import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class SendVerificationOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsOptional()
  @IsEnum(['BRAND', 'INFLUENCER'], { message: 'Role must be BRAND or INFLUENCER' })
  role?: 'BRAND' | 'INFLUENCER';
}
