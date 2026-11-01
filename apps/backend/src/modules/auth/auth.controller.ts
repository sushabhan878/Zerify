import { Controller, Post, Body, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SocialService } from '../social/social.service';
import { RegisterBrandDto } from './dto/register-brand.dto';
import { RegisterInfluencerDto } from './dto/register-influencer.dto';
import { LoginDto } from './dto/login.dto';
import { SendVerificationOtpDto } from './dto/send-verification-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { ConnectCallbackQueryDto } from '../social/dto/connect-callback-query.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly socialService: SocialService,
  ) {}

  // Email Verification Endpoints
  @Post('send-verification-otp')
  @ApiOperation({ summary: 'Send email verification 6-digit OTP code' })
  @ApiResponse({ status: 200, description: 'Verification OTP sent to recipient email.' })
  @ApiResponse({ status: 400, description: 'Invalid email or public email domain blocked for brand role.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async sendVerificationOtp(@Body() dto: SendVerificationOtpDto) {
    return this.authService.sendVerificationOtp(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify email 6-digit OTP code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP code.' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // Meta OAuth Callback Endpoint
  @ApiOperation({ summary: 'Meta OAuth Authorization Callback (/api/v1/auth/meta/callback)' })
  @Get('meta/callback')
  async metaCallback(
    @Query() query: ConnectCallbackQueryDto,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.socialService.handleMetaCallback(
      query.code,
      query.state,
      query.error,
      query.error_description || query.error_reason,
    );
    return res.redirect(redirectUrl);
  }

  // Brand / Agency Endpoints
  @Post('brand/register')
  @ApiOperation({ summary: 'Register a new Brand / Agency account' })
  @ApiResponse({ status: 201, description: 'Brand account and profile created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async registerBrand(@Body() dto: RegisterBrandDto) {
    return this.authService.registerBrand(dto);
  }

  @Post('brand/login')
  @ApiOperation({ summary: 'Login to Brand / Agency portal' })
  @ApiResponse({ status: 200, description: 'Brand authenticated successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or incorrect role portal.' })
  async loginBrand(@Body() dto: LoginDto) {
    return this.authService.loginBrand(dto);
  }

  // Influencer / Creator Endpoints
  @Post('influencer/register')
  @ApiOperation({ summary: 'Register a new Influencer / Creator account' })
  @ApiResponse({ status: 201, description: 'Influencer account and profile created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async registerInfluencer(@Body() dto: RegisterInfluencerDto) {
    return this.authService.registerInfluencer(dto);
  }

  @Post('influencer/login')
  @ApiOperation({ summary: 'Login to Influencer / Creator portal' })
  @ApiResponse({ status: 200, description: 'Influencer authenticated successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or incorrect role portal.' })
  async loginInfluencer(@Body() dto: LoginDto) {
    return this.authService.loginInfluencer(dto);
  }

  // Common Auth Endpoints
  @Post('login')
  @ApiOperation({ summary: 'Generic login for any account role' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Google OAuth & Google One-Tap Endpoints
  @Post('google')
  @ApiOperation({ summary: 'Google One-Tap or Google Identity Services authentication / registration' })
  @ApiResponse({ status: 200, description: 'Google authentication successful.' })
  @ApiResponse({ status: 400, description: 'Invalid Google credential token or restricted domain.' })
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto);
  }

  @Get('google/url')
  @ApiOperation({ summary: 'Generate Google OAuth 2.0 authorization URL' })
  async getGoogleAuthUrl(
    @Query('redirectUri') redirectUri: string,
    @Query('state') state: string,
  ) {
    const fallbackRedirect =
      redirectUri ||
      process.env.GOOGLE_REDIRECT_URI ||
      'http://localhost:3000/social/callback';
    const authUrl = this.authService.getGoogleAuthUrl(fallbackRedirect, state || 'google_login');
    return { url: authUrl };
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback handler' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
      const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:4000/api/v1'}/auth/google/callback`;
      let role: any = undefined;
      let action: any = 'login';

      if (state) {
        try {
          const parsed = JSON.parse(decodeURIComponent(state));
          role = parsed.role;
          action = parsed.action || action;
        } catch {
          if (state.includes('BRAND')) role = 'BRAND';
          if (state.includes('INFLUENCER')) role = 'INFLUENCER';
          if (state.includes('register')) action = 'register';
        }
      }

      const result = await this.authService.googleAuth({
        code,
        redirectUri,
        role,
        action,
      });

      if (result.accessToken) {
        return res.redirect(
          `${frontendBaseUrl}/social/callback?status=success&token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`,
        );
      }

      if (result.requiresRegistration && result.googleProfile) {
        return res.redirect(
          `${frontendBaseUrl}/register?googleEmail=${encodeURIComponent(result.googleProfile.email)}&googleName=${encodeURIComponent(result.googleProfile.name)}&googleAvatar=${encodeURIComponent(result.googleProfile.avatarUrl || '')}`,
        );
      }

      return res.redirect(`${frontendBaseUrl}/login?error=Google+authentication+failed`);
    } catch (err: any) {
      return res.redirect(
        `${frontendBaseUrl}/login?error=${encodeURIComponent(err.message || 'Google authentication error')}`,
      );
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile and role details' })
  async getMe(@Req() req: any) {
    const { password, ...user } = req.user;
    return user;
  }
}
