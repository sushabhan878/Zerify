import { IsInt, IsUrl, Min } from 'class-validator';

export class PublishDeliverableDto {
  @IsUrl({ protocols: ['https'], require_protocol: true })
  publishedUrl: string;

  @IsInt()
  @Min(1)
  expectedVersion: number;
}
