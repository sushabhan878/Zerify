'use client';

import { useState } from 'react';
import { Check, CheckCircle2, ExternalLink, Clock, Sparkles, X } from 'lucide-react';
import { DeliverableService, ParticipantDeliverableItem } from '@/services/deliverable.service';
import SubmissionHistory from './SubmissionHistory';
import { ActionButton, ErrorNotice, input, StatusBadge, dateLabel } from './ExecutionUi';

const REVISION_CATEGORIES = [
  'Content Quality',
  'Campaign Requirement',
  'Caption & CTA',
  'Hashtags & Mentions',
  'Product Visibility',
  'Brand Guidelines',
  'Technical Issue',
  'Other',
];

function FloatingDeliverableBadge({ status }: { status: string }) {
  const norm = (status || '').toUpperCase();
  const isApproved = /VERIFIED|COMPLETED|APPROVED/.test(norm);
  const isRevision = /REVISION|REJECT|CANCEL|FAIL/.test(norm);
  const isSubmitted = /SUBMITTED|IN_REVIEW|REVIEW/.test(norm);

  if (isApproved) {
    return (
      <span className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-emerald-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
        <span>Approved</span>
      </span>
    );
  }
  if (isRevision) {
    return (
      <span className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-rose-400/50 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-rose-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300">
        <X className="w-4 h-4 text-rose-200 shrink-0" />
        <span>{norm === 'REVISION_REQUESTED' ? 'Revision Requested' : 'Rejected'}</span>
      </span>
    );
  }
  if (isSubmitted) {
    return (
      <span className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-purple-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300">
        <Sparkles className="w-4 h-4 text-purple-200 animate-pulse shrink-0" />
        <span>Ready for Review</span>
      </span>
    );
  }
  // PENDING or default
  return (
    <span className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-amber-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300">
      <Clock className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
      <span>Pending</span>
    </span>
  );
}

