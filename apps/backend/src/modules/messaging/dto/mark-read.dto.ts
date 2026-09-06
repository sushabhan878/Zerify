import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class MarkReadDto {
  /**
   * Newest message the user has seen. Omit to mark the whole conversation read
   * up to its current last message.
   */
  @IsOptional()
  @IsUUID()
  lastReadMessageId?: string;
}

export class UpdateConversationSettingsDto {
  @IsOptional()
  @IsBoolean()
  muted?: boolean;

  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}
