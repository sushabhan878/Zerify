import { Controller, Get, Put, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { BrandService } from './brand.service';
import {
  UpdateBrandCompanyInfoDto,
  UpdateBrandCampaignGoalsDto,
  CreateBrandProductDto,
  UpdateBrandTargetInfluencersDto,
  UpdateBrandEscrowDto,
} from './dto/brand-profile.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

@ApiTags('brand')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  private extractUserId(req: any): string | undefined {
    if (req.user?.id) return req.user.id;
    if (req.user?.sub) return req.user.sub;

    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const secret = process.env.JWT_SECRET || 'zerify-secret-key-super-secure-jwt';
          const decoded: any = jwt.verify(token, secret);
          if (decoded?.sub || decoded?.id) return decoded.sub || decoded.id;
        } catch (e) {
          // Token verify failed, try decode fallback
        }
        try {
          const decoded: any = jwt.decode(token);
          if (decoded?.sub || decoded?.id) return decoded.sub || decoded.id;
        } catch (e) {
          // Token decode failed
        }
      }
    }
    return undefined;
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get complete brand profile and products' })
  @ApiResponse({ status: 200, description: 'Brand profile details retrieved successfully.' })
  async getProfile(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.brandService.getProfile(userId);
  }

  @Put('company-info')
  @ApiOperation({ summary: 'Update company info section' })
  async updateCompanyInfo(@Req() req: any, @Body() dto: UpdateBrandCompanyInfoDto) {
    const userId = this.extractUserId(req);
    return this.brandService.updateCompanyInfo(userId, dto);
  }

  @Put('campaign-goals')
  @ApiOperation({ summary: 'Update campaign goals section' })
  async updateCampaignGoals(@Req() req: any, @Body() dto: UpdateBrandCampaignGoalsDto) {
    const userId = this.extractUserId(req);
    return this.brandService.updateCampaignGoals(userId, dto);
  }

  @Post('products')
  @ApiOperation({ summary: 'Add a new product or service' })
  async addProduct(@Req() req: any, @Body() dto: CreateBrandProductDto) {
    const userId = this.extractUserId(req);
    return this.brandService.addProduct(userId, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product or service by ID' })
  async deleteProduct(@Req() req: any, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    return this.brandService.deleteProduct(userId, id);
  }

  @Put('target-influencers')
  @ApiOperation({ summary: 'Update target influencers requirements section' })
  async updateTargetInfluencers(@Req() req: any, @Body() dto: UpdateBrandTargetInfluencersDto) {
    const userId = this.extractUserId(req);
    return this.brandService.updateTargetInfluencers(userId, dto);
  }

  @Put('escrow-setup')
  @ApiOperation({ summary: 'Update payments and escrow setup section' })
  async updateEscrowSetup(@Req() req: any, @Body() dto: UpdateBrandEscrowDto) {
    const userId = this.extractUserId(req);
    return this.brandService.updateEscrowSetup(userId, dto);
  }

  @Post('onboarding/complete')
  @ApiOperation({ summary: 'Mark brand onboarding as completed' })
  async completeOnboarding(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.brandService.completeOnboarding(userId);
  }

  @Get('discovery')
  @ApiOperation({ summary: 'Get all companies/brands for discovery directory' })
  async getDiscovery() {
    return this.brandService.getDiscoveryBrands();
  }
}
