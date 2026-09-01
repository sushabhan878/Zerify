import { IsArray, IsString, IsOptional } from 'class-validator';

export class SubmitDeliverableDto {
  @IsArray()
  @IsString({ each: true })
  contentUrls: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
