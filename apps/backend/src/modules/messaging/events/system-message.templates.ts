import { ApplicationEventPayload, OUTBOX_EVENTS, OutboxEventType } from './messaging-events';

/**
 * Renders SYSTEM message copy for business events. Clients can never author
 * these — the outbox worker is the only writer (PRD §37).
 *
 * `messageKey` is a stable identifier so the frontend can localise later
 * without parsing the rendered English text.
 */
export interface RenderedSystemMessage {
  messageKey: string;
  text: string;
}

const brandOf = (p: ApplicationEventPayload) => p.brandName?.trim() || 'The brand';
const creatorOf = (p: ApplicationEventPayload) => p.influencerName?.trim() || 'The creator';
const campaignSuffix = (p: ApplicationEventPayload) =>
  p.campaignTitle ? ` for "${p.campaignTitle}"` : '';

type Renderer = (payload: ApplicationEventPayload) => RenderedSystemMessage;

const TEMPLATES: Record<OutboxEventType, Renderer> = {
  [OUTBOX_EVENTS.COLLABORATION_REQUEST_CREATED]: (p) => ({
    messageKey: 'system.collaboration.created',
    text: `${creatorOf(p)} sent a collaboration request${campaignSuffix(p)}.`,
  }),
  [OUTBOX_EVENTS.COLLABORATION_REQUEST_UNDER_REVIEW]: (p) => ({
    messageKey: 'system.collaboration.under_review',
    text: `${brandOf(p)} is reviewing the application${campaignSuffix(p)}.`,
  }),
  [OUTBOX_EVENTS.COLLABORATION_REQUEST_SHORTLISTED]: (p) => ({
    messageKey: 'system.collaboration.shortlisted',
    text: `${brandOf(p)} shortlisted ${creatorOf(p)}${campaignSuffix(p)}.`,
  }),
  [OUTBOX_EVENTS.COLLABORATION_REQUEST_REJECTED]: (p) => ({
    messageKey: 'system.collaboration.rejected',
    text: `${brandOf(p)} declined the collaboration request${campaignSuffix(p)}.`,
  }),
  [OUTBOX_EVENTS.COLLABORATION_REQUEST_WITHDRAWN]: (p) => ({
    messageKey: 'system.collaboration.withdrawn',
    text: `${creatorOf(p)} withdrew the collaboration request${campaignSuffix(p)}.`,
  }),
};

export function renderSystemMessage(
  eventType: string,
  payload: ApplicationEventPayload,
): RenderedSystemMessage | null {
  const renderer = TEMPLATES[eventType as OutboxEventType];
  if (!renderer) return null;
  return renderer(payload);
}

/** Structured metadata stored on the SYSTEM message (PRD §79/§80). */
export function buildSystemMetadata(
  eventType: string,
  payload: ApplicationEventPayload,
  messageKey: string,
) {
  return {
    systemEvent: eventType,
    messageKey,
    applicationId: payload.applicationId,
    campaignId: payload.campaignId,
    campaignTitle: payload.campaignTitle ?? null,
    brandUserId: payload.brandUserId,
    influencerUserId: payload.influencerUserId,
    actor: payload.actor,
  };
}
