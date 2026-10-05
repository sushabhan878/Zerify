import { Injectable, Logger } from '@nestjs/common';
import {
  AttachmentStatus,
  ConversationType,
  MessageType,
  OutboxStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './dto/list-messages-query.dto';

/** Prisma client or an active interactive-transaction client. */
export type PrismaLike = Prisma.TransactionClient | PrismaService;

export interface CreateMessageInput {
  conversationId: string;
  senderId: string | null;
  type: MessageType;
  content?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  clientMessageId?: string | null;
  systemEvent?: string | null;
  attachmentId?: string | null;
}

export interface CreateMessageResult {
  message: MessageWithRelations;
  /** True when an existing row was returned for a repeated clientMessageId. */
  deduped: boolean;
}

const MESSAGE_INCLUDE = {
  sender: { select: { id: true, name: true, email: true, role: true } },
  attachments: {
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      status: true,
      createdAt: true,
    },
  },
} satisfies Prisma.MessageInclude;

export type MessageWithRelations = Prisma.MessageGetPayload<{ include: typeof MESSAGE_INCLUDE }>;

@Injectable()
export class MessagingRepository {
  private readonly logger = new Logger(MessagingRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------- conversations

  /**
   * Authorization primitive: a user may only touch a conversation they
   * participate in. Every read/write path funnels through this.
   */
  async findParticipant(conversationId: string, userId: string) {
    return this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
  }

  async findConversationById(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
      },
    });
  }

  /**
   * Everyone who shares at least one conversation with this user — the audience
   * for presence updates.
   */
  async findConversationPeerIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.conversationParticipant.findMany({
      where: {
        userId: { not: userId },
        conversation: { participants: { some: { userId } } },
      },
      select: { userId: true },
      distinct: ['userId'],
      take: 500,
    });
    return rows.map((r) => r.userId);
  }

  async findParticipantUserIds(conversationId: string): Promise<string[]> {
    const rows = await this.prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    return rows.map((r) => r.userId);
  }

  /** Finds an existing 1:1 DIRECT/COLLABORATION conversation between two users. */
  async findConversationBetween(userA: string, userB: string) {
    return this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userA } } },
          { participants: { some: { userId: userB } } },
        ],
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findConversationByApplicationId(applicationId: string) {
    return this.prisma.conversation.findUnique({
      where: { applicationId },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
      },
    });
  }

  async createConversation(
    params: {
      type: ConversationType;
      createdById: string;
      campaignId?: string | null;
      applicationId?: string | null;
      participants: Array<{ userId: string; userType: UserRole }>;
    },
    client: PrismaLike = this.prisma,
  ) {
    return client.conversation.create({
      data: {
        type: params.type,
        createdById: params.createdById,
        campaignId: params.campaignId ?? null,
        applicationId: params.applicationId ?? null,
        participants: {
          create: params.participants.map((p) => ({ userId: p.userId, userType: p.userType })),
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
      },
    });
  }

  async listConversationsForUser(
    userId: string,
    options: { cursor?: string; limit?: number; search?: string } = {},
  ) {
    const limit = Math.min(options.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const cursorDate = options.cursor ? new Date(options.cursor) : null;
    const search = options.search?.trim();

    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { userId, archived: false } },
        ...(cursorDate && !Number.isNaN(cursorDate.getTime())
          ? { lastMessageAt: { lt: cursorDate } }
          : {}),
        ...(search
          ? {
              participants: {
                some: {
                  userId: { not: userId },
                  user: {
                    OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      { email: { contains: search, mode: 'insensitive' } },
                      {
                        brandProfile: { companyName: { contains: search, mode: 'insensitive' } },
                      },
                      { influencer: { handle: { contains: search, mode: 'insensitive' } } },
                    ],
                  },
                },
              },
            }
          : {}),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                brandProfile: { select: { companyName: true, logoUrl: true } },
                influencer: { select: { handle: true, avatarUrl: true } },
              },
            },
          },
        },
        campaign: { select: { id: true, title: true, status: true } },
        application: { select: { id: true, status: true } },
        messages: {
          orderBy: { sequenceNumber: 'desc' },
          take: 1,
          include: MESSAGE_INCLUDE,
        },
      },
      orderBy: [{ lastMessageAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      take: limit + 1,
    });

    const hasMore = conversations.length > limit;
    const page = hasMore ? conversations.slice(0, limit) : conversations;
    const last = page[page.length - 1];

    return {
      items: page,
      nextCursor: hasMore && last?.lastMessageAt ? last.lastMessageAt.toISOString() : null,
      hasMore,
    };
  }

  // ---------------------------------------------------------------- messages

  /**
   * Atomically: bump the conversation's sequence counter, insert the message
   * with that sequence, update the conversation pointers, and increment
   * unread counts for everyone except the sender.
   *
   * A repeated `clientMessageId` hits the unique constraint (P2002); we return
   * the original row instead of throwing, which is the idempotency guarantee.
   */
  async createMessageAtomic(input: CreateMessageInput): Promise<CreateMessageResult> {
    try {
      const message = await this.prisma.$transaction(async (tx) => {
        const conversation = await tx.conversation.update({
          where: { id: input.conversationId },
          data: { messageSequence: { increment: 1 } },
          select: { messageSequence: true },
        });

        const created = await tx.message.create({
          data: {
            conversationId: input.conversationId,
            senderId: input.senderId,
            type: input.type,
            content: input.content ?? null,
            metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
            clientMessageId: input.clientMessageId ?? null,
            systemEvent: input.systemEvent ?? null,
            sequenceNumber: conversation.messageSequence,
          },
          include: MESSAGE_INCLUDE,
        });

        if (input.attachmentId) {
          await tx.messageAttachment.update({
            where: { id: input.attachmentId },
            data: { messageId: created.id },
          });
        }

        await tx.conversation.update({
          where: { id: input.conversationId },
          data: { lastMessageId: created.id, lastMessageAt: created.createdAt },
        });

        await tx.conversationParticipant.updateMany({
          where: {
            conversationId: input.conversationId,
            ...(input.senderId ? { userId: { not: input.senderId } } : {}),
          },
          data: { unreadCount: { increment: 1 }, archived: false },
        });

        if (!input.attachmentId) {
          return created;
        }

        return tx.message.findUniqueOrThrow({
          where: { id: created.id },
          include: MESSAGE_INCLUDE,
        });
      });

      return { message, deduped: false };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        input.clientMessageId
      ) {
        const existing = await this.prisma.message.findFirst({
          where: {
            conversationId: input.conversationId,
            senderId: input.senderId,
            clientMessageId: input.clientMessageId,
          },
          include: MESSAGE_INCLUDE,
        });
        if (existing) {
          this.logger.debug(`Deduped repeat send for clientMessageId=${input.clientMessageId}`);
          return { message: existing, deduped: true };
        }
      }
      throw error;
    }
  }

  /** Newest-first keyset page of messages, cursored on `sequenceNumber`. */
  async listMessages(conversationId: string, options: { cursor?: number; limit?: number } = {}) {
    const limit = Math.min(options.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        ...(options.cursor ? { sequenceNumber: { lt: options.cursor } } : {}),
      },
      include: MESSAGE_INCLUDE,
      orderBy: { sequenceNumber: 'desc' },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;

    return {
      // Return chronological order so the UI can render top-to-bottom directly.
      items: page.slice().reverse(),
      nextCursor: hasMore ? page[page.length - 1]?.sequenceNumber ?? null : null,
      hasMore,
    };
  }

  /** Reconnect sync: everything the client missed while offline (PRD §50). */
  async findMessagesAfterSequence(conversationId: string, sequenceNumber: number, limit = 200) {
    return this.prisma.message.findMany({
      where: { conversationId, sequenceNumber: { gt: sequenceNumber } },
      include: MESSAGE_INCLUDE,
      orderBy: { sequenceNumber: 'asc' },
      take: limit,
    });
  }

  async findMessageById(messageId: string) {
    return this.prisma.message.findUnique({ where: { id: messageId }, include: MESSAGE_INCLUDE });
  }

  /**
   * Lookup by idempotency key for SYSTEM messages.
   *
   * Postgres treats NULLs as distinct in unique indexes, so the
   * `(conversationId, senderId, clientMessageId)` constraint does not dedupe
   * system messages (senderId is NULL). The outbox therefore checks explicitly.
   */
  async findSystemMessageByClientId(conversationId: string, clientMessageId: string) {
    return this.prisma.message.findFirst({
      where: { conversationId, senderId: null, clientMessageId },
      include: MESSAGE_INCLUDE,
    });
  }

  // ---------------------------------------------------------------- read state

  async markRead(conversationId: string, userId: string, lastReadMessageId?: string | null) {
    let resolvedId = lastReadMessageId ?? null;
    if (!resolvedId) {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { lastMessageId: true },
      });
      resolvedId = conversation?.lastMessageId ?? null;
    }

    return this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadMessageId: resolvedId, lastReadAt: new Date(), unreadCount: 0 },
    });
  }

  async updateParticipantSettings(
    conversationId: string,
    userId: string,
    data: { muted?: boolean; archived?: boolean },
  ) {
    return this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data,
    });
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    const result = await this.prisma.conversationParticipant.aggregate({
      where: { userId, muted: false },
      _sum: { unreadCount: true },
    });
    return result._sum.unreadCount ?? 0;
  }

  // ---------------------------------------------------------------- attachments

  async createAttachment(data: {
    conversationId: string;
    uploaderId: string;
    objectKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    resourceType: string;
  }) {
    return this.prisma.messageAttachment.create({ data });
  }

  async findAttachmentById(attachmentId: string) {
    return this.prisma.messageAttachment.findUnique({ where: { id: attachmentId } });
  }

  async updateAttachment(
    attachmentId: string,
    data: { status?: AttachmentStatus; publicId?: string; fileSize?: number },
  ) {
    return this.prisma.messageAttachment.update({ where: { id: attachmentId }, data });
  }

  async countUploadsSince(uploaderId: string, since: Date): Promise<number> {
    return this.prisma.messageAttachment.count({
      where: { uploaderId, createdAt: { gte: since } },
    });
  }

  // ---------------------------------------------------------------- outbox

  /**
   * Writes an outbox row inside the caller's transaction so a business status
   * change and its event commit or roll back together (PRD §38).
   */
  async createOutboxEvent(
    client: PrismaLike,
    eventType: string,
    aggregateId: string,
    payload: Prisma.InputJsonValue,
  ) {
    return client.outboxEvent.create({ data: { eventType, aggregateId, payload } });
  }

  /** Claims a batch of pending events, flipping them to PROCESSING. */
  async claimPendingOutboxEvents(limit = 20) {
    const candidates = await this.prisma.outboxEvent.findMany({
      where: { status: OutboxStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true },
    });

    if (candidates.length === 0) return [];

    const ids = candidates.map((c) => c.id);
    // Conditional update keeps the claim safe if a second poller races us.
    const claimed = await this.prisma.outboxEvent.updateMany({
      where: { id: { in: ids }, status: OutboxStatus.PENDING },
      data: { status: OutboxStatus.PROCESSING, attempts: { increment: 1 } },
    });

    if (claimed.count === 0) return [];

    return this.prisma.outboxEvent.findMany({
      where: { id: { in: ids }, status: OutboxStatus.PROCESSING },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markOutboxProcessed(id: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: { status: OutboxStatus.PROCESSED, processedAt: new Date(), lastError: null },
    });
  }

  /** Returns the event to PENDING for retry, or FAILED once attempts are spent. */
  async markOutboxFailed(id: string, error: string, maxAttempts = 5) {
    const current = await this.prisma.outboxEvent.findUnique({
      where: { id },
      select: { attempts: true },
    });
    const exhausted = (current?.attempts ?? 0) >= maxAttempts;

    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: exhausted ? OutboxStatus.FAILED : OutboxStatus.PENDING,
        lastError: error.slice(0, 2000),
      },
    });
  }

  // ---------------------------------------------------------------- lookups

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
  }
}
