import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { BrandRepository } from './brand.repository';
import { PrismaModule } from '../../database/prisma.module';
import { BrandOverviewController } from './brand-overview.controller';
import { BrandOverviewService } from './brand-overview.service';
import { BrandOverviewRepository } from './brand-overview.repository';

@Module({
  imports: [PrismaModule],
  controllers: [BrandController, BrandOverviewController],
  providers: [BrandService, BrandRepository, BrandOverviewService, BrandOverviewRepository],
  exports: [BrandService, BrandRepository],
})
export class BrandModule {}
