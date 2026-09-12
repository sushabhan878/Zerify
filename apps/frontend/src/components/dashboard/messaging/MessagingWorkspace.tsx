'use client';

import React, { useMemo, useState } from 'react';
import { useMessaging } from '@/context/MessagingContext';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';
import ConversationSidebar, { ConversationFilter } from './ConversationSidebar';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import FileUploadProgress from './FileUploadProgress';
import EmptyConversationState from './EmptyConversationState';

/**
 * Role-agnostic Messages workspace. Both dashboards render this; the role only
 * changes the header copy and the empty-state wording.
 */
export default function MessagingWorkspace({ role }: { role: 'BRAND' | 'INFLUENCER' }) {
  const {
    currentUserId,
    conversations,
    conversationsLoading,
    activeConversationId,
    setActiveConversationId,
    messages,
    messagesLoading,
    hasMoreMessages,
    loadOlderMessages,
    sendMessage,
    retryMessage,
    sendTyping,
    typingPeers,
    presence,
    registerAttachmentMessage,
    searchQuery,
    setSearchQuery,
  } = useMessaging();

  const [filter, setFilter] = useState<ConversationFilter>('ALL');

  const { upload, start, cancel } = useAttachmentUpload(
    activeConversationId,
    registerAttachmentMessage,
  );

  const counts = useMemo(
    () => ({
      ALL: conversations.length,
      UNREAD: conversations.filter((c) => (c.unreadCount || 0) > 0).length,
      CAMPAIGN: conversations.filter((c) => Boolean(c.campaign)).length,
    }),
    [conversations],
  );

  const visible = useMemo(() => {
    let list = conversations;
    if (filter === 'UNREAD') list = list.filter((c) => (c.unreadCount || 0) > 0);
    else if (filter === 'CAMPAIGN') list = list.filter((c) => Boolean(c.campaign));

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.counterpart?.name?.toLowerCase().includes(q) ||
          c.campaign?.title?.toLowerCase().includes(q) ||
          c.lastMessage?.content?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [conversations, filter, searchQuery]);

  const active = conversations.find((c) => c.id === activeConversationId) ?? null;
  const counterpartId = active?.counterpart?.userId;
  const peer = counterpartId ? presence[counterpartId] : undefined;
  const typingName =
    counterpartId && typingPeers[counterpartId] ? active?.counterpart?.name ?? 'They' : null;

  return (
    <div className="h-[calc(100vh-95px)] min-h-[640px] md:min-h-[700px] w-full rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row overflow-hidden shadow-xl shadow-purple-950/10">
      <div className={`${active ? 'hidden md:flex' : 'flex'} min-h-0`}>
        <ConversationSidebar
          conversations={visible}
          loading={conversationsLoading}
          activeId={activeConversationId}
          presence={presence}
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onSelect={setActiveConversationId}
        />
      </div>

      <div className="flex-1 flex flex-col justify-between bg-slate-950/30 min-h-0">
        {active ? (
          <>
            <ConversationHeader
              conversation={active}
              online={Boolean(peer?.online)}
              lastSeen={peer?.lastSeen ?? null}
              onBack={() => setActiveConversationId(null)}
            />

            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              loading={messagesLoading}
              hasMore={hasMoreMessages}
              onLoadOlder={loadOlderMessages}
              onRetry={retryMessage}
              typingName={typingName}
            />

            {upload && <FileUploadProgress upload={upload} onCancel={cancel} />}

            <MessageComposer
              disabled={false}
              uploading={Boolean(upload && !upload.error)}
              onSend={sendMessage}
              onTyping={sendTyping}
              onPickFile={start}
            />
          </>
        ) : (
          <EmptyConversationState role={role} />
        )}
      </div>
    </div>
  );
}
