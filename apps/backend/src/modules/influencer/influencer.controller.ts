import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { InfluencerService } from './influencer.service';
import { UpdateInfluencerProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

@ApiTags('influencer')
@Controller('influencer')
export class InfluencerController {
  constructor(private readonly influencerService: InfluencerService) {}

  private extractUserId(req: any): string | undefined {
    if (req.user?.id) return req.user.id;
    if (req.user?.sub) return req.user.sub;

    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'zerify-secret-key-super-secure-jwt';
        const decoded: any = jwt.verify(token, secret);
        return decoded?.sub || decoded?.id;
      } catch (e) {
        // Token decode failed
      }
    }
    return undefined;
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current influencer profile details' })
  @ApiResponse({ status: 200, description: 'Influencer profile retrieved successfully.' })
  async getProfile(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.influencerService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update influencer basic info and profile details' })
  @ApiResponse({ status: 200, description: 'Influencer profile updated successfully.' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateInfluencerProfileDto) {
    const userId = this.extractUserId(req);
    return this.influencerService.updateProfile(userId, dto);
  }

  @Put('creator-details')
  @ApiOperation({ summary: 'Update creator niche details, rates and languages' })
  async updateCreatorDetails(@Req() req: any, @Body() dto: UpdateInfluencerProfileDto) {
    const userId = this.extractUserId(req);
    return this.influencerService.updateProfile(userId, dto);
  }

  @Put('social-accounts')
  @ApiOperation({ summary: 'Update connected social accounts' })
  async updateSocialAccounts(@Req() req: any, @Body() body: any) {
    const userId = this.extractUserId(req);
    const accounts = Array.isArray(body) ? body : body.accounts || [];
    return this.influencerService.updateSocialAccounts(userId, accounts);
  }

  @Put('portfolio')
  @ApiOperation({ summary: 'Update portfolio deliverables' })
  async updatePortfolio(@Req() req: any, @Body() body: any) {
    const userId = this.extractUserId(req);
    const items = Array.isArray(body) ? body : body.items || [];
    return this.influencerService.updatePortfolio(userId, items);
  }

  @Put('payment-details')
  @ApiOperation({ summary: 'Update payout bank and tax details' })
  async updatePaymentDetails(@Req() req: any, @Body() body: any) {
    const userId = this.extractUserId(req);
    return this.influencerService.updatePaymentDetails(userId, body);
  }
}
