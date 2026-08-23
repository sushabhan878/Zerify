import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CampaignOwnerGuard } from './guards/campaign-owner.guard';
import { DiscoveryService } from './discovery.service';
import { DiscoverCampaignsQueryDto } from './dto/discover-campaigns-query.dto';
import { Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new campaign (saved as DRAFT)' })
  async createCampaign(@Req() req: any, @Body() dto: CreateCampaignDto) {
    return this.campaignService.createCampaign(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all campaigns owned by the authenticated brand' })
  async listBrandCampaigns(@Req() req: any) {
    return this.campaignService.listBrandCampaigns(req.user.id);
  }

  @Get('discover')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Discover open campaigns with rich filtering, search and sorting' })
  async discoverCampaigns(@Req() req: any, @Query() query: DiscoverCampaignsQueryDto) {
    return this.discoveryService.discoverCampaigns(query, req?.user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign details by ID' })
  async getCampaignDetails(@Param('id') id: string) {
    return this.campaignService.getCampaignDetails(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, CampaignOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing draft or open campaign' })
  async updateCampaign(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignService.updateCampaign(id, dto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, CampaignOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish campaign (DRAFT -> OPEN)' })
  async publishCampaign(@Param('id') id: string) {
    return this.campaignService.publishCampaign(id);
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard, CampaignOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pause a live campaign' })
  async pauseCampaign(@Param('id') id: string) {
    return this.campaignService.pauseCampaign(id);
  }

  @Post(':id/close-applications')
  @UseGuards(JwtAuthGuard, CampaignOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close applications early for this campaign' })
  async closeApplications(@Param('id') id: string) {
    return this.campaignService.closeApplications(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, CampaignOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a campaign' })
  async cancelCampaign(@Param('id') id: string) {
    return this.campaignService.cancelCampaign(id);
  }
}
