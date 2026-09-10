import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AttachmentStatus, MessageType } from '@prisma/client';
import { MessageService } from './message.service';
import { AttachmentService } from './attachment.service';
import { MessagingRepository } from './messaging.repository';
import { MessagingBroadcaster } from './messaging-broadcaster';
import { PresenceService } from './presence.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { MAX_MESSAGE_LENGTH } from './dto/send-message.dto';
import { MAX_ATTACHMENT_SIZE } from './dto/upload-url.dto';
import { MESSAGING_ERRORS, OUTBOX_EVENTS } from './events/messaging-events';
import { buildSystemMetadata, renderSystemMessage } from './events/system-message.templates';

const CONVERSATION_ID = 'conv-1';
const BRAND_ID = 'user-brand';
const CREATOR_ID = 'user-creator';
const OUTSIDER_ID = 'user-outsider';

function messageRow(overrides: Record<string, any> = {}) {
  return {
    id: 'msg-1',
    conversationId: CONVERSATION_ID,
    senderId: CREATOR_ID,
    sender: { id: CREATOR_ID, name: 'Creator', email: 'c@z.io', role: 'INFLUENCER' },
    type: MessageType.TEXT,
    content: 'hello',
    metadata: null,
    systemEvent: null,
    clientMessageId: null,
    sequenceNumber: 1,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    attachments: [],
    ...overrides,
  } as any;
}

function attachmentRow(overrides: Record<string, any> = {}) {
  return {
    id: 'att-1',
    conversationId: CONVERSATION_ID,
    uploaderId: CREATOR_ID,
    messageId: null,
    objectKey: 'messages/conv-1/att-1/deck',
    publicId: 'messages/conv-1/att-1/deck',
    resourceType: 'raw',
    fileName: 'deck.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
    status: AttachmentStatus.AVAILABLE,
    createdAt: new Date(),
    ...overrides,
  } as any;
}

