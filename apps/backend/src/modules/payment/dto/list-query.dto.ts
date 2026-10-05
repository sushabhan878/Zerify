import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus, PayoutStatus, RefundStatus, WebhookProcessingStatus } from '@prisma/client';

export class ListPaymentsQueryDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  campaignId?: string;
}

export class ListPayoutsQueryDto {
  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;
}

export class ListWebhookEventsQueryDto {
  @IsOptional()
  @IsEnum(WebhookProcessingStatus)
  processingStatus?: WebhookProcessingStatus;
}

export class ListRefundsQueryDto {
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;
}
