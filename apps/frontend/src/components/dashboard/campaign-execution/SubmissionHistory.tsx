'use client';

import { useState } from 'react';
import { ExternalLink, FileVideo, History } from 'lucide-react';
import { DeliverableService, ParticipantDeliverableItem } from '@/services/deliverable.service';
import { ActionButton, ErrorNotice, StatusBadge, dateLabel } from './ExecutionUi';

export default function SubmissionHistory({ deliverable }: { deliverable: ParticipantDeliverableItem }) {
  const [preview, setPreview] = useState<string>();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState('');
  const openAsset = async (id: string) => {
    setBusy(id); setError('');
    try { setPreview((await DeliverableService.getAssetUrl(deliverable.id, id)).url); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not open this file'); }
    finally { setBusy(undefined); }
  };
  const safeUrl = (url: string) => /^https:\/\//i.test(url);
  return <details className="rounded-xl border border-purple-500/20 bg-slate-950/60 hover:border-purple-500/30 p-4 transition-colors" open={deliverable.status === 'SUBMITTED'}>
    <summary className="cursor-pointer text-sm font-semibold text-purple-200"><History className="mr-2 inline h-4 w-4" />Submission history · {deliverable.revisions?.length || 0} versions</summary>
    <ErrorNotice message={error} />
    <div className="mt-4 space-y-4">
      {!deliverable.revisions?.length && <p className="text-sm text-slate-400">No submissions yet. Your versions will be preserved here.</p>}
      {deliverable.revisions?.map(v => <article key={v.id} className="space-y-2 border-l-2 border-purple-500/30 pl-4 text-sm">
        <div className="flex flex-wrap items-center gap-2"><strong className="text-white">v{v.version}{v.version === deliverable.version ? ' · Current' : ''}</strong><span className="text-slate-400">{v.isFinal ? 'Final' : 'Draft'} · {dateLabel(v.createdAt)}</span><StatusBadge status={v.status} /></div>
        <p className="break-all text-xs text-slate-500">Submission {v.id}</p>
        <div className="flex flex-wrap gap-2">{v.assetIds?.map((id, index) => <ActionButton key={id} busy={busy === id} onClick={() => openAsset(id)}><FileVideo className="h-4 w-4" />Preview file {index + 1}</ActionButton>)}</div>
        {[v.publishedUrl, ...(v.files || [])].filter((u): u is string => !!u && safeUrl(u)).map((url, index) => (
          <div key={url} className="pt-0.5">
            <a
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-600/20 hover:bg-purple-600/35 px-3.5 py-1.5 text-xs font-semibold text-purple-200 hover:text-white transition shadow-sm"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-purple-300" />
              <span>Open Deliverable Link {index > 0 ? `#${index + 1}` : ''}</span>
            </a>
          </div>
        ))}
        {v.notes && (
          <div className="text-xs text-slate-300 bg-white/5 rounded-lg p-2.5">
            <strong className="text-purple-300">Creator Note:</strong> {v.notes}
          </div>
        )}
        {v.caption && (
          <div className="text-xs text-slate-300 bg-white/5 rounded-lg p-2.5">
            <strong className="text-purple-300">Caption & Tags:</strong> {v.caption}
          </div>
        )}
        {v.reviewComments && <p className="rounded-lg bg-purple-500/10 p-3 text-purple-100">Brand feedback: {v.reviewComments}</p>}
      </article>)}
    </div>
    {preview && <div className="mt-4 space-y-2"><p className="text-xs text-slate-400">Private link · expires in 5 minutes</p><a href={preview} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-300 underline">Open secure content preview</a><button onClick={() => setPreview(undefined)} className="ml-4 text-sm text-slate-400 hover:text-white">Close preview</button></div>}
  </details>;
}
