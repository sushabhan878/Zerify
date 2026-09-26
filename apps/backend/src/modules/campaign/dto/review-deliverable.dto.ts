import { IsString, IsOptional, IsIn, IsInt, Min, MaxLength } from 'class-validator';

export class ReviewDeliverableDto {
  @IsInt()
  @Min(1)
  expectedVersion: number;

  @IsIn(['APPROVED', 'REVISION_REQUESTED', 'REJECTED'])
  decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';

  @IsOptional()
  @IsString()
  comments?: string;
}
