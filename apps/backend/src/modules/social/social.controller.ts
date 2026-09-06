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

  @ApiOperation({ summary: 'Generate YouTube Google OAuth Login URL' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('youtube/login')
  getYoutubeLoginUrl(@Req() req: RequestWithUser, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || queryUserId || 'default-user-id';
    const result = this.socialService.getYouTubeAuthUrl(userId);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @ApiOperation({ summary: 'YouTube Google OAuth Authorization Callback' })
  @Get('youtube/callback')
  async youtubeCallback(
    @Query() query: ConnectCallbackQueryDto,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.socialService.handleYouTubeCallback(
      query.code,
      query.state,
      query.error,
      query.error_description || query.error_reason,
    );
    return res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: 'Trigger manual sync for a YouTube connected channel' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('youtube/sync/:id')
  @HttpCode(HttpStatus.OK)
  async syncYouTubeChannel(@Param('id') id: string) {
    await this.socialService.syncYouTubeChannelDetails(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'YouTube channel synchronization triggered successfully.',
    };
  }

  @ApiOperation({ summary: 'Generate LinkedIn OAuth 2.0 / OIDC Login URL for popup' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('linkedin/login')
  getLinkedInLoginUrl(@Req() req: RequestWithUser, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || queryUserId || 'default-user-id';
    const result = this.socialService.getLinkedInAuthUrl(userId);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Direct redirect to LinkedIn OAuth 2.0 / OIDC Authorization (TRD Spec)' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('linkedin/connect')
  connectLinkedIn(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Query('userId') queryUserId?: string,
  ) {
    const userId = req.user?.id || queryUserId || 'default-user-id';
    const result = this.socialService.getLinkedInAuthUrl(userId);
    return res.redirect(result.url);
  }

  @ApiOperation({ summary: 'LinkedIn OAuth 2.0 Authorization Callback' })
  @Get('linkedin/callback')
  async linkedinCallback(
    @Query() query: ConnectCallbackQueryDto,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.socialService.handleLinkedInCallback(
      query.code,
      query.state,
      query.error,
      query.error_description || query.error_reason,
    );
    return res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: 'Trigger manual sync for a LinkedIn connected profile' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('linkedin/sync/:id')
  @HttpCode(HttpStatus.OK)
  async syncLinkedInProfile(@Param('id') id: string) {
    await this.socialService.syncLinkedInAccountDetails(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'LinkedIn profile synchronization triggered successfully.',
    };
  }

  // --- X (Twitter) Routes (PRD Spec) ---

  @ApiOperation({ summary: 'Generate X (Twitter) OAuth 2.0 PKCE Authorization URL for popup login flow' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('x/login')
  getXLoginUrl(@Req() req: RequestWithUser, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || queryUserId || 'default-user-id';
    const result = this.socialService.getXAuthUrl(userId);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Alias for X OAuth 2.0 PKCE login URL' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('twitter/login')
  getTwitterLoginUrl(@Req() req: RequestWithUser, @Query('userId') queryUserId?: string) {
    return this.getXLoginUrl(req, queryUserId);
  }

  @ApiOperation({ summary: 'Direct redirect to X (Twitter) OAuth 2.0 Authorization (PRD Spec)' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('x/connect')
  connectX(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Query('userId') queryUserId?: string,
  ) {
    const userId = req.user?.id || queryUserId || 'default-user-id';
    const result = this.socialService.getXAuthUrl(userId);
    return res.redirect(result.url);
  }

  @ApiOperation({ summary: 'Alias for direct redirect to X (Twitter) OAuth 2.0' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('twitter/connect')
  connectTwitter(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Query('userId') queryUserId?: string,
  ) {
    return this.connectX(req, res, queryUserId);
  }

  @ApiOperation({ summary: 'X (Twitter) OAuth 2.0 Authorization Callback' })
  @Get('x/callback')
  async xCallback(
    @Query() query: ConnectCallbackQueryDto,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.socialService.handleXCallback(
      query.code,
      query.state,
      query.error,
      query.error_description || query.error_reason,
    );
    return res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: 'Alias for X (Twitter) OAuth 2.0 Authorization Callback' })
  @Get('twitter/callback')
  async twitterCallback(
    @Query() query: ConnectCallbackQueryDto,
    @Res() res: Response,
  ) {
    return this.xCallback(query, res);
  }

  @ApiOperation({ summary: 'Trigger manual sync for an X (Twitter) connected profile' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('x/sync/:id')
  @HttpCode(HttpStatus.OK)
  async syncXProfile(@Param('id') id: string) {
    await this.socialService.syncXAccountDetails(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'X (Twitter) profile and tweets synchronization triggered successfully.',
    };
  }

  @ApiOperation({ summary: 'Alias for manual sync for X (Twitter) profile' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('twitter/sync/:id')
  @HttpCode(HttpStatus.OK)
  async syncTwitterProfile(@Param('id') id: string) {
    return this.syncXProfile(id);
  }

  @ApiOperation({ summary: 'Generate Meta Threads OAuth 2.0 Authorization URL for popup login flow' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('threads/login')
  getThreadsLoginUrl(@Req() req: RequestWithUser, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || queryUserId || 'default-user-id';
    const result = this.socialService.getThreadsAuthUrl(userId);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Direct redirect to Meta Threads OAuth 2.0 Authorization (PRD Spec)' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('threads/connect')
  connectThreads(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Query('userId') queryUserId?: string,
  ) {
    const userId = req.user?.id || queryUserId || 'default-user-id';
    const result = this.socialService.getThreadsAuthUrl(userId);
    return res.redirect(result.url);
  }

  @ApiOperation({ summary: 'Meta Threads OAuth 2.0 Authorization Callback' })
  @Get('threads/callback')
  async threadsCallback(
    @Query() query: ConnectCallbackQueryDto,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.socialService.handleThreadsCallback(
      query.code,
      query.state,
      query.error,
      query.error_description || query.error_reason,
    );
    return res.redirect(redirectUrl);
  }

  @ApiOperation({ summary: 'Trigger manual sync for a Threads connected profile' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('threads/sync/:id')
  @HttpCode(HttpStatus.OK)
  async syncThreadsProfile(@Param('id') id: string) {
    await this.socialService.syncThreadsAccountDetails(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Threads profile and posts synchronization triggered successfully.',
    };
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



