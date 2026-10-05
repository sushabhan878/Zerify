'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageItem, MessagingService } from '@/services/messaging.service';

export function newClientMessageId(): string {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Newest-last ordering, de-duplicated by id. */
function mergeMessages(existing: MessageItem[], incoming: MessageItem[]): MessageItem[] {
  const byId = new Map<string, MessageItem>();
  for (const message of existing) byId.set(message.id, message);
  for (const message of incoming) {
    const previous = byId.get(message.id);
    byId.set(message.id, previous ? { ...previous, ...message } : message);
  }
  return Array.from(byId.values()).sort((a, b) => a.sequenceNumber - b.sequenceNumber);
}

export interface UseConversationMessages {
  messages: MessageItem[];
  loading: boolean;
  loadingOlder: boolean;
  hasMore: boolean;
  highestSequence: number;
  loadOlder: () => Promise<void>;
  applyIncoming: (message: MessageItem) => void;
  addOptimistic: (message: MessageItem) => void;
  ackOptimistic: (clientMessageId: string, patch: Partial<MessageItem>) => void;
  failOptimistic: (clientMessageId: string) => void;
  markAllRead: () => void;
}

/**
 * Per-conversation message state. Optimistic sends are keyed by
 * `clientMessageId` and replaced on ack rather than appended, so a message
 * never renders twice (PRD §52).
 */
export function useConversationMessages(conversationId: string | null): UseConversationMessages {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const cursor = useRef<number | null>(null);
  const activeId = useRef<string | null>(null);

  useEffect(() => {
    activeId.current = conversationId;
    cursor.current = null;
    setMessages([]);
    setHasMore(false);

    if (!conversationId) return;

    let cancelled = false;
    setLoading(true);

    MessagingService.getMessages(conversationId)
      .then((page) => {
        if (cancelled || activeId.current !== conversationId) return;
        setMessages(page.items);
        cursor.current = typeof page.nextCursor === 'number' ? page.nextCursor : null;
        setHasMore(page.hasMore);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const loadOlder = useCallback(async () => {
    if (!conversationId || !hasMore || cursor.current == null || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await MessagingService.getMessages(conversationId, cursor.current);
      if (activeId.current !== conversationId) return;
      setMessages((prev) => mergeMessages(prev, page.items));
      cursor.current = typeof page.nextCursor === 'number' ? page.nextCursor : null;
      setHasMore(page.hasMore);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasMore, loadingOlder]);

  const applyIncoming = useCallback((message: MessageItem) => {
    setMessages((prev) => {
      // A server echo of our own optimistic message replaces the temp row.
      if (message.clientMessageId) {
        const tempIndex = prev.findIndex(
          (m) => m.clientMessageId === message.clientMessageId && m.id.startsWith('temp_'),
        );
        if (tempIndex >= 0) {
          const next = [...prev];
          next[tempIndex] = { ...message, deliveryState: 'SENT' };
          return next.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        }
      }
      return mergeMessages(prev, [message]);
    });
  }, []);

  const addOptimistic = useCallback((message: MessageItem) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const ackOptimistic = useCallback((clientMessageId: string, patch: Partial<MessageItem>) => {
    setMessages((prev) => {
      const next = prev.map((m) =>
        m.clientMessageId === clientMessageId ? { ...m, ...patch } : m,
      );
      return next.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    });
  }, []);

  const failOptimistic = useCallback((clientMessageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.clientMessageId === clientMessageId ? { ...m, deliveryState: 'FAILED' } : m,
      ),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setMessages((prev) =>
      prev.map((m) => (m.deliveryState === 'SENT' ? { ...m, deliveryState: 'READ' } : m)),
    );
  }, []);

  const highestSequence = messages.reduce((max, m) => Math.max(max, m.sequenceNumber || 0), 0);

  return {
    messages,
    loading,
    loadingOlder,
    hasMore,
    highestSequence,
    loadOlder,
    applyIncoming,
    addOptimistic,
    ackOptimistic,
    failOptimistic,
    markAllRead,
  };
}
