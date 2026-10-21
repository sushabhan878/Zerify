import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateBillingProfileDto } from './dto/create-billing-profile.dto';
import {
  CreateGstRegistrationDto,
  VerifyGstRegistrationDto,
  ConfirmMismatchDto,
} from './dto/create-gst-registration.dto';

@ApiTags('billing-profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing-profiles')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('default')
  @ApiOperation({ summary: 'Get or auto-initialize default billing profile for user' })
  async getDefaultProfile(@Req() req: any) {
    return this.billingService.getOrCreateDefaultProfile(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all billing profiles for current account' })
  async listProfiles(@Req() req: any) {
    return this.billingService.listProfiles(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new billing profile' })
  async createProfile(@Req() req: any, @Body() dto: CreateBillingProfileDto) {
    return this.billingService.createProfile(req.user.id, dto);
  }

  @Post(':profileId/gst-registrations')
  @ApiOperation({ summary: 'Add a GSTIN registration under a billing profile' })
  async addGstRegistration(
    @Req() req: any,
    @Param('profileId') profileId: string,
    @Body() dto: CreateGstRegistrationDto,
  ) {
    return this.billingService.addGstRegistration(req.user.id, profileId, dto);
  }

  @Post(':profileId/gst-registrations/:registrationId/verify')
  @ApiOperation({ summary: 'Trigger real-time GSTIN verification via Cashfree' })
  async verifyGstRegistration(
    @Req() req: any,
    @Param('profileId') profileId: string,
    @Param('registrationId') registrationId: string,
    @Body() dto: VerifyGstRegistrationDto,
  ) {
    return this.billingService.verifyGstRegistration(
      req.user.id,
      profileId,
      registrationId,
      dto.businessName,
    );
  }

  @Post(':profileId/gst-registrations/:registrationId/confirm-mismatch')
  @ApiOperation({ summary: 'Confirm or rectify a name mismatch from verification' })
  async confirmMismatch(
    @Req() req: any,
    @Param('profileId') profileId: string,
    @Param('registrationId') registrationId: string,
    @Body() dto: ConfirmMismatchDto,
  ) {
    return this.billingService.confirmMismatch(
      req.user.id,
      profileId,
      registrationId,
      dto,
    );
  }

  @Get(':profileId/gst-registrations/:registrationId/history')
  @ApiOperation({ summary: 'Retrieve verification audit trail history' })
  async getVerificationHistory(
    @Req() req: any,
    @Param('profileId') profileId: string,
    @Param('registrationId') registrationId: string,
  ) {
    return this.billingService.getVerificationHistory(
      req.user.id,
      profileId,
      registrationId,
    );
  }

  @Delete(':profileId/gst-registrations/:registrationId')
  @ApiOperation({ summary: 'Delete or detach a GST registration' })
  async deleteGstRegistration(
    @Req() req: any,
    @Param('profileId') profileId: string,
    @Param('registrationId') registrationId: string,
  ) {
    return this.billingService.deleteGstRegistration(
      req.user.id,
      profileId,
      registrationId,
    );
  }
}
