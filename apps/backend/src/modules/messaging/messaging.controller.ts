import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationParticipantGuard } from './guards/conversation-participant.guard';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { AttachmentService, ALLOWED_MIME_TYPES } from './attachment.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto, UpdateConversationSettingsDto } from './dto/mark-read.dto';
import {
  ListConversationsQueryDto,
  ListMessagesQueryDto,
  SearchConversationsQueryDto,
} from './dto/list-messages-query.dto';
import { CompleteUploadDto, MAX_ATTACHMENT_SIZE, UploadUrlDto } from './dto/upload-url.dto';

/**
 * REST surface for messaging. The WebSocket gateway is the primary transport;
 * these endpoints cover history loading, attachments, and a send fallback for
 * when the socket is down (PRD §44).
 */
@ApiTags('messaging')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagingController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly attachmentService: AttachmentService,
  ) {}

  // ---------------------------------------------------------------- conversations

  @Post('conversations')
  @ApiOperation({ summary: 'Find or create a 1:1 conversation with another user' })
  async createConversation(@Req() req: any, @Body() dto: CreateConversationDto) {
    const { conversation, created } = await this.conversationService.findOrCreateDirect(
      req.user.id,
      dto,
    );

    if (dto.initialMessage?.trim()) {
      await this.messageService.sendMessage(conversation.id, req.user.id, {
        content: dto.initialMessage,
      });
    }

    return { conversationId: conversation.id, created };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List the current user conversations, newest activity first' })
  async listConversations(@Req() req: any, @Query() query: ListConversationsQueryDto) {
    return this.conversationService.listForUser(req.user.id, query);
  }

  @Get('conversations/search')
  @ApiOperation({ summary: 'Search conversations by counterpart name, brand or handle' })
  async searchConversations(@Req() req: any, @Query() query: SearchConversationsQueryDto) {
    return this.conversationService.listForUser(req.user.id, { search: query.q });
  }

  @Get('conversations/unread-count')
  @ApiOperation({ summary: 'Total unread messages across all conversations' })
  async getUnreadCount(@Req() req: any) {
    return this.conversationService.getTotalUnread(req.user.id);
  }

  @Get('conversations/attachment-config')
  @ApiOperation({ summary: 'Attachment limits and accepted MIME types' })
  getAttachmentConfig() {
    return { maxFileSize: MAX_ATTACHMENT_SIZE, allowedMimeTypes: ALLOWED_MIME_TYPES };
  }

  @Get('conversations/:conversationId')
  @UseGuards(ConversationParticipantGuard)
  @ApiOperation({ summary: 'Get one conversation' })
  async getConversation(@Req() req: any, @Param('conversationId') conversationId: string) {
    return this.conversationService.getById(conversationId, req.user.id);
  }

  @Patch('conversations/:conversationId/settings')
  @UseGuards(ConversationParticipantGuard)
  @ApiOperation({ summary: 'Mute or archive a conversation for the current user' })
  async updateSettings(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
    @Body() dto: UpdateConversationSettingsDto,
  ) {
    return this.conversationService.updateSettings(conversationId, req.user.id, dto);
  }

  // ---------------------------------------------------------------- messages

  @Get('conversations/:conversationId/messages')
  @UseGuards(ConversationParticipantGuard)
  @ApiOperation({ summary: 'Cursor-paginated message history, oldest-to-newest within a page' })
  async listMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: ListMessagesQueryDto,
  ) {
    return this.messageService.listMessages(conversationId, query);
  }

  @Post('conversations/:conversationId/messages')
  @UseGuards(ConversationParticipantGuard)
  @ApiOperation({ summary: 'Send a message over HTTP (fallback when the socket is unavailable)' })
  async sendMessage(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messageService.sendMessage(conversationId, req.user.id, dto);
  }

  @Post('conversations/:conversationId/read')
  @UseGuards(ConversationParticipantGuard)
  @ApiOperation({ summary: 'Mark a conversation read up to a message' })
  async markRead(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
    @Body() dto: MarkReadDto,
  ) {
    return this.messageService.markRead(conversationId, req.user.id, dto.lastReadMessageId);
  }

  // ---------------------------------------------------------------- attachments

  @Post('conversations/:conversationId/attachments/upload-url')
  @UseGuards(ConversationParticipantGuard)
  @ApiOperation({ summary: 'Get a signed Cloudinary upload target for a private attachment' })
  async createUploadUrl(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
    @Body() dto: UploadUrlDto,
  ) {
    return this.attachmentService.createUploadUrl(req.user.id, conversationId, dto);
  }

  @Post('conversations/:conversationId/attachments/:attachmentId/complete')
  @UseGuards(ConversationParticipantGuard)
  @ApiOperation({ summary: 'Confirm an upload and publish the file message' })
  async completeUpload(
    @Req() req: any,
    @Param('attachmentId') attachmentId: string,
    @Body() dto: CompleteUploadDto,
  ) {
    return this.attachmentService.completeUpload(req.user.id, attachmentId, dto);
  }

  @Get('attachments/:attachmentId/download-url')
  @ApiOperation({ summary: 'Short-lived signed download URL (participants only)' })
  async getDownloadUrl(@Req() req: any, @Param('attachmentId') attachmentId: string) {
    return this.attachmentService.getDownloadUrl(req.user.id, attachmentId);
  }
}
