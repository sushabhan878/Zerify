'use client';

import { Video } from 'lucide-react';
import { ParticipantDeliverableItem } from '@/services/deliverable.service';
import { isComplete, isOverdue } from '@/services/deliverable-workflow';
import SubmissionHistory from './SubmissionHistory';
import { ActionButton, panel, StatusBadge, dateLabel } from './ExecutionUi';

interface Props { deliverable: ParticipantDeliverableItem; disabled?: boolean; onSubmit: () => void; onPublish: () => void }
export default function DeliverableCard({ deliverable: d, disabled, onSubmit, onPublish }: Props) {
  const editable = ['PENDING', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(d.status);
  const publish = ['APPROVED', 'READY_TO_PUBLISH'].includes(d.status) && !isComplete(d);
  const requirements = d.requirements;
  return <article className={`${panel} space-y-4 p-5`}>
    <header className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-300"><Video className="h-5 w-5" /></div><div><p className="text-xs text-slate-400">{d.platform || d.type.split(' ')[0]} · Quantity {d.quantity}</p><h3 className="font-bold text-white">{d.title || d.type}</h3></div></div><StatusBadge status={d.status} /></header>
    <div className="flex flex-wrap gap-4 text-xs text-slate-400"><span className={isOverdue(d) ? 'font-semibold text-rose-300' : ''}>{isOverdue(d) ? 'Overdue · ' : ''}Submit by {dateLabel(d.dueDate)}</span>{requirements?.publicationDeadline && <span>Publish by {dateLabel(requirements.publicationDeadline)}</span>}<span>Version {d.version || 0}</span></div>
    {(d.description || requirements?.instructions) && <p className="whitespace-pre-wrap text-sm text-slate-300">{d.description} {requirements?.instructions}</p>}
    <div className="flex flex-wrap gap-2 text-xs text-purple-200">{[...(requirements?.mandatoryHashtags || []), ...(requirements?.mandatoryMentions || []), requirements?.requiredCta].filter(Boolean).map((r, i) => <span key={i} className="rounded-lg bg-purple-500/10 px-2 py-1">{r}</span>)}</div>
    {d.reviewComments && <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-100"><strong>Brand feedback</strong><p className="mt-1 whitespace-pre-wrap">{d.reviewComments}</p></div>}
    {d.status === 'SUBMITTED' && <p className="text-sm text-amber-200">Your submission is with the brand. We’ll notify you when they respond.</p>}
    {d.status === 'PUBLISHED' && <p className="text-sm text-indigo-200">Published URL received · awaiting manual verification by the brand.</p>}
    {d.status === 'IN_PROGRESS' && d.reviewStatus === 'APPROVED' && <p className="text-sm text-emerald-300">Draft approved. Submit your final content next.</p>}
    {isComplete(d) && <p className="text-sm text-emerald-300">Deliverable complete. Payment is managed separately by the payment system.</p>}
    {d.publishedUrl && /^https:\/\//i.test(d.publishedUrl) && <a href={d.publishedUrl} target="_blank" rel="noopener noreferrer" className="block break-all text-sm text-purple-300 hover:underline">View published post</a>}
    {editable && <ActionButton disabled={disabled} onClick={onSubmit}>{d.status === 'REVISION_REQUESTED' ? 'Fix & Resubmit' : 'Submit Deliverable'}</ActionButton>}
    {publish && <ActionButton disabled={disabled} onClick={onPublish}>Submit Published URL</ActionButton>}
    <SubmissionHistory deliverable={d} />
    {!!d.events?.length && <details className="text-xs text-slate-400"><summary className="cursor-pointer hover:text-white">Activity timeline</summary><ol className="mt-3 space-y-2">{d.events.map(e => <li key={e.id}>{dateLabel(e.createdAt)} · {e.eventType.replace(/_/g, ' ')} · {e.actorRole}</li>)}</ol></details>}
  </article>;
}
