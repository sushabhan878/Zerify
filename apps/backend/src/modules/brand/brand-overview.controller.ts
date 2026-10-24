import { Controller, ForbiddenException, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrandOverviewService } from './brand-overview.service';

@ApiTags('brand')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('brand/analytics')
export class BrandOverviewController {
  constructor(private readonly overview: BrandOverviewService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get database-backed overview for the signed-in brand' })
  getOverview(@Req() req: { user: { id: string; role: string } }) {
    if (req.user.role !== 'BRAND') throw new ForbiddenException('Brand access required');
    return this.overview.getOverview(req.user.id);
  }
}
