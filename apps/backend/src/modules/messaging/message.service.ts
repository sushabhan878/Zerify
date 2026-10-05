import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttachmentStatus, MessageType, Prisma } from '@prisma/client';
import { MessagingRepository, MessageWithRelations } from './messaging.repository';
import { MessagingBroadcaster } from './messaging-broadcaster';
import { PresenceService } from './presence.service';
import { MAX_MESSAGE_LENGTH, SendMessageDto } from './dto/send-message.dto';
import { ListMessagesQueryDto } from './dto/list-messages-query.dto';
import { MESSAGING_ERRORS, WS_OUT, conversationRoom } from './events/messaging-events';

export interface SendMessageResult {
  message: ReturnType<MessageService['toDto']>;
  deduped: boolean;
}

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly repository: MessagingRepository,
    private readonly broadcaster: MessagingBroadcaster,
    private readonly presence: PresenceService,
  ) {}

  /**
   * Persists a user message then fans it out.
   *
   * `senderId` is always the authenticated user — a payload-supplied sender is
   * ignored, which is what makes SYSTEM messages unspoofable (PRD §45).
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    dto: SendMessageDto,
  ): Promise<SendMessageResult> {
    const participant = await this.repository.findParticipant(conversationId, senderId);
    if (!participant) {
      throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
    }

    const content = (dto.content ?? '').trim();
    if (!content && !dto.attachmentId) {
      throw new BadRequestException(MESSAGING_ERRORS.MESSAGE_EMPTY);
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(MESSAGING_ERRORS.MESSAGE_TOO_LONG);
    }

    let type: MessageType = MessageType.TEXT;
    if (dto.attachmentId) {
      const attachment = await this.repository.findAttachmentById(dto.attachmentId);
      if (!attachment || attachment.conversationId !== conversationId) {
        throw new NotFoundException(MESSAGING_ERRORS.ATTACHMENT_NOT_FOUND);
      }
      if (attachment.uploaderId !== senderId) {
        throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
      }
      if (attachment.status !== AttachmentStatus.AVAILABLE) {
        throw new BadRequestException(MESSAGING_ERRORS.ATTACHMENT_NOT_AVAILABLE);
      }
      type = attachment.mimeType.startsWith('image/') ? MessageType.IMAGE : MessageType.FILE;
    }

    const { message, deduped } = await this.repository.createMessageAtomic({
      conversationId,
      senderId,
      type,
      content: content || null,
      clientMessageId: dto.clientMessageId ?? null,
      attachmentId: dto.attachmentId ?? null,
    });

    if (!deduped) {
      await this.fanOut(conversationId, message, senderId);
    }

    return { message: this.toDto(message), deduped };
  }

  /**
   * Persists a backend-authored SYSTEM message. Only the outbox worker reaches
   * this — there is no client-facing path to it.
   */
  async createSystemMessage(params: {
    conversationId: string;
    text: string;
    systemEvent: string;
    metadata: Prisma.InputJsonValue;
    /** Idempotency key so a retried outbox event cannot duplicate the message. */
    clientMessageId: string;
  }) {
    // Postgres unique indexes treat NULLs as distinct, so the
    // (conversationId, senderId, clientMessageId) constraint does not dedupe
    // rows where senderId is NULL. Check explicitly before inserting.
    const existing = await this.repository.findSystemMessageByClientId(
      params.conversationId,
      params.clientMessageId,
    );
    if (existing) {
      return { message: this.toDto(existing), deduped: true };
    }

    const { message, deduped } = await this.repository.createMessageAtomic({
      conversationId: params.conversationId,
      senderId: null,
      type: MessageType.SYSTEM,
      content: params.text,
      metadata: params.metadata,
      systemEvent: params.systemEvent,
      clientMessageId: params.clientMessageId,
    });

    if (!deduped) {
      await this.fanOut(params.conversationId, message, null);
    }

    return { message: this.toDto(message), deduped };
  }

  async listMessages(conversationId: string, query: ListMessagesQueryDto) {
    const result = await this.repository.listMessages(conversationId, {
      cursor: query.cursor,
      limit: query.limit,
    });
    return {
      items: result.items.map((m) => this.toDto(m)),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  /** Reconnect sync — everything after the client's highest known sequence. */
  async getMissedMessages(conversationId: string, userId: string, afterSequence: number) {
    const participant = await this.repository.findParticipant(conversationId, userId);
    if (!participant) {
      throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
    }
    const messages = await this.repository.findMessagesAfterSequence(
      conversationId,
      Number.isFinite(afterSequence) && afterSequence > 0 ? afterSequence : 0,
    );
    return messages.map((m) => this.toDto(m));
  }

  async markRead(conversationId: string, userId: string, lastReadMessageId?: string) {
    const participant = await this.repository.findParticipant(conversationId, userId);
    if (!participant) {
      throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
    }

    const updated = await this.repository.markRead(conversationId, userId, lastReadMessageId);

    // Let the other side render read ticks.
    this.broadcaster.emitToConversation(conversationId, WS_OUT.MESSAGE_READ, {
      conversationId,
      userId,
      lastReadMessageId: updated.lastReadMessageId,
      lastReadAt: updated.lastReadAt?.toISOString() ?? null,
    });

    this.broadcaster.emitToUser(userId, WS_OUT.CONVERSATION_UPDATED, {
      conversationId,
      unreadCount: 0,
    });

    return {
      conversationId,
      lastReadMessageId: updated.lastReadMessageId,
      unreadCount: updated.unreadCount,
    };
  }

  /**
   * Broadcasts a committed message: to the open conversation room, and to each
   * participant's personal room so sidebars update even when the chat is closed.
   */
  private async fanOut(
    conversationId: string,
    message: MessageWithRelations,
    senderId: string | null,
  ) {
    const dto = this.toDto(message);
    this.broadcaster.emitToConversation(conversationId, WS_OUT.MESSAGE_NEW, {
      conversationId,
      message: dto,
    });

    const participantIds = await this.repository.findParticipantUserIds(conversationId);
    for (const participantId of participantIds) {
      this.broadcaster.emitToUser(participantId, WS_OUT.CONVERSATION_UPDATED, {
        conversationId,
        lastMessage: dto,
        lastMessageAt: dto.createdAt,
        incrementUnread: participantId !== senderId,
      });

      if (participantId !== senderId) {
        this.broadcaster.emitToUser(participantId, WS_OUT.NOTIFICATION_NEW, {
          conversationId,
          messageId: dto.id,
          type: dto.type,
          preview: this.preview(dto),
          senderName: dto.sender?.name ?? null,
          createdAt: dto.createdAt,
        });
      }
    }
  }

  private preview(dto: ReturnType<MessageService['toDto']>): string {
    if (dto.type === MessageType.IMAGE) return 'Sent an image';
    if (dto.type === MessageType.FILE) {
      return `Sent a file${dto.attachments[0]?.fileName ? `: ${dto.attachments[0].fileName}` : ''}`;
    }
    const text = dto.content ?? '';
    return text.length > 140 ? `${text.slice(0, 140)}…` : text;
  }

  /** Wire format for a message. Never leaks signed URLs or storage keys. */
  toDto(message: MessageWithRelations) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: message.sender
        ? {
            id: message.sender.id,
            name: message.sender.name ?? message.sender.email?.split('@')[0] ?? 'Zerify User',
            role: message.sender.role,
          }
        : null,
      type: message.type,
      content: message.content,
      metadata: (message.metadata ?? null) as unknown,
      systemEvent: message.systemEvent,
      clientMessageId: message.clientMessageId,
      sequenceNumber: message.sequenceNumber,
      createdAt: message.createdAt.toISOString(),
      attachments: (message.attachments ?? []).map((a) => ({
        id: a.id,
        fileName: a.fileName,
        mimeType: a.mimeType,
        fileSize: a.fileSize,
        status: a.status,
      })),
    };
  }
}
