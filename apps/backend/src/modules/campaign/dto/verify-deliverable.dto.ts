import { Equals, IsInt, Min } from 'class-validator';

export class VerifyDeliverableDto {
  @IsInt()
  @Min(0)
  expectedVersion: number;

  @Equals(true)
  confirmed: boolean;
}
