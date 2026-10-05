import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConversationDto {
  /** The other user's `User.id` (not a profile id). */
  @IsUUID()
  participantId: string;

  /** Optional campaign context for a COLLABORATION/CAMPAIGN conversation. */
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  /** Optional first message sent atomically after the conversation exists. */
  @IsOptional()
  @IsString()
  initialMessage?: string;
}
