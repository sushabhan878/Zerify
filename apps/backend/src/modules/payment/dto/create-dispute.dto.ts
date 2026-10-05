import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDisputeDto {
  @IsIn(['COMPANY', 'INFLUENCER'])
  openedBy: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  evidence?: string[];

  @IsOptional()
  @IsIn(['REFUND_COMPANY', 'RELEASE_INFLUENCER', 'SPLIT', 'NO_ACTION'])
  requestedResolution?: string;
}
