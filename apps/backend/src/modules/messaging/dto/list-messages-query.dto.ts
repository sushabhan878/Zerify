import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const DEFAULT_PAGE_SIZE = 40;
export const MAX_PAGE_SIZE = 50;

export class ListMessagesQueryDto {
  /**
   * Keyset cursor: the `sequenceNumber` of the oldest message already loaded.
   * Results are the messages immediately before it, newest-first.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cursor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;
}

export class ListConversationsQueryDto {
  /** ISO timestamp of the oldest `lastMessageAt` already loaded. */
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;
}

export class SearchConversationsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
