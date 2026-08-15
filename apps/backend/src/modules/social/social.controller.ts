import {
  Controller,
  Get,
  Delete,
  Query,
  Param,
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
}