export default function BrandReviewCard({ deliverable: d, onRefresh }: { deliverable: ParticipantDeliverableItem; onRefresh: () => void }) {
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const latest = d.revisions?.[0];

  const handleSelectCategory = (category: string) => {
    const prefix = `[${category}]: `;
    if (!feedback.startsWith('[')) {
      setFeedback(prefix + feedback);
    } else {
      const replaced = feedback.replace(/^\[[^\]]+\]:\s*/, prefix);
      setFeedback(replaced);
    }
  };

  const act = async (decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED' | 'VERIFY') => {
    setError(''); setBusy(true);
    try {
      if (decision === 'VERIFY') await DeliverableService.verifyDeliverable(d.id, d.version);
      else await DeliverableService.reviewDeliverable(d.id, { decision, expectedVersion: d.version, comments: feedback });
      setFeedback(''); setConfirmed(false); onRefresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Review failed. Refresh and try again.'); }
    finally { setBusy(false); }
  };

  return (
    <article className="relative overflow-visible mt-6 sm:mt-7 p-5 sm:p-6 pr-6 sm:pr-8 rounded-2xl bg-slate-950/60 border border-purple-500/20 hover:border-purple-500/40 backdrop-blur-2xl shadow-xl shadow-purple-950/20 hover:shadow-[0_16px_40px_rgba(168,85,247,0.16)] transition-all duration-300 space-y-4 group">
      {/* Ambient Background Aura Clipped */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/15 transition-all duration-500" />
      </div>

      {/* Floating Status Badge Overlapping Top-Right Corner - Shifted higher & bigger */}
      <div
        className="absolute right-5 sm:right-7 z-30 pointer-events-none"
        style={{ top: '-16px', transform: 'translateY(-50%)' }}
      >
        <FloatingDeliverableBadge status={d.status} />
      </div>

      <header className="flex flex-wrap justify-between gap-3 relative z-10">
        <div>
          <h4 className="font-bold text-white text-base sm:text-lg">{d.title || d.type}</h4>
          <p className="mt-0.5 text-xs text-slate-400">
            {d.platform} · Current v{d.version} · Due {dateLabel(d.dueDate)}
          </p>
        </div>
      </header>

      <ErrorNotice message={error} />

      {/* Campaign Requirements Checklist (Positioned on top before latest submission) */}
      <div className="space-y-1.5 text-xs text-slate-300 pt-0.5 relative z-10">
        <p className="font-bold text-white uppercase tracking-wider text-[11px] text-purple-300/90">
          Campaign Requirements Checklist
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Type: {d.platform} {d.type}</span>
          </div>
          {d.requirements?.mandatoryMentions && d.requirements.mandatoryMentions.length > 0 && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Mentions: {d.requirements.mandatoryMentions.join(' ')}</span>
            </div>
          )}
          {d.requirements?.mandatoryHashtags && d.requirements.mandatoryHashtags.length > 0 && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Hashtags: {d.requirements.mandatoryHashtags.join(' ')}</span>
            </div>
          )}
          {d.requirements?.requiredCta && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>CTA: {d.requirements.requiredCta}</span>
            </div>
          )}
        </div>
      </div>

      {/* Submission History directly after Campaign Requirements Checklist */}
      <div className="relative z-10 pt-1">
        <SubmissionHistory deliverable={d} />
      </div>

    {d.publishedUrl && /^https:\/\//i.test(d.publishedUrl) && (
      <a className="inline-flex items-center gap-1.5 text-sm text-purple-300 hover:underline relative z-10" href={d.publishedUrl} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-4 w-4" /> Open submitted live post for verification
      </a>
    )}

    {/* Brand Review Section */}
    {d.status === 'SUBMITTED' && (
      <div className="space-y-3 border-t border-white/10 pt-4 relative z-10">
        <div>
          <label className="block text-sm font-medium text-slate-200">
            Feedback (required for revisions or rejection)
          </label>
          <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
            <span className="text-xs text-slate-400 self-center mr-1">Categories:</span>
            {REVISION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className="rounded-md border border-white/10 bg-slate-950 px-2 py-0.5 text-[11px] text-slate-300 hover:border-purple-500/50 hover:text-white transition"
              >
                {cat}
              </button>
            ))}
          </div>
          <textarea
            value={feedback}
            maxLength={5000}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Include specific actionable changes, timestamps (e.g. 00:12), and required fixes…"
            className={`${input} mt-1`}
            rows={3}
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <ActionButton busy={busy} onClick={() => act('APPROVED')}>
            <Check className="h-4 w-4" />
            {latest?.isFinal ? 'Approve final content' : 'Approve draft'}
          </ActionButton>
          <button
            type="button"
            disabled={busy || !feedback.trim()}
            onClick={() => act('REVISION_REQUESTED')}
            className="rounded-xl border border-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/10 focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-50 transition"
          >
            Request revision
          </button>
          <button
            type="button"
            disabled={busy || !feedback.trim()}
            onClick={() => act('REJECTED')}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-50 transition"
          >
            Reject
          </button>
        </div>
      </div>
    )}

    {/* Brand Verification for Live Published Post */}
    {d.status === 'PUBLISHED' && (
      <div className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 relative z-10">
        <p className="text-sm text-indigo-200 font-medium">
          Manual verification required. Open the live post and verify that it is public, belongs to the assigned creator, and satisfies the required content, captions, mentions, and hashtags from the brief.
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-purple-500"
          />
          I checked the live post and confirm all publication requirements are met.
        </label>
        <ActionButton disabled={!confirmed} busy={busy} onClick={() => act('VERIFY')}>
          <Check className="h-4 w-4" /> Confirm publication & mark verified
        </ActionButton>

        <div className="border-t border-indigo-500/20 pt-3 mt-3">
          <label className="block text-sm text-slate-300">
            If verification fails, explain what needs to be changed:
            <textarea
              className={`${input} mt-1`}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Explain why the live post requires modification…"
              maxLength={5000}
              rows={2}
            />
          </label>
          <button
            type="button"
            disabled={busy || !feedback.trim()}
            onClick={() => act('REVISION_REQUESTED')}
            className="mt-2 rounded-xl border border-amber-500/30 px-3.5 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/10 disabled:opacity-50 transition"
          >
            Request publication revision
          </button>
        </div>
      </div>
    )}
  </article>
  );
}

