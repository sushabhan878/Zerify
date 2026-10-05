import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

/** 25 MB per file (PRD §24). Enforced here and re-checked on completion. */
export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;

export class UploadUrlDto {
  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @MaxLength(180)
  mimeType: string;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'FILE_EMPTY' })
  @Max(MAX_ATTACHMENT_SIZE, { message: 'FILE_TOO_LARGE' })
  fileSize: number;
}

export class CompleteUploadDto {
  /** Cloudinary `public_id` returned by the direct upload. */
  @IsString()
  @MaxLength(512)
  publicId: string;

  /** Byte count reported by Cloudinary; re-validated server-side. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bytes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientMessageId?: string;
}
