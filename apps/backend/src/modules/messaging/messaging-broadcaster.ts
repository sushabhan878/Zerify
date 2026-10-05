import { Injectable, Logger } from '@nestjs/common';

/**
 * Indirection between services and the WebSocket gateway.
 *
 * Services need to broadcast; the gateway needs to call services. Rather than
 * a circular DI dependency (or `forwardRef` sprinkled everywhere), the gateway
 * registers itself here on init and services emit through this thin relay.
 * It also means services never import socket.io.
 */
export interface MessagingEmitter {
  emitToConversation(conversationId: string, event: string, payload: unknown): void;
  emitToUser(userId: string, event: string, payload: unknown): void;
}

@Injectable()
export class MessagingBroadcaster implements MessagingEmitter {
  private readonly logger = new Logger(MessagingBroadcaster.name);
  private emitter: MessagingEmitter | null = null;

  register(emitter: MessagingEmitter): void {
    this.emitter = emitter;
  }

  emitToConversation(conversationId: string, event: string, payload: unknown): void {
    if (!this.emitter) {
      // Not an error: HTTP-only flows work fine before any socket connects.
      this.logger.debug(`No emitter registered; dropped ${event} for ${conversationId}`);
      return;
    }
    this.emitter.emitToConversation(conversationId, event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    if (!this.emitter) {
      this.logger.debug(`No emitter registered; dropped ${event} for user ${userId}`);
      return;
    }
    this.emitter.emitToUser(userId, event, payload);
  }
}
