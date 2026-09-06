import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../database/prisma.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { MessagingController } from './messaging.controller';
import { MessagingRepository } from './messaging.repository';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { AttachmentService } from './attachment.service';
import { PresenceService } from './presence.service';
import { OutboxService } from './outbox.service';
import { MessagingGateway } from './messaging.gateway';
import { MessagingBroadcaster } from './messaging-broadcaster';
import { ConversationParticipantGuard } from './guards/conversation-participant.guard';

@Module({
  imports: [
    PrismaModule,
    FileUploadModule,
    ScheduleModule.forRoot(),
    // Same secret as the HTTP JwtStrategy — the gateway verifies handshakes itself.
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'zerify-secret-key-super-secure-jwt',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [MessagingController],
  providers: [
    MessagingRepository,
    MessagingBroadcaster,
    PresenceService,
    ConversationService,
    MessageService,
    AttachmentService,
    OutboxService,
    MessagingGateway,
    ConversationParticipantGuard,
  ],
  // OutboxService is what CampaignModule needs to enqueue lifecycle events.
  exports: [OutboxService, ConversationService, MessagingRepository],
})
export class MessagingModule {}
