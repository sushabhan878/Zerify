import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { MessagingRepository } from '../messaging.repository';
import { MESSAGING_ERRORS } from '../events/messaging-events';

/**
 * Membership check for every `:conversationId` route. A valid JWT alone is
 * never enough — the caller must be a participant (PRD §45).
 */
@Injectable()
export class ConversationParticipantGuard implements CanActivate {
  constructor(private readonly repository: MessagingRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException(MESSAGING_ERRORS.UNAUTHORIZED);
    }

    const conversationId = request.params?.conversationId;
    if (!conversationId) {
      return true;
    }

    const participant = await this.repository.findParticipant(conversationId, user.id);
    if (!participant) {
      // Deliberately identical for "missing" and "not a member" so the endpoint
      // cannot be used to probe which conversation ids exist.
      throw new ForbiddenException(MESSAGING_ERRORS.CONVERSATION_ACCESS_DENIED);
    }

    request.conversationParticipant = participant;
    return true;
  }
}