describe('Messaging', () => {
  let messageService: MessageService;
  let attachmentService: AttachmentService;
  let repository: jest.Mocked<Partial<MessagingRepository>>;
  let broadcaster: { emitToConversation: jest.Mock; emitToUser: jest.Mock };
  let fileUpload: { generateSignedUploadParams: jest.Mock; generateSignedDownloadUrl: jest.Mock };

  beforeEach(async () => {
    repository = {
      // Only the two real participants are members of the conversation.
      findParticipant: jest.fn(async (_c: string, userId: string) =>
        userId === BRAND_ID || userId === CREATOR_ID
          ? ({ conversationId: CONVERSATION_ID, userId, unreadCount: 0 } as any)
          : null,
      ),
      findParticipantUserIds: jest.fn(async () => [BRAND_ID, CREATOR_ID]),
      createMessageAtomic: jest.fn(async (input: any) => ({
        message: messageRow({
          senderId: input.senderId,
          sender: input.senderId ? messageRow().sender : null,
          type: input.type,
          content: input.content,
          metadata: input.metadata ?? null,
          systemEvent: input.systemEvent ?? null,
          clientMessageId: input.clientMessageId ?? null,
        }),
        deduped: false,
      })),
      findSystemMessageByClientId: jest.fn(async () => null),
      findAttachmentById: jest.fn(async () => attachmentRow()),
      findMessageById: jest.fn(async () => messageRow()),
      createAttachment: jest.fn(async () => attachmentRow({ status: AttachmentStatus.PENDING })),
      updateAttachment: jest.fn(async () => attachmentRow()),
      countUploadsSince: jest.fn(async () => 0),
      markRead: jest.fn(async () => ({
        lastReadMessageId: 'msg-1',
        lastReadAt: new Date(),
        unreadCount: 0,
      })),
      listMessages: jest.fn(async () => ({ items: [messageRow()], nextCursor: null, hasMore: false })),
      findMessagesAfterSequence: jest.fn(async () => [messageRow({ sequenceNumber: 2 })]),
    } as any;

    broadcaster = { emitToConversation: jest.fn(), emitToUser: jest.fn() };
    fileUpload = {
      generateSignedUploadParams: jest.fn(async () => ({
        cloudName: 'demo',
        apiKey: 'key',
        uploadUrl: 'https://api.cloudinary.com/v1_1/demo/raw/upload',
        resourceType: 'raw',
        params: { signature: 'sig' },
      })),
      generateSignedDownloadUrl: jest.fn(() => 'https://res.cloudinary.com/signed?expires_at=1'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        AttachmentService,
        PresenceService,
        { provide: MessagingRepository, useValue: repository },
        { provide: MessagingBroadcaster, useValue: broadcaster },
        { provide: FileUploadService, useValue: fileUpload },
      ],
    }).compile();

    messageService = module.get(MessageService);
    attachmentService = module.get(AttachmentService);
  });

  // ---------------------------------------------------------------- validation

  it('rejects an empty message with no attachment', async () => {
    await expect(
      messageService.sendMessage(CONVERSATION_ID, CREATOR_ID, { content: '   ' }),
    ).rejects.toThrow(MESSAGING_ERRORS.MESSAGE_EMPTY);
  });

  it('rejects a message longer than the limit', async () => {
    await expect(
      messageService.sendMessage(CONVERSATION_ID, CREATOR_ID, {
        content: 'x'.repeat(MAX_MESSAGE_LENGTH + 1),
      }),
    ).rejects.toThrow(MESSAGING_ERRORS.MESSAGE_TOO_LONG);
  });

  it('accepts a message exactly at the limit', async () => {
    const result = await messageService.sendMessage(CONVERSATION_ID, CREATOR_ID, {
      content: 'x'.repeat(MAX_MESSAGE_LENGTH),
    });
    expect(result.deduped).toBe(false);
  });

  // ---------------------------------------------------------------- authorization

  it('denies send, read, sync, upload and download to a non-participant', async () => {
    await expect(
      messageService.sendMessage(CONVERSATION_ID, OUTSIDER_ID, { content: 'hi' }),
    ).rejects.toThrow(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);

    await expect(messageService.markRead(CONVERSATION_ID, OUTSIDER_ID)).rejects.toThrow(
      ForbiddenException,
    );

    await expect(
      messageService.getMissedMessages(CONVERSATION_ID, OUTSIDER_ID, 0),
    ).rejects.toThrow(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);

    await expect(
      attachmentService.createUploadUrl(OUTSIDER_ID, CONVERSATION_ID, {
        fileName: 'a.pdf',
        mimeType: 'application/pdf',
        fileSize: 10,
      }),
    ).rejects.toThrow(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);

    await expect(attachmentService.getDownloadUrl(OUTSIDER_ID, 'att-1')).rejects.toThrow(
      MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED,
    );
  });

  it('derives senderId from the authenticated user, ignoring any payload claim', async () => {
    await messageService.sendMessage(CONVERSATION_ID, CREATOR_ID, {
      content: 'hi',
      // A malicious client tries to author as the brand.
      senderId: BRAND_ID,
    } as any);

    expect(repository.createMessageAtomic).toHaveBeenCalledWith(
      expect.objectContaining({ senderId: CREATOR_ID }),
    );
  });

  // ---------------------------------------------------------------- idempotency

  it('does not re-broadcast a deduped repeat send', async () => {
    (repository.createMessageAtomic as jest.Mock).mockResolvedValueOnce({
      message: messageRow({ clientMessageId: 'c-1' }),
      deduped: true,
    });

    const result = await messageService.sendMessage(CONVERSATION_ID, CREATOR_ID, {
      content: 'hi',
      clientMessageId: 'c-1',
    });

    expect(result.deduped).toBe(true);
    expect(broadcaster.emitToConversation).not.toHaveBeenCalled();
  });

  it('reuses an existing system message for a retried outbox event', async () => {
    (repository.findSystemMessageByClientId as jest.Mock).mockResolvedValueOnce(
      messageRow({ senderId: null, sender: null, type: MessageType.SYSTEM }),
    );

    const result = await messageService.createSystemMessage({
      conversationId: CONVERSATION_ID,
      text: 'Creator sent you a collaboration request.',
      systemEvent: OUTBOX_EVENTS.COLLABORATION_REQUEST_CREATED,
      metadata: {},
      clientMessageId: 'outbox:evt-1',
    });

    expect(result.deduped).toBe(true);
    expect(repository.createMessageAtomic).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------- fan-out

  it('broadcasts a new message and notifies only the recipient', async () => {
    await messageService.sendMessage(CONVERSATION_ID, CREATOR_ID, { content: 'hi' });

    expect(broadcaster.emitToConversation).toHaveBeenCalledWith(
      CONVERSATION_ID,
      'message:new',
      expect.objectContaining({ conversationId: CONVERSATION_ID }),
    );

    const notified = broadcaster.emitToUser.mock.calls
      .filter(([, event]) => event === 'notification:new')
      .map(([userId]) => userId);

    expect(notified).toEqual([BRAND_ID]);
  });

  it('zeroes the unread count on markRead and tells the peer', async () => {
    const result = await messageService.markRead(CONVERSATION_ID, BRAND_ID, 'msg-1');

    expect(result.unreadCount).toBe(0);
    expect(broadcaster.emitToConversation).toHaveBeenCalledWith(
      CONVERSATION_ID,
      'message:read',
      expect.objectContaining({ userId: BRAND_ID }),
    );
  });

  // ---------------------------------------------------------------- attachments

  it('rejects a file larger than 25 MB at signing time', async () => {
    await expect(
      attachmentService.createUploadUrl(CREATOR_ID, CONVERSATION_ID, {
        fileName: 'big.pdf',
        mimeType: 'application/pdf',
        fileSize: MAX_ATTACHMENT_SIZE + 1,
      }),
    ).rejects.toThrow(MESSAGING_ERRORS.FILE_TOO_LARGE);
  });

  it('rejects a disallowed MIME type', async () => {
    await expect(
      attachmentService.createUploadUrl(CREATOR_ID, CONVERSATION_ID, {
        fileName: 'run.exe',
        mimeType: 'application/x-msdownload',
        fileSize: 500,
      }),
    ).rejects.toThrow(MESSAGING_ERRORS.FILE_TYPE_NOT_ALLOWED);
  });

  it('blocks a file that under-reported its size at signing time', async () => {
    await expect(
      attachmentService.completeUpload(CREATOR_ID, 'att-1', {
        publicId: 'messages/conv-1/att-1/deck',
        bytes: MAX_ATTACHMENT_SIZE + 1,
      }),
    ).rejects.toThrow(MESSAGING_ERRORS.FILE_TOO_LARGE);

    expect(repository.updateAttachment).toHaveBeenCalledWith('att-1', {
      status: AttachmentStatus.BLOCKED,
    });
  });

  it('withholds a download URL unless the attachment is AVAILABLE', async () => {
    for (const status of [
      AttachmentStatus.PENDING,
      AttachmentStatus.SCANNING,
      AttachmentStatus.BLOCKED,
      AttachmentStatus.FAILED,
    ]) {
      (repository.findAttachmentById as jest.Mock).mockResolvedValueOnce(
        attachmentRow({ status }),
      );
      await expect(attachmentService.getDownloadUrl(CREATOR_ID, 'att-1')).rejects.toThrow(
        MESSAGING_ERRORS.ATTACHMENT_NOT_AVAILABLE,
      );
    }
  });

  it('issues a short-lived signed URL for an available attachment', async () => {
    const result = await attachmentService.getDownloadUrl(BRAND_ID, 'att-1');

    expect(result.expiresIn).toBe(300);
    expect(fileUpload.generateSignedDownloadUrl).toHaveBeenCalledWith(
      expect.objectContaining({ expiresInSeconds: 300, attachment: true }),
    );
  });

  it('404s an unknown attachment', async () => {
    (repository.findAttachmentById as jest.Mock).mockResolvedValueOnce(null);
    await expect(attachmentService.getDownloadUrl(BRAND_ID, 'nope')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('types an image attachment message as IMAGE', async () => {
    (repository.findAttachmentById as jest.Mock).mockResolvedValueOnce(
      attachmentRow({ mimeType: 'image/png', fileName: 'shot.png' }),
    );

    await messageService.sendMessage(CONVERSATION_ID, CREATOR_ID, {
      content: '',
      attachmentId: 'att-1',
    });

    expect(repository.createMessageAtomic).toHaveBeenCalledWith(
      expect.objectContaining({ type: MessageType.IMAGE }),
    );
  });

  it('refuses to attach a file uploaded by someone else', async () => {
    (repository.findAttachmentById as jest.Mock).mockResolvedValueOnce(
      attachmentRow({ uploaderId: BRAND_ID }),
    );

    await expect(
      messageService.sendMessage(CONVERSATION_ID, CREATOR_ID, {
        content: '',
        attachmentId: 'att-1',
      }),
    ).rejects.toThrow(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
  });

  // ---------------------------------------------------------------- system messages

  it('renders a template and metadata for every application lifecycle event', () => {
    const payload = {
      applicationId: 'app-1',
      campaignId: 'camp-1',
      campaignTitle: 'Summer Launch',
      brandUserId: BRAND_ID,
      brandName: 'Acme',
      influencerUserId: CREATOR_ID,
      influencerName: 'Nova',
      actor: 'BRAND' as const,
    };

    for (const eventType of Object.values(OUTBOX_EVENTS)) {
      const rendered = renderSystemMessage(eventType, payload);
      expect(rendered).not.toBeNull();
      expect(rendered!.text.length).toBeGreaterThan(0);

      const metadata = buildSystemMetadata(eventType, payload, rendered!.messageKey) as any;
      expect(metadata.systemEvent).toBe(eventType);
      expect(metadata.applicationId).toBe('app-1');
    }
  });

  it('returns null for an unknown event type rather than inventing copy', () => {
    expect(renderSystemMessage('NOT_A_REAL_EVENT', {} as any)).toBeNull();
  });

  it('persists a system message with a null sender and structured metadata', async () => {
    await messageService.createSystemMessage({
      conversationId: CONVERSATION_ID,
      text: 'Acme shortlisted you.',
      systemEvent: OUTBOX_EVENTS.COLLABORATION_REQUEST_SHORTLISTED,
      metadata: { systemEvent: OUTBOX_EVENTS.COLLABORATION_REQUEST_SHORTLISTED },
      clientMessageId: 'outbox:evt-2',
    });

    expect(repository.createMessageAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        senderId: null,
        type: MessageType.SYSTEM,
        systemEvent: OUTBOX_EVENTS.COLLABORATION_REQUEST_SHORTLISTED,
      }),
    );
  });

  // ---------------------------------------------------------------- wire format

  it('never leaks storage keys in the message DTO', () => {
    const dto = messageService.toDto(
      messageRow({
        attachments: [
          {
            id: 'att-1',
            fileName: 'deck.pdf',
            mimeType: 'application/pdf',
            fileSize: 10,
            status: AttachmentStatus.AVAILABLE,
            createdAt: new Date(),
          },
        ],
      }),
    );

    const serialized = JSON.stringify(dto);
    expect(serialized).not.toContain('objectKey');
    expect(serialized).not.toContain('publicId');
    expect(dto.attachments[0].fileName).toBe('deck.pdf');
  });
});

describe('PresenceService', () => {
  let presence: PresenceService;

  beforeEach(() => {
    presence = new PresenceService();
  });

  it('tracks a user as online until every socket disconnects', () => {
    presence.setOnline(CREATOR_ID, 'socket-a');
    presence.setOnline(CREATOR_ID, 'socket-b');
    expect(presence.isOnline(CREATOR_ID)).toBe(true);

    presence.setOffline(CREATOR_ID, 'socket-a');
    expect(presence.isOnline(CREATOR_ID)).toBe(true);

    presence.setOffline(CREATOR_ID, 'socket-b');
    expect(presence.isOnline(CREATOR_ID)).toBe(false);
    expect(presence.getLastSeen(CREATOR_ID)).toBeInstanceOf(Date);
  });

  it('expires typing state instead of leaving it stuck on', () => {
    jest.useFakeTimers();
    try {
      presence.startTyping(CONVERSATION_ID, CREATOR_ID);
      expect(presence.isTyping(CONVERSATION_ID, CREATOR_ID)).toBe(true);

      jest.advanceTimersByTime(5000);
      expect(presence.isTyping(CONVERSATION_ID, CREATOR_ID)).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });
});
