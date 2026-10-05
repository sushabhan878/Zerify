import type { ParticipantDeliverableItem } from './deliverable.service';

export interface DeliverableRequirements {
  requiresPublication?: boolean;
  requiresPreApproval?: boolean;
  allowLateSubmission?: boolean;
  maxFileSizeMb?: number;
  allowedMimeTypes?: string[];
  publicationDeadline?: string;
  mandatoryHashtags?: string[];
  mandatoryMentions?: string[];
  requiredCta?: string;
  instructions?: string;
}
export interface SubmissionVersion {
  id: string; version: number; submissionType: 'FILE' | 'PUBLISHED_URL';
  isFinal: boolean; assetIds: string[]; files: string[]; publishedUrl?: string;
  caption?: string; notes?: string; status: string; reviewComments?: string;
  createdAt: string; reviewedAt?: string;
}
export const isComplete = (d: ParticipantDeliverableItem) => d.status === 'VERIFIED' || (d.status === 'APPROVED' && d.requirements?.requiresPublication === false);
export const isOverdue = (d: ParticipantDeliverableItem) => !isComplete(d) && !!d.dueDate && new Date(d.dueDate).getTime() < Date.now() && ['PENDING', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(d.status);
export function nextAction(participant: { status: string; deliverables?: ParticipantDeliverableItem[] }) {
  const items = participant.deliverables || [];
  if (participant.status === 'PARTICIPANT_CANCELLED') return { label: 'View Campaign', message: 'Collaboration cancelled', state: 'CANCELLED' };
  if (participant.status === 'PARTICIPANT_COMPLETED') return { label: 'View Payment', message: 'All deliverables approved · Payment processing', state: 'COMPLETED' };
  if (participant.status === 'CONFIRMED') return { label: 'Start Campaign', message: 'Campaign accepted · Review brief to begin', state: 'ACCEPTED' };
  if (items.some(d => d.status === 'REVISION_REQUESTED')) return { label: 'Fix & Resubmit', message: 'Action required · Brand requested changes', state: 'REVISION_REQUIRED' };
  if (items.some(d => ['PENDING', 'IN_PROGRESS'].includes(d.status))) {
    const overdue = items.some(isOverdue);
    return {
      label: 'Submit Deliverable',
      message: overdue ? '⚠ Overdue · Submission required immediately' : 'Deliverable ready · Content creation in progress',
      state: overdue ? 'ACTION_REQUIRED' : 'IN_PROGRESS',
    };
  }
  if (items.some(d => ['READY_TO_PUBLISH', 'APPROVED'].includes(d.status) && !isComplete(d))) return { label: 'Submit Published URL', message: 'Approved for publication · Post content & submit URL', state: 'AWAITING_PUBLICATION' };
  if (items.some(d => d.status === 'SUBMITTED' || d.status === 'PUBLISHED')) return { label: 'View Submission', message: 'Submission received · Waiting for brand review', state: 'UNDER_REVIEW' };
  return { label: 'View Campaign', message: items.some(d => d.status === 'DELIVERABLE_REJECTED') ? 'A deliverable was rejected. Contact your brand in Messages.' : 'View your campaign requirements', state: 'ACTION_REQUIRED' };
}
