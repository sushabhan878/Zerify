import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttachmentStatus } from '@prisma/client';
import { MessagingRepository } from './messaging.repository';
import { MessageService } from './message.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { CompleteUploadDto, MAX_ATTACHMENT_SIZE, UploadUrlDto } from './dto/upload-url.dto';
import { MESSAGING_ERRORS } from './events/messaging-events';

/**
 * MIME allowlist (PRD §25). Exported so it can be tuned in one place — the
 * upload endpoint and the frontend pre-check both read from this list.
 */
export const ALLOWED_MIME_TYPES: readonly string[] = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  // Media
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
];

/** Uploads per user per minute (PRD §69). */
const UPLOAD_RATE_LIMIT = 20;

@Injectable()
export class AttachmentService {
  private readonly logger = new Logger(AttachmentService.name);

  constructor(
    private readonly repository: MessagingRepository,
    private readonly messageService: MessageService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Issues a signed Cloudinary upload target. The file never transits our
   * server; we only record intent and validate the declared metadata.
   */
  async createUploadUrl(userId: string, conversationId: string, dto: UploadUrlDto) {
    const participant = await this.repository.findParticipant(conversationId, userId);
    if (!participant) {
      throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
    }

    if (dto.fileSize > MAX_ATTACHMENT_SIZE) {
      throw new BadRequestException(MESSAGING_ERRORS.FILE_TOO_LARGE);
    }
    if (dto.fileSize <= 0) {
      throw new BadRequestException(MESSAGING_ERRORS.FILE_TOO_LARGE);
    }

    const mimeType = dto.mimeType.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException(MESSAGING_ERRORS.FILE_TYPE_NOT_ALLOWED);
    }

    const oneMinuteAgo = new Date(Date.now() - 60_000);
    const recentUploads = await this.repository.countUploadsSince(userId, oneMinuteAgo);
    if (recentUploads >= UPLOAD_RATE_LIMIT) {
      throw new BadRequestException(MESSAGING_ERRORS.RATE_LIMITED);
    }

    const safeName = this.sanitizeFileName(dto.fileName);
    const resourceType = mimeType.startsWith('image/')
      ? 'image'
      : mimeType.startsWith('video/') || mimeType.startsWith('audio/')
        ? 'video'
        : 'raw';

    const attachment = await this.repository.createAttachment({
      conversationId,
      uploaderId: userId,
      objectKey: '',
      fileName: safeName,
      mimeType,
      fileSize: dto.fileSize,
      resourceType,
    });

    const folder = `messages/${conversationId}/${attachment.id}`;
    const publicId = this.stripExtension(safeName) || 'attachment';
    const objectKey = `${folder}/${publicId}`;

    await this.repository.updateAttachment(attachment.id, { publicId: objectKey });

    const signed = await this.fileUploadService.generateSignedUploadParams({
      folder,
      publicId,
      resourceType: resourceType as 'image' | 'video' | 'raw',
    });

    return {
      attachmentId: attachment.id,
      objectKey,
      maxFileSize: MAX_ATTACHMENT_SIZE,
      upload: signed,
    };
  }

  /**
   * Confirms a finished upload and publishes the file message.
   * The size is re-checked here so a client cannot under-report at signing time.
   */
  async completeUpload(userId: string, attachmentId: string, dto: CompleteUploadDto) {
    const attachment = await this.repository.findAttachmentById(attachmentId);
    if (!attachment) {
      throw new NotFoundException(MESSAGING_ERRORS.ATTACHMENT_NOT_FOUND);
    }
    if (attachment.uploaderId !== userId) {
      throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
    }

    const participant = await this.repository.findParticipant(attachment.conversationId, userId);
    if (!participant) {
      throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
    }

    if (attachment.messageId) {
      // Already completed — return the existing message rather than duplicating.
      const existing = await this.repository.findMessageById(attachment.messageId);
      if (existing) {
        return { message: this.messageService.toDto(existing), deduped: true };
      }
    }

    const actualSize = dto.bytes ?? attachment.fileSize;
    if (actualSize > MAX_ATTACHMENT_SIZE) {
      await this.repository.updateAttachment(attachmentId, { status: AttachmentStatus.BLOCKED });
      throw new BadRequestException(MESSAGING_ERRORS.FILE_TOO_LARGE);
    }

    await this.repository.updateAttachment(attachmentId, {
      status: AttachmentStatus.AVAILABLE,
      publicId: dto.publicId,
      fileSize: actualSize,
    });

    return this.messageService.sendMessage(attachment.conversationId, userId, {
      content: '',
      attachmentId,
      clientMessageId: dto.clientMessageId,
    });
  }

  /**
   * Short-lived signed URL for a private asset. Requires conversation
   * membership, so a leaked attachment id alone grants nothing.
   */
  async getDownloadUrl(userId: string, attachmentId: string) {
    const attachment = await this.repository.findAttachmentById(attachmentId);
    if (!attachment) {
      throw new NotFoundException(MESSAGING_ERRORS.ATTACHMENT_NOT_FOUND);
    }

    const participant = await this.repository.findParticipant(attachment.conversationId, userId);
    if (!participant) {
      throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
    }

    // PENDING / SCANNING / BLOCKED / FAILED are all withheld. A malware scanner
    // can be inserted later with no schema or API change.
    if (attachment.status !== AttachmentStatus.AVAILABLE) {
      throw new ForbiddenException(MESSAGING_ERRORS.ATTACHMENT_NOT_AVAILABLE);
    }

    const expiresInSeconds = 300;
    const url = this.fileUploadService.generateSignedDownloadUrl({
      publicId: attachment.publicId || attachment.objectKey,
      resourceType: attachment.resourceType,
      format: this.extensionOf(attachment.fileName),
      expiresInSeconds,
      attachment: !attachment.mimeType.startsWith('image/'),
    });

    return {
      url,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      expiresIn: expiresInSeconds,
    };
  }

  /** Strips paths and unsafe characters so the name is safe as a storage key. */
  private sanitizeFileName(fileName: string): string {
    const base = fileName.split(/[\\/]/).pop() || 'file';
    return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
  }

  private stripExtension(fileName: string): string {
    const idx = fileName.lastIndexOf('.');
    return idx > 0 ? fileName.slice(0, idx) : fileName;
  }

  private extensionOf(fileName: string): string | undefined {
    const idx = fileName.lastIndexOf('.');
    if (idx <= 0 || idx === fileName.length - 1) return undefined;
    return fileName.slice(idx + 1).toLowerCase();
  }
}
