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
  constructor(private readonly socialService: SocialService) {}

  @ApiOperation({ summary: 'Generate Meta (Instagram & Facebook) OAuth Login URL' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('meta/login')
  getMetaLoginUrl(@Req() req: RequestWithUser) {
    const result = this.socialService.getMetaAuthUrl(req.user.id);
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

  @ApiOperation({ summary: 'Get list of connected social accounts for the user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('accounts')
  async getUserSocialAccounts(@Req() req: RequestWithUser): Promise<{ statusCode: number; data: SocialAccountResponseDto[] }> {
    const accounts = await this.socialService.getUserAccounts(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      data: accounts,
    };
  }

  @ApiOperation({ summary: 'Disconnect a connected social account' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('accounts/:id')
  @HttpCode(HttpStatus.OK)
  async disconnectAccount(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const result = await this.socialService.disconnectAccount(req.user.id, id);
    return {
      statusCode: HttpStatus.OK,
      data: result,
    };
  }
}
