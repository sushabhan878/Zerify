import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplicationStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('campaign-applications')
@Controller()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('campaigns/:campaignId/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Influencer applies to a campaign' })
  async applyToCampaign(
    @Req() req: any,
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationService.applyToCampaign(req.user.id, campaignId, dto);
  }

  @Get('brand/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand lists all applications across all their campaigns' })
  async listBrandApplications(
    @Req() req: any,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.applicationService.listBrandApplications(req.user.id, status);
  }

  @Get('campaigns/:campaignId/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand lists all applications for their campaign' })
  async listCampaignApplications(
    @Param('campaignId') campaignId: string,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.applicationService.listApplicationsForCampaign(campaignId, status);
  }

  @Get('applications/:applicationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application details' })
  async getApplicationDetails(@Param('applicationId') applicationId: string) {
    return this.applicationService.getApplicationDetails(applicationId);
  }

  @Post('applications/:applicationId/withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Influencer withdraws their application' })
  async withdrawApplication(@Req() req: any, @Param('applicationId') applicationId: string) {
    return this.applicationService.withdrawApplication(req.user.id, applicationId);
  }

  @Post('applications/:applicationId/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand marks application under review' })
  async reviewApplication(
    @Req() req: any,
    @Param('applicationId') applicationId: string,
    @Body('notes') notes?: string,
  ) {
    return this.applicationService.reviewApplication(applicationId, req.user.id, notes);
  }

  @Post('applications/:applicationId/shortlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand shortlists applicant' })
  async shortlistApplication(@Param('applicationId') applicationId: string) {
    return this.applicationService.shortlistApplication(applicationId);
  }

  @Post('applications/:applicationId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand rejects applicant' })
  async rejectApplication(
    @Param('applicationId') applicationId: string,
    @Body('notes') notes?: string,
  ) {
    return this.applicationService.rejectApplication(applicationId, notes);
  }
}
