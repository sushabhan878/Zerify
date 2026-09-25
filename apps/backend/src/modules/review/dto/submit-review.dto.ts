import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewRatingDto {
  @ApiProperty({ description: 'ID of the review question', example: 'uuid' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Rating from 0 to 5', example: 4, minimum: 0, maximum: 5 })
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;
}

export class SubmitReviewDto {
  @ApiProperty({ description: 'Campaign ID being reviewed' })
  @IsString()
  campaignId: string;

  @ApiProperty({
    description: 'Type of review',
    enum: ['BRAND_TO_INFLUENCER', 'INFLUENCER_TO_BRAND'],
  })
  @IsIn(['BRAND_TO_INFLUENCER', 'INFLUENCER_TO_BRAND'])
  reviewType: 'BRAND_TO_INFLUENCER' | 'INFLUENCER_TO_BRAND';

  @ApiPropertyOptional({ description: 'ID of the influencer being reviewed (for BRAND_TO_INFLUENCER)' })
  @IsOptional()
  @IsString()
  revieweeInfluencerId?: string;

  @ApiPropertyOptional({ description: 'ID of the brand being reviewed (for INFLUENCER_TO_BRAND)' })
  @IsOptional()
  @IsString()
  revieweeBrandId?: string;

  @ApiPropertyOptional({ description: 'Optional free-text comment' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'Array of question ratings', type: [ReviewRatingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewRatingDto)
  ratings: ReviewRatingDto[];
}
