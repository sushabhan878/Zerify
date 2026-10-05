import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/** Maximum characters allowed in a single text message (PRD §68). */
export const MAX_MESSAGE_LENGTH = 10000;

export class SendMessageDto {
  @IsString()
  @MinLength(1, { message: 'MESSAGE_EMPTY' })
  @MaxLength(MAX_MESSAGE_LENGTH, { message: 'MESSAGE_TOO_LONG' })
  content: string;

  /**
   * Client-generated idempotency key. Re-sending the same key returns the
   * original message instead of creating a duplicate (PRD §16).
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientMessageId?: string;

  /** Optional already-uploaded attachment to bind to this message. */
  @IsOptional()
  @IsUUID()
  attachmentId?: string;
}
