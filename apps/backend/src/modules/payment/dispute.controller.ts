import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DisputeStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DisputeService } from './dispute.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { DisputeAccessGuard } from './guards/dispute-access.guard';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/payouts.dto';

/** Dispute API (PRD §24): open, track, and admin resolution. */
@ApiTags('disputes')
@Controller()
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post('payments/:paymentId/dispute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open a dispute against a payment' })
  async openDispute(
    @Req() req: any,
    @Param('paymentId') paymentId: string,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputeService.open(req.user.id, paymentId, dto);
  }

  @Get('disputes/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List disputes visible to the authenticated user' })
  async listMyDisputes(@Req() req: any, @Query('status') status?: DisputeStatus) {
    return this.disputeService.listForUser(req.user.id, status);
  }

  @Get('disputes/:disputeId')
  @UseGuards(JwtAuthGuard, DisputeAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dispute details (parties and admins only)' })
  async getDispute(@Req() req: any) {
    return req.dispute;
  }

  @Get('admin/disputes')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all disputes (admin)' })
  async listAllDisputes(@Query('status') status?: DisputeStatus) {
    return this.disputeService.listAll(status);
  }

  @Post('admin/disputes/:disputeId/review')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Move a dispute into admin review (admin)' })
  async beginReview(@Req() req: any, @Param('disputeId') disputeId: string) {
    return this.disputeService.beginReview(req.user.id, disputeId);
  }

  @Post('admin/disputes/:disputeId/resolve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve a dispute: refund company, release influencer, split, or no action' })
  async resolveDispute(
    @Req() req: any,
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputeService.resolve(req.user.id, disputeId, dto);
  }
}
