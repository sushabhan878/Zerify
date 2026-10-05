import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagingRepository } from './messaging.repository';
import { MessageService } from './message.service';
import { PresenceService } from './presence.service';
import { MessagingBroadcaster, MessagingEmitter } from './messaging-broadcaster';
import {
  MESSAGING_ERRORS,
  WS_IN,
  WS_OUT,
  conversationRoom,
  userRoom,
} from './events/messaging-events';

interface SocketUser {
  id: string;
  name: string | null;
  role: string;
}

/** Per-socket sliding window (PRD §69). */
const MESSAGE_RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/messaging' })
export class MessagingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, MessagingEmitter
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);

  /** socketId → timestamps of recent sends, for rate limiting. */
  private readonly sendTimestamps = new Map<string, number[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly repository: MessagingRepository,
    private readonly messageService: MessageService,
    private readonly presence: PresenceService,
    private readonly broadcaster: MessagingBroadcaster,
  ) {}

  afterInit(): void {
    // Let services broadcast without a circular dependency on this gateway.
    this.broadcaster.register(this);
  }

  /**
   * Passport guards do not run on WS handshakes, so the token is verified here
   * with the same secret the HTTP strategy uses. Unauthenticated sockets are
   * disconnected — there is no anonymous access to this namespace.
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        return this.reject(client, MESSAGING_ERRORS.UNAUTHORIZED);
      }

      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: process.env.JWT_SECRET || 'zerify-secret-key-super-secure-jwt',
      });

      const user = await this.repository.findUserById(payload.sub);
      if (!user) {
        return this.reject(client, MESSAGING_ERRORS.UNAUTHORIZED);
      }

      const socketUser: SocketUser = { id: user.id, name: user.name, role: user.role };
      client.data.user = socketUser;

      // Personal room: sidebar updates and notifications for conversations the
      // user has not opened.
      client.join(userRoom(user.id));
      this.presence.setOnline(user.id, client.id);

      client.emit(WS_OUT.CONNECTED, {
        userId: user.id,
        totalUnread: await this.repository.getTotalUnreadCount(user.id),
      });

      await this.broadcastPresence(user.id);
    } catch (error: any) {
      // Never log the token itself.
      this.logger.warn(`Rejected socket ${client.id}: ${error?.message}`);
      this.reject(client, MESSAGING_ERRORS.UNAUTHORIZED);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.sendTimestamps.delete(client.id);
    const user = client.data?.user as SocketUser | undefined;
    if (!user) return;

    this.presence.setOffline(user.id, client.id);
    this.presence.clearTypingForUser(user.id);

    if (!this.presence.isOnline(user.id)) {
      await this.broadcastPresence(user.id);
    }
  }

  // ------------------------------------------------------------------ rooms

  @SubscribeMessage(WS_IN.CONVERSATION_JOIN)
  async handleJoin(client: Socket, payload: { conversationId?: string }) {
    const user = this.requireUser(client);
    if (!user || !payload?.conversationId) return;

    const participant = await this.repository.findParticipant(payload.conversationId, user.id);
    if (!participant) {
      return client.emit(WS_OUT.ERROR, {
        code: MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED,
        conversationId: payload.conversationId,
      });
    }

    client.join(conversationRoom(payload.conversationId));
    client.emit(WS_OUT.CONVERSATION_JOINED, { conversationId: payload.conversationId });
  }

  @SubscribeMessage(WS_IN.CONVERSATION_LEAVE)
  handleLeave(client: Socket, payload: { conversationId?: string }) {
    if (!payload?.conversationId) return;
    client.leave(conversationRoom(payload.conversationId));
  }

  // ------------------------------------------------------------------ messages

  @SubscribeMessage(WS_IN.MESSAGE_SEND)
  async handleSend(
    client: Socket,
    payload: {
      conversationId?: string;
      content?: string;
      clientMessageId?: string;
      attachmentId?: string;
    },
  ) {
    const user = this.requireUser(client);
    if (!user) return;

    if (!payload?.conversationId) {
      return client.emit(WS_OUT.MESSAGE_FAILED, {
        clientMessageId: payload?.clientMessageId,
        code: MESSAGING_ERRORS.CONVERSATION_NOT_FOUND,
      });
    }

    if (!this.consumeRateLimit(client.id)) {
      return client.emit(WS_OUT.MESSAGE_FAILED, {
        conversationId: payload.conversationId,
        clientMessageId: payload.clientMessageId,
        code: MESSAGING_ERRORS.RATE_LIMITED,
      });
    }

    try {
      // senderId comes from the verified socket, never from the payload.
      const result = await this.messageService.sendMessage(payload.conversationId, user.id, {
        content: payload.content ?? '',
        clientMessageId: payload.clientMessageId,
        attachmentId: payload.attachmentId,
      });

      this.presence.stopTyping(payload.conversationId, user.id);

      client.emit(WS_OUT.MESSAGE_ACK, {
        conversationId: payload.conversationId,
        clientMessageId: payload.clientMessageId ?? result.message.clientMessageId,
        messageId: result.message.id,
        sequenceNumber: result.message.sequenceNumber,
        createdAt: result.message.createdAt,
        status: 'SENT',
      });
    } catch (error: any) {
      client.emit(WS_OUT.MESSAGE_FAILED, {
        conversationId: payload.conversationId,
        clientMessageId: payload.clientMessageId,
        code: this.errorCode(error),
      });
    }
  }

  @SubscribeMessage(WS_IN.MESSAGE_READ)
  async handleRead(client: Socket, payload: { conversationId?: string; lastReadMessageId?: string }) {
    const user = this.requireUser(client);
    if (!user || !payload?.conversationId) return;

    try {
      await this.messageService.markRead(
        payload.conversationId,
        user.id,
        payload.lastReadMessageId,
      );
    } catch (error: any) {
      client.emit(WS_OUT.ERROR, {
        code: this.errorCode(error),
        conversationId: payload.conversationId,
      });
    }
  }

  @SubscribeMessage(WS_IN.SYNC_MISSED)
  async handleSyncMissed(
    client: Socket,
    payload: { conversationId?: string; afterSequence?: number },
  ) {
    const user = this.requireUser(client);
    if (!user || !payload?.conversationId) return;

    try {
      const messages = await this.messageService.getMissedMessages(
        payload.conversationId,
        user.id,
        payload.afterSequence ?? 0,
      );
      client.emit(WS_OUT.SYNC_RESULT, { conversationId: payload.conversationId, messages });
    } catch (error: any) {
      client.emit(WS_OUT.ERROR, {
        code: this.errorCode(error),
        conversationId: payload.conversationId,
      });
    }
  }

  // ------------------------------------------------------------------ typing

  @SubscribeMessage(WS_IN.TYPING_START)
  async handleTypingStart(client: Socket, payload: { conversationId?: string }) {
    const user = this.requireUser(client);
    if (!user || !payload?.conversationId) return;

    const participant = await this.repository.findParticipant(payload.conversationId, user.id);
    if (!participant) return;

    this.presence.startTyping(payload.conversationId, user.id);
    client.to(conversationRoom(payload.conversationId)).emit(WS_OUT.TYPING_START, {
      conversationId: payload.conversationId,
      userId: user.id,
      name: user.name,
    });
  }

  @SubscribeMessage(WS_IN.TYPING_STOP)
  handleTypingStop(client: Socket, payload: { conversationId?: string }) {
    const user = this.requireUser(client);
    if (!user || !payload?.conversationId) return;

    this.presence.stopTyping(payload.conversationId, user.id);
    client.to(conversationRoom(payload.conversationId)).emit(WS_OUT.TYPING_STOP, {
      conversationId: payload.conversationId,
      userId: user.id,
    });
  }

  @SubscribeMessage(WS_IN.PRESENCE_QUERY)
  handlePresenceQuery(client: Socket, payload: { userIds?: string[] }) {
    const user = this.requireUser(client);
    if (!user) return;

    const ids = Array.isArray(payload?.userIds) ? payload.userIds.slice(0, 100) : [];
    client.emit(WS_OUT.PRESENCE_UPDATE, {
      users: ids.map((id) => this.presence.presenceFor(id)),
    });
  }

  // ------------------------------------------------------------------ emitters

  emitToConversation(conversationId: string, event: string, payload: unknown): void {
    this.server?.to(conversationRoom(conversationId)).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server?.to(userRoom(userId)).emit(event, payload);
  }

  // ------------------------------------------------------------------ helpers

  private extractToken(client: Socket): string | null {
    const fromAuth = client.handshake?.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.length > 0) {
      return fromAuth.replace(/^Bearer\s+/i, '');
    }
    const fromQuery = client.handshake?.query?.token;
    if (typeof fromQuery === 'string' && fromQuery.length > 0) {
      return fromQuery.replace(/^Bearer\s+/i, '');
    }
    const header = client.handshake?.headers?.authorization;
    if (typeof header === 'string' && header.length > 0) {
      return header.replace(/^Bearer\s+/i, '');
    }
    return null;
  }

  private reject(client: Socket, code: string): void {
    client.emit(WS_OUT.ERROR, { code });
    client.disconnect(true);
  }

  private requireUser(client: Socket): SocketUser | null {
    const user = client.data?.user as SocketUser | undefined;
    if (!user) {
      this.reject(client, MESSAGING_ERRORS.UNAUTHORIZED);
      return null;
    }
    return user;
  }

  /** Sliding-window rate limiter; returns false once the budget is spent. */
  private consumeRateLimit(socketId: string): boolean {
    const now = Date.now();
    const cutoff = now - RATE_WINDOW_MS;
    const recent = (this.sendTimestamps.get(socketId) ?? []).filter((t) => t > cutoff);

    if (recent.length >= MESSAGE_RATE_LIMIT) {
      this.sendTimestamps.set(socketId, recent);
      return false;
    }

    recent.push(now);
    this.sendTimestamps.set(socketId, recent);
    return true;
  }

  private async broadcastPresence(userId: string): Promise<void> {
    const state = this.presence.presenceFor(userId);
    // Only people who share a conversation with this user need to know.
    const peers = await this.repository.findConversationPeerIds(userId);
    for (const peerId of peers) {
      this.emitToUser(peerId, WS_OUT.PRESENCE_UPDATE, { users: [state] });
    }
  }

  private errorCode(error: any): string {
    const message = error?.message ?? '';
    const known = Object.values(MESSAGING_ERRORS) as string[];
    return known.includes(message) ? message : 'MESSAGE_SEND_FAILED';
  }
}
