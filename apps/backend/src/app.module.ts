import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { PrismaModule } from './database/prisma.module';
import { VipAccessModule } from './modules/vip-access/vip-access.module';
import { AuthModule } from './modules/auth/auth.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { InfluencerModule } from './modules/influencer/influencer.module';
import { SocialModule } from './modules/social/social.module';
import { BrandModule } from './modules/brand/brand.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300 * 1000, // 5 minutes default TTL
    }),
    PrismaModule,
    VipAccessModule,
    AuthModule,
    FileUploadModule,
    InfluencerModule,
    SocialModule,
    BrandModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
