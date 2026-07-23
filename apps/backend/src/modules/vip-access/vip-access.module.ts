import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { VipAccessController } from './vip-access.controller';
import { VipAccessService } from './vip-access.service';

@Module({
  imports: [PrismaModule],
  controllers: [VipAccessController],
  providers: [VipAccessService],
  exports: [VipAccessService],
})
export class VipAccessModule {}
