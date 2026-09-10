import { IsArray, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectFacebookPagesDto {
  @ApiProperty({ description: 'Array of Facebook Page IDs selected to be connected', example: ['123456789012345', '987654321098765'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  pageIds: string[];

  @ApiProperty({ description: 'Optional User ID if calling outside JWT context', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
