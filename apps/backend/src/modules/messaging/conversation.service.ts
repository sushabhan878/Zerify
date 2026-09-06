import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConversationType, UserRole } from '@prisma/client';
import { MessagingRepository, PrismaLike } from './messaging.repository';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ListConversationsQueryDto } from './dto/list-messages-query.dto';
import { MESSAGING_ERRORS } from './events/messaging-events';

/** Shape returned to the client for one row in the conversation sidebar. */
export interface ConversationSummary {
  id: string;
  type: ConversationType;
  campaign: { id: string; title: string; status: string } | null;
  applicationStatus: string | null;
  counterpart: {
    userId: string;
    name: string;
    role: UserRole;
    avatarUrl: string | null;
  } | null;
  lastMessage: {
    id: string;
    type: string;
    content: string | null;
    senderId: string | null;
    createdAt: string;
    sequenceNumber: number;
  } | null;
  lastMessageAt: string | null;
  unreadCount: number;
  muted: boolean;
  archived: boolean;
  messageSequence: number;
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(private readonly repository: MessagingRepository) {}

  /**
   * Find-or-create a 1:1 conversation. Idempotent by design: opening a chat
   * twice must not fork the history.
   */
  async findOrCreateDirect(userId: string, dto: CreateConversationDto) {
    if (dto.participantId === userId) {
      throw new BadRequestException(MESSAGING_ERRORS.SELF_CONVERSATION);
    }

    const [me, other] = await Promise.all([
      this.repository.findUserById(userId),
      this.repository.findUserById(dto.participantId),
    ]);

    if (!me) throw new ForbiddenException(MESSAGING_ERRORS.UNAUTHORIZED);
    if (!other) throw new NotFoundException(MESSAGING_ERRORS.INVALID_PARTICIPANT);

    const existing = await this.repository.findConversationBetween(userId, dto.participantId);
    if (existing) {
      return { conversation: existing, created: false };
    }

    const conversation = await this.repository.createConversation({
      type: dto.campaignId ? ConversationType.CAMPAIGN : ConversationType.DIRECT,
      createdById: userId,
      campaignId: dto.campaignId ?? null,
      participants: [
        { userId: me.id, userType: me.role },
        { userId: other.id, userType: other.role },
      ],
    });

    return { conversation, created: true };
  }

  /**
   * Resolves the conversation for an application-lifecycle system message,
   * creating it on first use. Called by the outbox worker, so it accepts a
   * transaction client.
   */
  async resolveCollaborationConversation(
    params: {
      applicationId: string;
      campaignId: string;
      brandUserId: string;
      influencerUserId: string;
    },
    client?: PrismaLike,
  ) {
    const byApplication = await this.repository.findConversationByApplicationId(
      params.applicationId,
    );
    if (byApplication) return byApplication;

    // Reuse an existing thread between the two users rather than opening a
    // second one — the users experience a single continuous chat.
    const existing = await this.repository.findConversationBetween(
      params.brandUserId,
      params.influencerUserId,
    );
    if (existing) return existing;

    return this.repository.createConversation(
      {
        type: ConversationType.COLLABORATION,
        createdById: params.influencerUserId,
        campaignId: params.campaignId,
        applicationId: params.applicationId,
        participants: [
          { userId: params.brandUserId, userType: UserRole.BRAND },
          { userId: params.influencerUserId, userType: UserRole.INFLUENCER },
        ],
      },
      client,
    );
  }

  async listForUser(userId: string, query: ListConversationsQueryDto & { search?: string }) {
    const result = await this.repository.listConversationsForUser(userId, {
      cursor: query.cursor,
      limit: query.limit,
      search: query.search,
    });

    return {
      items: result.items.map((c) => this.toSummary(c, userId)),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  async getById(conversationId: string, userId: string) {
    const conversation = await this.repository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException(MESSAGING_ERRORS.CONVERSATION_NOT_FOUND);
    }
    if (!conversation.participants.some((p) => p.userId === userId)) {
      throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
    }
    return conversation;
  }

  async markRead(conversationId: string, userId: string, lastReadMessageId?: string) {
    return this.repository.markRead(conversationId, userId, lastReadMessageId);
  }

  async updateSettings(
    conversationId: string,
    userId: string,
    data: { muted?: boolean; archived?: boolean },
  ) {
    return this.repository.updateParticipantSettings(conversationId, userId, data);
  }

  async getTotalUnread(userId: string) {
    return { totalUnread: await this.repository.getTotalUnreadCount(userId) };
  }

  /** Maps a Prisma conversation row into the client-facing sidebar shape. */
  toSummary(conversation: any, userId: string): ConversationSummary {
    const mine = conversation.participants?.find((p: any) => p.userId === userId);
    const other = conversation.participants?.find((p: any) => p.userId !== userId);
    const lastMessage = conversation.messages?.[0] ?? null;

    return {
      id: conversation.id,
      type: conversation.type,
      campaign: conversation.campaign
        ? {
            id: conversation.campaign.id,
            title: conversation.campaign.title,
            status: conversation.campaign.status,
          }
        : null,
      applicationStatus: conversation.application?.status ?? null,
      counterpart: other
        ? {
            userId: other.userId,
            name: this.displayName(other.user),
            role: other.userType,
            avatarUrl:
              other.user?.brandProfile?.logoUrl ?? other.user?.influencer?.avatarUrl ?? null,
          }
        : null,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            type: lastMessage.type,
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt.toISOString(),
            sequenceNumber: lastMessage.sequenceNumber,
          }
        : null,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      unreadCount: mine?.unreadCount ?? 0,
      muted: mine?.muted ?? false,
      archived: mine?.archived ?? false,
      messageSequence: conversation.messageSequence ?? 0,
    };
  }

  private displayName(user: any): string {
    return (
      user?.brandProfile?.companyName ||
      user?.name ||
      user?.influencer?.handle ||
      user?.email?.split('@')[0] ||
      'Zerify User'
    );
  }
}
