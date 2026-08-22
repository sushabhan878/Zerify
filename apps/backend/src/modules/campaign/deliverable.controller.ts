import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DeliverableService } from './deliverable.service';
import { SubmitDeliverableDto } from './dto/submit-deliverable.dto';
import { ReviewDeliverableDto } from './dto/review-deliverable.dto';
import { PublishDeliverableDto } from './dto/publish-deliverable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('campaign-deliverables')
@Controller()
export class DeliverableController {
  constructor(private readonly deliverableService: DeliverableService) {}

  @Get('participants/:participantId/deliverables')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all deliverables for a participant' })
  async listParticipantDeliverables(@Param('participantId') participantId: string) {
    return this.deliverableService.listParticipantDeliverables(participantId);
  }

  @Get('deliverables/:deliverableId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get deliverable details with revision history' })
  async getDeliverableDetails(@Param('deliverableId') deliverableId: string) {
    return this.deliverableService.getDeliverableDetails(deliverableId);
  }

  @Post('deliverables/:deliverableId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Influencer submits draft deliverable for review' })
  async submitDraft(
    @Req() req: any,
    @Param('deliverableId') deliverableId: string,
    @Body() dto: SubmitDeliverableDto,
  ) {
    return this.deliverableService.submitDraft(req.user.id, deliverableId, dto);
  }

  @Post('deliverables/:deliverableId/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand reviews deliverable (approve / request revision / reject)' })
  async reviewDeliverable(
    @Req() req: any,
    @Param('deliverableId') deliverableId: string,
    @Body() dto: ReviewDeliverableDto,
  ) {
    return this.deliverableService.reviewDeliverable(req.user.id, deliverableId, dto);
  }

  @Post('deliverables/:deliverableId/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Influencer submits published live URL and proof' })
  async publishDeliverable(
    @Req() req: any,
    @Param('deliverableId') deliverableId: string,
    @Body() dto: PublishDeliverableDto,
  ) {
    return this.deliverableService.publishDeliverable(req.user.id, deliverableId, dto);
  }

  @Post('deliverables/:deliverableId/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Brand verifies published deliverable' })
  async verifyDeliverable(@Req() req: any, @Param('deliverableId') deliverableId: string) {
    return this.deliverableService.verifyDeliverable(req.user.id, deliverableId);
  }
}
