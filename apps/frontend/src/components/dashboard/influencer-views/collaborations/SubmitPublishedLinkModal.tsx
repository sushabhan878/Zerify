'use client';
import SubmissionDialog from '../../campaign-execution/SubmissionDialog';
import type { ParticipantDeliverableItem } from '@/services/deliverable.service';
export default function SubmitPublishedLinkModal(props: { deliverable: ParticipantDeliverableItem | null; onClose: () => void; onSuccess: () => void }) { return <SubmissionDialog {...props} publicationOnly />; }
