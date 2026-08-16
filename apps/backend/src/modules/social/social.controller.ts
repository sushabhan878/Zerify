import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { SocialService } from './social.service';
import { ConnectCallbackQueryDto } from './dto/connect-callback-query.dto';
import { SocialAccountResponseDto } from './dto/social-account-response.dto';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('Social Accounts')
@Controller('social')

export class SocialController {
  constructor(private readonly socialService: SocialService) { }

  @ApiOperation({ summary: 'Generate Meta (Instagram & Facebook) OAuth Login URL' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('meta/login')
  getMetaLoginUrl(@Req() req: RequestWithUser, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || queryUserId || 'default-user-id';
    const result = this.socialService.getMetaAuthUrl(userId);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Meta OAuth Authorization Callback' })
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

  @ApiOperation({ summary: 'Generate Direct Instagram OAuth Login URL' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('instagram/login')
  getInstagramLoginUrl(@Req() req: RequestWithUser, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || queryUserId || 'default-user-id';
    const result = this.socialService.getInstagramAuthUrl(userId);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Instagram OAuth Authorization Callback' })
  @Get('instagram/callback')
  async instagramCallback(
    @Query() query: ConnectCallbackQueryDto,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.socialService.handleInstagramCallback(
      query.code,
      query.state,
      query.error,
      query.error_description || query.error_reason,
    );
    return res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: 'Get list of connected social accounts for the user' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('accounts')
  async getUserSocialAccounts(@Req() req: RequestWithUser): Promise<{ statusCode: number; data: SocialAccountResponseDto[] }> {
    const userId = req.user?.id || 'default-user-id';
    const accounts = await this.socialService.getUserAccounts(userId);
    return {
      statusCode: HttpStatus.OK,
      data: accounts,
    };
  }

  @ApiOperation({ summary: 'Disconnect a connected social account' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Delete('accounts/:id')
  @HttpCode(HttpStatus.OK)
  async disconnectAccount(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const userId = req.user?.id || 'default-user-id';
    const result = await this.socialService.disconnectAccount(userId, id);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Meta Webhook URL verification endpoint' })
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode?: string,
    @Query('hub.verify_token') token?: string,
    @Query('hub.challenge') challenge?: string,
    @Res() res?: Response,
  ) {
    const challengeResult = this.socialService.verifyMetaWebhook(mode, token, challenge);
    return res?.status(HttpStatus.OK).send(challengeResult);
  }

  @ApiOperation({ summary: 'Meta Webhook event delivery endpoint' })
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhookEvent(@Body() body: any) {
    return this.socialService.handleMetaWebhookEvent(body);
  }

  @ApiOperation({ summary: 'Get modular analytics, demographics, media performance, and sync status for an account' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('accounts/:id/analytics')
  async getAccountAnalytics(@Param('id') id: string) {
    const data = await this.socialService.getAccountAnalytics(id);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @ApiOperation({ summary: 'Trigger analytics sync for all connected accounts of the user' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('accounts/sync-all')
  @HttpCode(HttpStatus.OK)
  async syncAllUserAccounts(@Req() req: RequestWithUser) {
    const userId = req.user?.id || 'default-user-id';
    const result = await this.socialService.syncAllUserAccounts(userId);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Trigger analytics sync for a specific connected account' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('accounts/:id/sync')
  @HttpCode(HttpStatus.OK)
  async syncAccount(@Param('id') id: string) {
    await this.socialService.syncAccountDetails(id);
    const analytics = await this.socialService.getAccountAnalytics(id);
    return {
      statusCode: HttpStatus.OK,
      data: analytics,
    };
  }
}



