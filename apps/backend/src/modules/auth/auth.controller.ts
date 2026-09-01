import { Controller, Post, Body, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SocialService } from '../social/social.service';
import { RegisterBrandDto } from './dto/register-brand.dto';
import { RegisterInfluencerDto } from './dto/register-influencer.dto';
import { LoginDto } from './dto/login.dto';
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile and role details' })
  async getMe(@Req() req: any) {
    const { password, ...user } = req.user;
    return user;
  }
}
