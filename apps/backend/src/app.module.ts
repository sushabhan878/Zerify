import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { VipAccessModule } from './modules/vip-access/vip-access.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    VipAccessModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
