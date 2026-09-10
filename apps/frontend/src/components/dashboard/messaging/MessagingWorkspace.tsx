'use client';

import React, { useMemo, useState } from 'react';
import { useMessaging } from '@/context/MessagingContext';
import { useAttachmentUpload } from '@/hooks/useAttachmentUpload';
import ConversationSidebar from './ConversationSidebar';
import ConversationHeader from './ConversationHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import FileUploadProgress from './FileUploadProgress';
import EmptyConversationState from './EmptyConversationState';
import MessagingToolbar, { ConversationFilter } from './MessagingToolbar';

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
    connectionStatus,
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
    if (filter === 'UNREAD') return conversations.filter((c) => (c.unreadCount || 0) > 0);
    if (filter === 'CAMPAIGN') return conversations.filter((c) => Boolean(c.campaign));
    return conversations;
  }, [conversations, filter]);

  const active = conversations.find((c) => c.id === activeConversationId) ?? null;
  const counterpartId = active?.counterpart?.userId;
  const peer = counterpartId ? presence[counterpartId] : undefined;
  const typingName =
    counterpartId && typingPeers[counterpartId] ? active?.counterpart?.name ?? 'They' : null;

  return (
    <div className="space-y-5">
      <MessagingToolbar
        role={role}
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        connectionStatus={connectionStatus}
      />

      <div className="h-[calc(100vh-260px)] min-h-[520px] rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row overflow-hidden shadow-xl shadow-purple-950/10">
        <div className={`${active ? 'hidden md:flex' : 'flex'} min-h-0`}>
          <ConversationSidebar
            conversations={visible}
            loading={conversationsLoading}
            activeId={activeConversationId}
            presence={presence}
            filter={filter}
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
    </div>
  );
}
