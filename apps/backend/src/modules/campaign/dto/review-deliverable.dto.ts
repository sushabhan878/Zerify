import { IsString, IsOptional, IsIn } from 'class-validator';

export class ReviewDeliverableDto {
  @IsIn(['APPROVED', 'REVISION_REQUESTED', 'REJECTED'])
  decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';

  @IsOptional()
  @IsString()
  comments?: string;
}
