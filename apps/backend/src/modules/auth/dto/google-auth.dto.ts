import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiPropertyOptional({ description: 'Google ID token or credential JWT from Google Identity Services' })
  @IsOptional()
  @IsString()
  credential?: string;

  @ApiPropertyOptional({ description: 'Google OAuth access token' })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Authorization code from Google OAuth 2.0 redirect' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Redirect URI used during authorization code flow' })
  @IsOptional()
  @IsString()
  redirectUri?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Role to assign if a new user is created' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Desired action: login or register' })
  @IsOptional()
  @IsString()
  action?: 'login' | 'register';

  @ApiPropertyOptional({ description: 'Email address (optional or fallback)' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Display name (optional or fallback)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Profile picture URL (optional or fallback)' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Google user ID (sub)' })
  @IsOptional()
  @IsString()
  googleId?: string;
}
