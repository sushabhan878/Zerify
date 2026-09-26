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
  return <details className="rounded-xl border border-white/10 bg-slate-950/50 p-4" open={deliverable.status === 'SUBMITTED'}>
    <summary className="cursor-pointer text-sm font-semibold text-purple-200"><History className="mr-2 inline h-4 w-4" />Submission history · {deliverable.revisions?.length || 0} versions</summary>
    <ErrorNotice message={error} />
    <div className="mt-4 space-y-4">
      {!deliverable.revisions?.length && <p className="text-sm text-slate-400">No submissions yet. Your versions will be preserved here.</p>}
      {deliverable.revisions?.map(v => <article key={v.id} className="space-y-2 border-l-2 border-purple-500/30 pl-4 text-sm">
        <div className="flex flex-wrap items-center gap-2"><strong className="text-white">v{v.version}{v.version === deliverable.version ? ' · Current' : ''}</strong><span className="text-slate-400">{v.isFinal ? 'Final' : 'Draft'} · {dateLabel(v.createdAt)}</span><StatusBadge status={v.status} /></div>
        <p className="break-all text-xs text-slate-500">Submission {v.id}</p>
        <div className="flex flex-wrap gap-2">{v.assetIds?.map((id, index) => <ActionButton key={id} busy={busy === id} onClick={() => openAsset(id)}><FileVideo className="h-4 w-4" />Preview file {index + 1}</ActionButton>)}</div>
        {[v.publishedUrl, ...(v.files || [])].filter((u): u is string => !!u && safeUrl(u)).map(url => <a className="block break-all text-purple-300 hover:underline" key={url} href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 inline h-3 w-3" />{url}</a>)}
        {v.caption && <p className="whitespace-pre-wrap text-slate-300">Caption: {v.caption}</p>}
        {v.notes && <p className="whitespace-pre-wrap text-slate-400">Creator note: {v.notes}</p>}
        {v.reviewComments && <p className="rounded-lg bg-purple-500/10 p-3 text-purple-100">Brand feedback: {v.reviewComments}</p>}
      </article>)}
    </div>
    {preview && <div className="mt-4 space-y-2"><p className="text-xs text-slate-400">Private link · expires in 5 minutes</p><a href={preview} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-300 underline">Open secure content preview</a><button onClick={() => setPreview(undefined)} className="ml-4 text-sm text-slate-400 hover:text-white">Close preview</button></div>}
  </details>;
}
