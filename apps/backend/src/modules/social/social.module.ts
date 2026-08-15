import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialRepository } from './social.repository';
import {
  MetaProvider,
  InstagramProvider,
  YoutubeProvider,
  TiktokProvider,
  LinkedinProvider,
  TwitterProvider,
} from './providers';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SocialController],
  providers: [
    SocialService,
    SocialRepository,
    MetaProvider,
    InstagramProvider,
    YoutubeProvider,
    TiktokProvider,
    LinkedinProvider,
    TwitterProvider,
  ],
  exports: [SocialService, SocialRepository],
})
export class SocialModule {}
