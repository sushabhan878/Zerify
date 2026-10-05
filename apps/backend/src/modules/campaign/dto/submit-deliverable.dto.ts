import { ArrayMaxSize, Equals, IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, IsUrl, MaxLength, Min } from 'class-validator';

export class SubmitDeliverableDto {
  @IsIn(['FILE', 'PUBLISHED_URL'])
  submissionType: 'FILE' | 'PUBLISHED_URL';

  @IsBoolean()
  isFinal: boolean;

  @IsInt()
  @Min(0)
  expectedVersion: number;

  @Equals(true)
  confirmed: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('4', { each: true })
  assetIds?: string[];

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  publishedUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  caption?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
