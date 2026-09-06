import { Injectable, Logger } from '@nestjs/common';

/**
 * Presence + typing state. Deliberately behind an interface: this v1 keeps
 * everything in process memory, and swapping in Redis for multi-instance
 * deployments means adding one class, with no call-site changes (PRD §90).
 */
export interface PresenceStore {
  setOnline(userId: string, socketId: string): void;
  setOffline(userId: string, socketId: string): void;
  isOnline(userId: string): boolean;
  getLastSeen(userId: string): Date | null;
  getSocketIds(userId: string): string[];
}

/** Typing indicators expire on their own — never persisted (PRD §20). */
const TYPING_TTL_MS = 4000;

@Injectable()
export class PresenceService implements PresenceStore {
  private readonly logger = new Logger(PresenceService.name);

  /** userId → set of live socket ids (one user, many tabs/devices). */
  private readonly sockets = new Map<string, Set<string>>();
  private readonly lastSeen = new Map<string, Date>();
  /** `conversationId:userId` → expiry timestamp. */
  private readonly typing = new Map<string, number>();

  setOnline(userId: string, socketId: string): void {
    const existing = this.sockets.get(userId);
    if (existing) {
      existing.add(socketId);
    } else {
      this.sockets.set(userId, new Set([socketId]));
    }
    this.lastSeen.set(userId, new Date());
  }

  setOffline(userId: string, socketId: string): void {
    const existing = this.sockets.get(userId);
    if (!existing) return;
    existing.delete(socketId);
    if (existing.size === 0) {
      this.sockets.delete(userId);
    }
    this.lastSeen.set(userId, new Date());
  }

  isOnline(userId: string): boolean {
    return (this.sockets.get(userId)?.size ?? 0) > 0;
  }

  getLastSeen(userId: string): Date | null {
    return this.lastSeen.get(userId) ?? null;
  }

  getSocketIds(userId: string): string[] {
    return Array.from(this.sockets.get(userId) ?? []);
  }

  /** Number of distinct online users — used only for logging/diagnostics. */
  get onlineCount(): number {
    return this.sockets.size;
  }

  // ------------------------------------------------------------------ typing

  startTyping(conversationId: string, userId: string): void {
    this.typing.set(this.typingKey(conversationId, userId), Date.now() + TYPING_TTL_MS);
  }

  stopTyping(conversationId: string, userId: string): void {
    this.typing.delete(this.typingKey(conversationId, userId));
  }

  isTyping(conversationId: string, userId: string): boolean {
    const expiry = this.typing.get(this.typingKey(conversationId, userId));
    if (!expiry) return false;
    if (expiry < Date.now()) {
      this.typing.delete(this.typingKey(conversationId, userId));
      return false;
    }
    return true;
  }

  /** Drops every typing flag for a user, e.g. on disconnect. */
  clearTypingForUser(userId: string): void {
    for (const key of this.typing.keys()) {
      if (key.endsWith(`:${userId}`)) {
        this.typing.delete(key);
      }
    }
  }

  presenceFor(userId: string) {
    return {
      userId,
      online: this.isOnline(userId),
      lastSeen: this.getLastSeen(userId)?.toISOString() ?? null,
    };
  }

  private typingKey(conversationId: string, userId: string): string {
    return `${conversationId}:${userId}`;
  }
}
