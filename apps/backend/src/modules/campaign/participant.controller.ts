import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('campaign-participants')
@Controller()
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Get('campaigns/:campaignId/participants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all confirmed participants for a campaign' })
  async listCampaignParticipants(@Param('campaignId') campaignId: string) {
    return this.participantService.listCampaignParticipants(campaignId);
  }

  @Get('participants/:participantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get participant details with deliverables and payment status' })
  async getParticipantDetails(@Param('participantId') participantId: string) {
    return this.participantService.getParticipantDetails(participantId);
  }

  @Post('participants/:participantId/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark participant collaboration as ACTIVE' })
  async startWork(@Req() req: any, @Param('participantId') participantId: string) {
    return this.participantService.startParticipantWork(req.user.id, participantId);
  }

  @Post('participants/:participantId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand marks participant collaboration as COMPLETED' })
  async completeParticipant(@Req() req: any, @Param('participantId') participantId: string) {
    return this.participantService.completeParticipant(req.user.id, participantId);
  }

  @Post('participants/:participantId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand cancels participant collaboration' })
  async cancelParticipant(@Req() req: any, @Param('participantId') participantId: string) {
    return this.participantService.cancelParticipant(req.user.id, participantId);
  }
}
