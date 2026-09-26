import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DeliverableService } from './deliverable.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeliverableAssetsService } from './deliverable-assets.service';
import { VerifyDeliverableDto } from './dto/verify-deliverable.dto';
import { SubmitDeliverableDto } from './dto/submit-deliverable.dto';
import { ReviewDeliverableDto } from './dto/review-deliverable.dto';
import { PublishDeliverableDto } from './dto/publish-deliverable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('campaign-deliverables')
@Controller()
export class DeliverableController {
  constructor(private readonly deliverableService: DeliverableService, private readonly assets: DeliverableAssetsService) {}

  @Post('deliverables/:deliverableId/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024, files: 1 } }))
  upload(@Req() req: any, @Param('deliverableId') id: string, @UploadedFile() file: any) {
    return this.assets.upload(req.user.id, id, file);
  }

  @Get('deliverables/:deliverableId/assets/:assetId')
  @UseGuards(JwtAuthGuard)
  download(@Req() req: any, @Param('deliverableId') id: string, @Param('assetId') assetId: string) {
    return this.assets.download(req.user.id, id, assetId);
  }

  @Get('participants/:participantId/deliverables')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all deliverables for a participant' })
  async listParticipantDeliverables(@Req() req: any, @Param('participantId') participantId: string) {
    return this.deliverableService.listParticipantDeliverables(participantId, req.user.id);
  }

  @Get('deliverables/:deliverableId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get deliverable details with revision history' })
  async getDeliverableDetails(@Req() req: any, @Param('deliverableId') deliverableId: string) {
    return this.deliverableService.getDeliverableDetails(deliverableId, req.user.id);
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
  async verifyDeliverable(@Req() req: any, @Param('deliverableId') deliverableId: string, @Body() dto: VerifyDeliverableDto) {
    return this.deliverableService.verifyDeliverable(req.user.id, deliverableId, dto.expectedVersion);
  }
}
