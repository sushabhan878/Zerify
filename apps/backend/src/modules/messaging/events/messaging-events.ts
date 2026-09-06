/**
 * Canonical socket event names + outbox event types for the messaging module.
 * Kept in one place so the gateway, services and frontend stay in sync.
 */

// Client → Server
export const WS_IN = {
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_LEAVE: 'conversation:leave',
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  SYNC_MISSED: 'sync:missed',
  PRESENCE_QUERY: 'presence:query',
} as const;

// Server → Client
export const WS_OUT = {
  CONNECTED: 'connected',
  CONVERSATION_JOINED: 'conversation:joined',
  CONVERSATION_UPDATED: 'conversation:updated',
  MESSAGE_NEW: 'message:new',
  MESSAGE_ACK: 'message:ack',
  MESSAGE_FAILED: 'message:failed',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  PRESENCE_UPDATE: 'presence:update',
  NOTIFICATION_NEW: 'notification:new',
  SYNC_RESULT: 'sync:result',
  ERROR: 'messaging:error',
} as const;

// Room helpers — a single source of truth for room naming.
export const conversationRoom = (conversationId: string) => `conversation:${conversationId}`;
export const userRoom = (userId: string) => `user:${userId}`;

/**
 * Outbox event types. Zerify's CampaignApplication is the concrete stand-in
 * for the PRD's "collaboration request".
 */
export const OUTBOX_EVENTS = {
  COLLABORATION_REQUEST_CREATED: 'COLLABORATION_REQUEST_CREATED',
  COLLABORATION_REQUEST_UNDER_REVIEW: 'COLLABORATION_REQUEST_UNDER_REVIEW',
  COLLABORATION_REQUEST_SHORTLISTED: 'COLLABORATION_REQUEST_SHORTLISTED',
  COLLABORATION_REQUEST_REJECTED: 'COLLABORATION_REQUEST_REJECTED',
  COLLABORATION_REQUEST_WITHDRAWN: 'COLLABORATION_REQUEST_WITHDRAWN',
} as const;

export type OutboxEventType = (typeof OUTBOX_EVENTS)[keyof typeof OUTBOX_EVENTS];

/** Payload persisted on an OutboxEvent row for application-lifecycle events. */
export interface ApplicationEventPayload {
  applicationId: string;
  campaignId: string;
  campaignTitle?: string | null;
  brandUserId: string;
  brandName?: string | null;
  influencerUserId: string;
  influencerName?: string | null;
  /** Which side triggered the transition — used to pick the actor in the copy. */
  actor: 'BRAND' | 'INFLUENCER';
}

/** Machine-readable error codes surfaced to clients (PRD §67). */
export const MESSAGING_ERRORS = {
  CONVERSATION_ACCESS_DENIED: 'CONVERSATION_ACCESS_DENIED',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  MESSAGE_EMPTY: 'MESSAGE_EMPTY',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  ATTACHMENT_NOT_FOUND: 'ATTACHMENT_NOT_FOUND',
  ATTACHMENT_NOT_AVAILABLE: 'ATTACHMENT_NOT_AVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_PARTICIPANT: 'INVALID_PARTICIPANT',
  SELF_CONVERSATION: 'SELF_CONVERSATION',
} as const;
