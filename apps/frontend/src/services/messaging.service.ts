import { apiRequest } from './api';

export type MessageKind = 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
export type ConversationKind = 'DIRECT' | 'COLLABORATION' | 'CAMPAIGN';
export type DeliveryState = 'SENDING' | 'SENT' | 'READ' | 'FAILED';

export interface AttachmentItem {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: 'PENDING' | 'SCANNING' | 'AVAILABLE' | 'BLOCKED' | 'FAILED';
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string | null;
  sender: { id: string; name: string; role: string } | null;
  type: MessageKind;
  content: string | null;
  metadata?: Record<string, any> | null;
  systemEvent?: string | null;
  clientMessageId?: string | null;
  sequenceNumber: number;
  createdAt: string;
  attachments: AttachmentItem[];
  /** Client-only: optimistic delivery state, never sent by the server. */
  deliveryState?: DeliveryState;
}

export interface ConversationItem {
  id: string;
  type: ConversationKind;
  campaign: { id: string; title: string; status: string } | null;
  applicationStatus: string | null;
  counterpart: {
    userId: string;
    name: string;
    role: string;
    avatarUrl: string | null;
  } | null;
  lastMessage: {
    id: string;
    type: MessageKind;
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

export interface Paginated<T> {
  items: T[];
  nextCursor: string | number | null;
  hasMore: boolean;
}

export interface UploadTarget {
  attachmentId: string;
  objectKey: string;
  maxFileSize: number;
  upload: {
    cloudName: string;
    apiKey: string;
    uploadUrl: string;
    resourceType: string;
    params: Record<string, string | number>;
  };
}

export const MessagingService = {
  async listConversations(cursor?: string): Promise<Paginated<ConversationItem>> {
    return apiRequest(`/conversations${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`);
  },

  async searchConversations(q: string): Promise<Paginated<ConversationItem>> {
    return apiRequest(`/conversations/search?q=${encodeURIComponent(q)}`);
  },

  async createConversation(data: {
    participantId: string;
    campaignId?: string;
    initialMessage?: string;
  }): Promise<{ conversationId: string; created: boolean }> {
    return apiRequest('/conversations', { method: 'POST', body: JSON.stringify(data) });
  },

  async getConversation(conversationId: string): Promise<any> {
    return apiRequest(`/conversations/${conversationId}`);
  },

  async getMessages(conversationId: string, cursor?: number): Promise<Paginated<MessageItem>> {
    const query = cursor ? `?cursor=${cursor}` : '';
    return apiRequest(`/conversations/${conversationId}/messages${query}`);
  },

  /** HTTP fallback for when the socket is unavailable (PRD §44). */
  async sendMessage(
    conversationId: string,
    data: { content: string; clientMessageId?: string; attachmentId?: string },
  ): Promise<{ message: MessageItem; deduped: boolean }> {
    return apiRequest(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async markRead(conversationId: string, lastReadMessageId?: string): Promise<any> {
    return apiRequest(`/conversations/${conversationId}/read`, {
      method: 'POST',
      body: JSON.stringify({ lastReadMessageId }),
    });
  },

  async getUnreadCount(): Promise<{ totalUnread: number }> {
    return apiRequest('/conversations/unread-count');
  },

  async updateSettings(
    conversationId: string,
    data: { muted?: boolean; archived?: boolean },
  ): Promise<any> {
    return apiRequest(`/conversations/${conversationId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getAttachmentConfig(): Promise<{ maxFileSize: number; allowedMimeTypes: string[] }> {
    return apiRequest('/conversations/attachment-config');
  },

  async requestUploadUrl(
    conversationId: string,
    data: { fileName: string; mimeType: string; fileSize: number },
  ): Promise<UploadTarget> {
    return apiRequest(`/conversations/${conversationId}/attachments/upload-url`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async completeUpload(
    conversationId: string,
    attachmentId: string,
    data: { publicId: string; bytes?: number; clientMessageId?: string },
  ): Promise<{ message: MessageItem; deduped: boolean }> {
    return apiRequest(
      `/conversations/${conversationId}/attachments/${attachmentId}/complete`,
      { method: 'POST', body: JSON.stringify(data) },
    );
  },

  async getDownloadUrl(attachmentId: string): Promise<{
    url: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    expiresIn: number;
  }> {
    return apiRequest(`/attachments/${attachmentId}/download-url`);
  },
};
