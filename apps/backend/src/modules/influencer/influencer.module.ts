import { Module } from '@nestjs/common';
import { InfluencerController } from './influencer.controller';
import { InfluencerService } from './influencer.service';
import { InfluencerRepository } from './influencer.repository';
import { NetworkService } from './network.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InfluencerController],
  providers: [InfluencerService, InfluencerRepository, NetworkService],
  exports: [InfluencerService, InfluencerRepository, NetworkService],
})
export class InfluencerModule {}
