import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';

/**
 * Provider webhook ingestion (TRD §12, §43).
 *
 * The route is deliberately unauthenticated: authenticity comes from the
 * provider's signature over the raw body, verified before anything in the
 * payload is trusted or executed. RawBodyJsonParser in main.ts attaches the
 * exact bytes the provider signed.
 */
@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('cashfree')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive and verify a Cashfree webhook' })
  async cashfree(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-webhook-signature') signature?: string,
    @Headers('x-webhook-timestamp') timestamp?: string,
  ) {
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : '';

    const result = await this.webhookService.handleWebhook({
      rawBody,
      signature,
      timestamp,
      provider: 'CASHFREE',
    });

    // Always 200 once the event is durably stored: provider retries are the
    // recovery mechanism for processing failures, and a non-2xx would just
    // re-deliver an event we already hold.
    return { received: true, ...result };
  }
}
