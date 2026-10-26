'use client';

import { Video } from 'lucide-react';
import { ParticipantDeliverableItem } from '@/services/deliverable.service';
import { isComplete, isOverdue } from '@/services/deliverable-workflow';
import SubmissionHistory from './SubmissionHistory';
import { ActionButton, dateLabel } from './ExecutionUi';
import FloatingDeliverableBadge from './FloatingDeliverableBadge';

interface Props { deliverable: ParticipantDeliverableItem; disabled?: boolean; onSubmit: () => void; onPublish: () => void }

export default function DeliverableCard({ deliverable: d, disabled, onSubmit, onPublish }: Props) {
  const editable = ['PENDING', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(d.status);
  const publish = ['APPROVED', 'READY_TO_PUBLISH'].includes(d.status) && !isComplete(d);
  const requirements = d.requirements;

  return (
    <article className="relative overflow-visible mt-6 sm:mt-7 p-5 sm:p-6 pr-6 sm:pr-8 rounded-2xl bg-slate-950/60 border border-purple-500/20 hover:border-purple-500/40 backdrop-blur-2xl shadow-xl shadow-purple-950/20 hover:shadow-[0_16px_40px_rgba(168,85,247,0.16)] transition-all duration-300 space-y-4 group">
      {/* Ambient Background Aura Clipped */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/15 transition-all duration-500" />
      </div>

      {/* Floating Status Badge Overlapping Top-Right Corner */}
      <div
        className="absolute right-5 sm:right-7 z-30 pointer-events-none"
        style={{ top: '-16px', transform: 'translateY(-50%)' }}
      >
        <FloatingDeliverableBadge status={d.status} />
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-300">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{d.platform || d.type.split(' ')[0]} · Quantity {d.quantity}</p>
            <h3 className="font-bold text-white text-base sm:text-lg">{d.title || d.type}</h3>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 text-xs text-slate-400 relative z-10">
        <span className={isOverdue(d) ? 'font-semibold text-rose-300' : ''}>
          {isOverdue(d) ? 'Overdue · ' : ''}Submit by {dateLabel(d.dueDate)}
        </span>
        {requirements?.publicationDeadline && <span>Publish by {dateLabel(requirements.publicationDeadline)}</span>}
        <span>Version {d.version || 0}</span>
      </div>

      {(d.description || requirements?.instructions) && (
        <p className="whitespace-pre-wrap text-sm text-slate-300 relative z-10">
          {d.description} {requirements?.instructions}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-purple-200 relative z-10">
        {[...(requirements?.mandatoryHashtags || []), ...(requirements?.mandatoryMentions || []), requirements?.requiredCta]
          .filter(Boolean)
          .map((r, i) => (
            <span key={i} className="rounded-lg bg-purple-500/10 px-2 py-1">
              {r}
            </span>
          ))}
      </div>

      {d.reviewComments && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-100 relative z-10">
          <strong>Brand feedback</strong>
          <p className="mt-1 whitespace-pre-wrap">{d.reviewComments}</p>
        </div>
      )}

      {d.status === 'SUBMITTED' && (
        <p className="text-sm text-amber-200 relative z-10">
          Your submission is with the brand. We’ll notify you when they respond.
        </p>
      )}

      {(d.status === 'READY_TO_PUBLISH' || (d.status === 'APPROVED' && !isComplete(d))) && (
        <p className="text-sm text-cyan-300 font-medium relative z-10">
          Approved for publication! Post your content and submit the published live URL.
        </p>
      )}

      {d.status === 'PUBLISHED' && (
        <p className="text-sm text-indigo-200 relative z-10">
          Published URL received · awaiting manual verification by the brand.
        </p>
      )}

      {isComplete(d) && (
        <p className="text-sm text-emerald-300 relative z-10">
          Deliverable complete. Payment is managed securely by Smart Escrow.
        </p>
      )}

      {d.publishedUrl && /^https:\/\//i.test(d.publishedUrl) && (
        <a
          href={d.publishedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block break-all text-sm text-purple-300 hover:underline relative z-10"
        >
          View published post
        </a>
      )}

      <div className="relative z-10 pt-1">
        {editable && (
          <ActionButton disabled={disabled} onClick={onSubmit}>
            {d.status === 'REVISION_REQUESTED' ? 'Fix & Resubmit' : 'Submit Deliverable'}
          </ActionButton>
        )}
        {publish && (
          <ActionButton disabled={disabled} onClick={onPublish}>
            Submit Published URL
          </ActionButton>
        )}
      </div>

      <div className="relative z-10">
        <SubmissionHistory deliverable={d} />
      </div>

      {!!d.events?.length && (
        <details className="text-xs text-slate-400 relative z-10">
          <summary className="cursor-pointer hover:text-white">Activity timeline</summary>
          <ol className="mt-3 space-y-2">
            {d.events.map((e) => (
              <li key={e.id}>
                {dateLabel(e.createdAt)} · {e.eventType.replace(/_/g, ' ')} · {e.actorRole}
              </li>
            ))}
          </ol>
        </details>
      )}
    </article>
  );
}
