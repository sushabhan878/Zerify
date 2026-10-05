'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ConversationItem,
  MessageItem,
  MessagingService,
} from '@/services/messaging.service';
import { ConnectionStatus, useMessagingSocket } from '@/hooks/useMessagingSocket';
import {
  newClientMessageId,
  useConversationMessages,
} from '@/hooks/useConversationMessages';
import { useToast } from '@/components/ui/Toast';

export interface PeerPresence {
  online: boolean;
  lastSeen: string | null;
}

interface MessagingContextValue {
  currentUserId: string | null;
  conversations: ConversationItem[];
  conversationsLoading: boolean;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: MessageItem[];
  messagesLoading: boolean;
  hasMoreMessages: boolean;
  loadOlderMessages: () => Promise<void>;
  sendMessage: (content: string) => void;
  retryMessage: (clientMessageId: string) => void;
  sendTyping: (typing: boolean) => void;
  typingPeers: Record<string, boolean>;
  presence: Record<string, PeerPresence>;
  totalUnread: number;
  connectionStatus: ConnectionStatus;
  refreshConversations: () => Promise<void>;
  registerAttachmentMessage: (message: MessageItem) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const MessagingContext = createContext<MessagingContextValue | null>(null);

const WS = {
  JOIN: 'conversation:join',
  LEAVE: 'conversation:leave',
  SEND: 'message:send',
  READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  SYNC: 'sync:missed',
  PRESENCE_QUERY: 'presence:query',
};

/** Error codes worth interrupting the user for; the rest stay silent. */
const LOUD_ERRORS: Record<string, string> = {
  CONVERSATION_ACCESS_DENIED: 'You no longer have access to that conversation.',
  RATE_LIMITED: 'Slow down a moment — too many messages sent.',
  MESSAGE_TOO_LONG: 'That message is too long to send.',
  FILE_TOO_LARGE: 'That file is over the 25 MB limit.',
  FILE_TYPE_NOT_ALLOWED: 'That file type is not allowed.',
  ATTACHMENT_NOT_AVAILABLE: 'That attachment is not ready yet.',
};

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveId] = useState<string | null>(null);
  const [typingPeers, setTypingPeers] = useState<Record<string, boolean>>({});
  const [presence, setPresence] = useState<Record<string, PeerPresence>>({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const activeRef = useRef<string | null>(null);
  const lastTypingSent = useRef(0);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('zerify_user');
      if (raw) setCurrentUserId(JSON.parse(raw)?.id ?? null);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  const { connectionStatus, on, emit } = useMessagingSocket(Boolean(currentUserId));
  const store = useConversationMessages(activeConversationId);

  const refreshConversations = useCallback(async () => {
    try {
      const page = await MessagingService.listConversations();
      setConversations(page.items);
      setTotalUnread(page.items.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
    } catch {
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    refreshConversations();
  }, [currentUserId, refreshConversations]);

  // Server-side search when a query is present, local list otherwise.
  useEffect(() => {
    const q = searchQuery.trim();
    if (!currentUserId) return;
    if (!q) {
      refreshConversations();
      return;
    }
    const timer = setTimeout(() => {
      MessagingService.searchConversations(q)
        .then((page) => setConversations(page.items))
        .catch(() => undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId, refreshConversations]);

  const setActiveConversationId = useCallback(
    (id: string | null) => {
      const previous = activeRef.current;
      if (previous && previous !== id) emit(WS.LEAVE, { conversationId: previous });
      activeRef.current = id;
      setActiveId(id);
      if (!id) return;

      emit(WS.JOIN, { conversationId: id });
      emit(WS.READ, { conversationId: id });
      MessagingService.markRead(id).catch(() => undefined);

      // Zero the badge locally; the server has already reset the counter.
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c));
        setTotalUnread(next.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
        return next;
      });
    },
    [emit],
  );

  // ------------------------------------------------------------------ socket wiring

  useEffect(() => {
    const offs = [
      on('connected', (p: any) => {
        if (typeof p?.totalUnread === 'number') setTotalUnread(p.totalUnread);
        const active = activeRef.current;
        if (active) emit(WS.JOIN, { conversationId: active });
      }),

      on('message:new', (p: any) => {
        const message: MessageItem = p?.message;
        if (!message) return;
        if (message.conversationId === activeRef.current) {
          store.applyIncoming({ ...message, deliveryState: 'SENT' });
          emit(WS.READ, { conversationId: message.conversationId });
        }
      }),

      on('message:ack', (p: any) => {
        if (!p?.clientMessageId) return;
        store.ackOptimistic(p.clientMessageId, {
          id: p.messageId,
          sequenceNumber: p.sequenceNumber,
          deliveryState: 'SENT',
        });
      }),

      on('message:failed', (p: any) => {
        if (p?.clientMessageId) store.failOptimistic(p.clientMessageId);
        const copy = p?.code ? LOUD_ERRORS[p.code] : null;
        if (copy) toast({ type: 'error', message: copy });
      }),

      on('message:read', (p: any) => {
        if (p?.conversationId === activeRef.current && p?.userId !== currentUserId) {
          store.markAllRead();
        }
      }),

      on('conversation:updated', (p: any) => {
        if (!p?.conversationId) return;
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === p.conversationId);
          if (index < 0) {
            refreshConversations();
            return prev;
          }
          const isActive = p.conversationId === activeRef.current;
          const updated: ConversationItem = {
            ...prev[index],
            lastMessage: p.lastMessage ?? prev[index].lastMessage,
            lastMessageAt: p.lastMessageAt ?? prev[index].lastMessageAt,
            unreadCount:
              p.incrementUnread && !isActive
                ? (prev[index].unreadCount || 0) + 1
                : isActive
                  ? 0
                  : (p.unreadCount ?? prev[index].unreadCount),
          };
          const next = [updated, ...prev.filter((_, i) => i !== index)];
          setTotalUnread(next.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
          return next;
        });
      }),

      on('typing:start', (p: any) => {
        if (p?.conversationId === activeRef.current && p?.userId !== currentUserId) {
          setTypingPeers((prev) => ({ ...prev, [p.userId]: true }));
        }
      }),

      on('typing:stop', (p: any) => {
        if (p?.userId) setTypingPeers((prev) => ({ ...prev, [p.userId]: false }));
      }),

      // The gateway always sends a batch: { users: [{ userId, online, lastSeen }] }.
      on('presence:update', (p: any) => {
        const users = Array.isArray(p?.users) ? p.users : [];
        if (users.length === 0) return;
        setPresence((prev) => {
          const next = { ...prev };
          for (const entry of users) {
            if (!entry?.userId) continue;
            next[entry.userId] = {
              online: Boolean(entry.online),
              lastSeen: entry.lastSeen ?? null,
            };
          }
          return next;
        });
      }),

      // Sidebar toast for a message in a conversation the user is not reading.
      on('notification:new', (p: any) => {
        if (!p?.conversationId || p.conversationId === activeRef.current) return;
        toast({
          type: 'info',
          title: p.senderName ? `New message from ${p.senderName}` : 'New message',
          message: p.preview || 'You have a new message.',
        });
      }),

      on('messaging:error', (p: any) => {
        const copy = p?.code ? LOUD_ERRORS[p.code] : null;
        if (copy) toast({ type: 'error', message: copy });
      }),

      on('sync:result', (p: any) => {
        for (const message of p?.messages ?? []) {
          if (message.conversationId === activeRef.current) store.applyIncoming(message);
        }
      }),
    ];

    return () => offs.forEach((off) => off());
  }, [on, emit, store, currentUserId, refreshConversations, toast]);

  // Presence is per-socket in-memory on the server, so it has to be asked for:
  // nothing is pushed for peers who were already online before we connected.
  useEffect(() => {
    if (connectionStatus !== 'CONNECTED') return;
    const userIds = conversations
      .map((c) => c.counterpart?.userId)
      .filter((id): id is string => Boolean(id));
    if (userIds.length > 0) emit(WS.PRESENCE_QUERY, { userIds });
  }, [connectionStatus, conversations, emit]);

  // On reconnect, re-join and pull anything missed while offline (PRD §49–50).
  const wasConnected = useRef(false);
  useEffect(() => {
    if (connectionStatus === 'CONNECTED') {
      if (wasConnected.current && activeRef.current) {
        emit(WS.JOIN, { conversationId: activeRef.current });
        emit(WS.SYNC, {
          conversationId: activeRef.current,
          afterSequence: store.highestSequence,
        });
        refreshConversations();
      }
      wasConnected.current = true;
    }
  }, [connectionStatus, emit, store.highestSequence, refreshConversations]);

  // ------------------------------------------------------------------ actions

  const dispatchSend = useCallback(
    (conversationId: string, content: string, clientMessageId: string) => {
      if (connectionStatus === 'CONNECTED') {
        emit(WS.SEND, { conversationId, content, clientMessageId });
        return;
      }
      // Socket down — fall back to REST so the message still lands (PRD §44).
      MessagingService.sendMessage(conversationId, { content, clientMessageId })
        .then((res) => {
          store.ackOptimistic(clientMessageId, {
            id: res.message.id,
            sequenceNumber: res.message.sequenceNumber,
            deliveryState: 'SENT',
          });
        })
        .catch(() => store.failOptimistic(clientMessageId));
    },
    [connectionStatus, emit, store],
  );

  const sendMessage = useCallback(
    (content: string) => {
      const conversationId = activeRef.current;
      const trimmed = content.trim();
      if (!conversationId || !trimmed || !currentUserId) return;

      const clientMessageId = newClientMessageId();
      store.addOptimistic({
        id: `temp_${clientMessageId}`,
        conversationId,
        senderId: currentUserId,
        sender: { id: currentUserId, name: 'You', role: 'USER' },
        type: 'TEXT',
        content: trimmed,
        clientMessageId,
        sequenceNumber: Number.MAX_SAFE_INTEGER,
        createdAt: new Date().toISOString(),
        attachments: [],
        deliveryState: 'SENDING',
      });

      dispatchSend(conversationId, trimmed, clientMessageId);
    },
    [currentUserId, store, dispatchSend],
  );

  /** Retries with the same clientMessageId so the server dedupes it. */
  const retryMessage = useCallback(
    (clientMessageId: string) => {
      const conversationId = activeRef.current;
      const target = store.messages.find((m) => m.clientMessageId === clientMessageId);
      if (!conversationId || !target?.content) return;
      store.ackOptimistic(clientMessageId, { deliveryState: 'SENDING' });
      dispatchSend(conversationId, target.content, clientMessageId);
    },
    [store, dispatchSend],
  );

  const sendTyping = useCallback(
    (typing: boolean) => {
      const conversationId = activeRef.current;
      if (!conversationId) return;
      if (!typing) {
        emit(WS.TYPING_STOP, { conversationId });
        return;
      }
      // Throttle so a fast typist emits ~1 event/sec, not one per keystroke.
      const now = Date.now();
      if (now - lastTypingSent.current < 1000) return;
      lastTypingSent.current = now;
      emit(WS.TYPING_START, { conversationId });
    },
    [emit],
  );

  const registerAttachmentMessage = useCallback(
    (message: MessageItem) => {
      if (message.conversationId === activeRef.current) {
        store.applyIncoming({ ...message, deliveryState: 'SENT' });
      }
    },
    [store],
  );

  const value = useMemo<MessagingContextValue>(
    () => ({
      currentUserId,
      conversations,
      conversationsLoading,
      activeConversationId,
      setActiveConversationId,
      messages: store.messages,
      messagesLoading: store.loading,
      hasMoreMessages: store.hasMore,
      loadOlderMessages: store.loadOlder,
      sendMessage,
      retryMessage,
      sendTyping,
      typingPeers,
      presence,
      totalUnread,
      connectionStatus,
      refreshConversations,
      registerAttachmentMessage,
      searchQuery,
      setSearchQuery,
    }),
    [
      currentUserId,
      conversations,
      conversationsLoading,
      activeConversationId,
      setActiveConversationId,
      store.messages,
      store.loading,
      store.hasMore,
      store.loadOlder,
      sendMessage,
      retryMessage,
      sendTyping,
      typingPeers,
      presence,
      totalUnread,
      connectionStatus,
      refreshConversations,
      registerAttachmentMessage,
      searchQuery,
    ],
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessaging(): MessagingContextValue {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used inside a MessagingProvider');
  return ctx;
}

/** Safe variant for the sidebar badge, which may render outside the provider. */
export function useMessagingUnread(): number {
  return useContext(MessagingContext)?.totalUnread ?? 0;
}
