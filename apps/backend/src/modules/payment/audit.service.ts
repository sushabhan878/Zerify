import { Injectable, Logger } from '@nestjs/common';
import { PaymentRepository, PrismaLike } from './payment.repository';

/** Context for a financial action, captured from the HTTP request. */
export interface AuditContext {
  actorType?: 'USER' | 'ADMIN' | 'SYSTEM' | 'WEBHOOK';
  actorId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditEvent {
  action: string;
  entityType: string;
  entityId: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Financial audit trail (TRD §22).
 *
 * Every financial state transition is recorded immutably. Audit writes run in
 * the same transaction as the state change they describe where the caller
 * passes a transaction client — an audit record never exists for a rolled
 * back mutation, and a committed mutation is never missing its record.
 *
 * An audit failure must not abort a financial mutation that already
 * succeeded, so when no transaction client is supplied the write is
 * best-effort and logged on failure.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly repository: PaymentRepository) {}

  async record(
    event: AuditEvent,
    context: AuditContext = {},
    client?: PrismaLike,
  ): Promise<void> {
    const data = {
      actorType: context.actorType ?? 'SYSTEM',
      actorId: context.actorId ?? null,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      previousStatus: event.previousStatus ?? null,
      newStatus: event.newStatus ?? null,
      metadata: (event.metadata ?? undefined) as any,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    };

    // Inside a transaction the audit row commits or rolls back with the
    // mutation it describes.
    if (client) {
      await this.repository.createAuditLog(data, client);
      return;
    }

    try {
      await this.repository.createAuditLog(data);
    } catch (error) {
      // Best-effort outside a transaction: the financial mutation already
      // committed, so surface the gap loudly instead of rolling anything back.
      this.logger.error(
        `Audit write failed for ${event.action} on ${event.entityType}:${event.entityId}: ${(error as Error).message}`,
      );
    }
  }

  async listForEntity(entityType: string, entityId: string, take = 100) {
    return this.repository.listAuditLogs({ entityType, entityId, take });
  }

  async listRecent(take = 100) {
    return this.repository.listAuditLogs({ take });
  }
}
