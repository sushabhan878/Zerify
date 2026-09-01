import { IsString, IsOptional, IsArray } from 'class-validator';

export class PublishDeliverableDto {
  @IsString()
  publishedUrl: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proofUrls?: string[];
}
