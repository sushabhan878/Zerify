import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialRepository } from './social.repository';
import { SocialGateway } from './social.gateway';
import {
  MetaProvider,
  InstagramProvider,
  YoutubeProvider,
  TiktokProvider,
  LinkedinProvider,
  TwitterProvider,
  ThreadsProvider,
} from './providers';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SocialController],
  providers: [
    SocialService,
    SocialRepository,
    SocialGateway,
    MetaProvider,
    InstagramProvider,
    YoutubeProvider,
    TiktokProvider,
    LinkedinProvider,
    TwitterProvider,
    ThreadsProvider,
  ],
  exports: [SocialService, SocialRepository, SocialGateway],
})
export class SocialModule {}

