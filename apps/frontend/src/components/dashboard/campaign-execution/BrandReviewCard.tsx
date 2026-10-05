'use client';

import { useState } from 'react';
import { Check, CheckCircle2, FileVideo, ExternalLink } from 'lucide-react';
import { DeliverableService, ParticipantDeliverableItem } from '@/services/deliverable.service';
import SubmissionHistory from './SubmissionHistory';
import { ActionButton, ErrorNotice, input, panel, StatusBadge, dateLabel } from './ExecutionUi';

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

export default function BrandReviewCard({ deliverable: d, onRefresh }: { deliverable: ParticipantDeliverableItem; onRefresh: () => void }) {
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [previewingAssetId, setPreviewingAssetId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const latest = d.revisions?.[0];

  const handleOpenAsset = async (assetId: string) => {
    setPreviewingAssetId(assetId);
    setError('');
    try {
      const res = await DeliverableService.getAssetUrl(d.id, assetId);
      setPreviewUrl(res.url);
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open media preview');
    } finally {
      setPreviewingAssetId(null);
    }
  };

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

  return <article className={`${panel} space-y-4 p-5`}>
    <header className="flex flex-wrap justify-between gap-3">
      <div>
        <h4 className="font-bold text-white text-base">{d.title || d.type}</h4>
        <p className="mt-1 text-xs text-slate-400">
          {d.platform} · Current v{d.version} · Due {dateLabel(d.dueDate)}
        </p>
      </div>
      <StatusBadge status={d.status} />
    </header>

    <ErrorNotice message={error} />

    {/* Latest Submission Highlights */}
    {latest && (
      <div className="rounded-xl border border-purple-500/20 bg-slate-950/70 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-purple-300">
            Latest Submission: v{latest.version} ({latest.isFinal ? 'Final Content' : 'Draft for Review'})
          </span>
          <span className="text-xs text-slate-400">{dateLabel(latest.createdAt)}</span>
        </div>

        {latest.assetIds && latest.assetIds.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {latest.assetIds.map((assetId, idx) => (
              <button
                key={assetId}
                type="button"
                disabled={previewingAssetId === assetId}
                onClick={() => handleOpenAsset(assetId)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-200 hover:bg-purple-500/20 transition disabled:opacity-50"
              >
                <FileVideo className="h-3.5 w-3.5" />
                {previewingAssetId === assetId ? 'Opening preview…' : `Preview Submitted File ${idx + 1}`}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </div>
        )}

        {latest.notes && (
          <div className="text-xs text-slate-300 bg-white/5 rounded-lg p-2.5">
            <strong className="text-purple-300">Creator Note:</strong> {latest.notes}
          </div>
        )}
        {latest.caption && (
          <div className="text-xs text-slate-300 bg-white/5 rounded-lg p-2.5">
            <strong className="text-purple-300">Caption & Tags:</strong> {latest.caption}
          </div>
        )}
      </div>
    )}

    {/* Campaign Requirements Checklist */}
    <div className="rounded-xl bg-slate-950/60 p-3.5 text-xs text-slate-300 space-y-2 border border-white/5">
      <p className="font-semibold text-white">Campaign Requirements Checklist</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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

    {d.publishedUrl && /^https:\/\//i.test(d.publishedUrl) && (
      <a className="inline-flex items-center gap-1.5 text-sm text-purple-300 hover:underline" href={d.publishedUrl} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-4 w-4" /> Open submitted live post for verification
      </a>
    )}

    {/* Brand Review Section */}
    {d.status === 'SUBMITTED' && (
      <div className="space-y-3 border-t border-white/10 pt-4">
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
      <div className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
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

    <SubmissionHistory deliverable={d} />
  </article>;
}

