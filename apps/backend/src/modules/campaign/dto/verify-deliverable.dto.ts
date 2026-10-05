import { Equals, IsInt, Min } from 'class-validator';

export class VerifyDeliverableDto {
  @IsInt()
  @Min(1)
  expectedVersion: number;

  @Equals(true)
  confirmed: boolean;
}
