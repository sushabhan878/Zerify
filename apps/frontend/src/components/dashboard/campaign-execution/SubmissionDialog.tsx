'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { DeliverableService, ParticipantDeliverableItem } from '@/services/deliverable.service';
import { ActionButton, ErrorNotice, input } from './ExecutionUi';
import SubmissionMediaInput from './SubmissionMediaInput';

interface Props { deliverable: ParticipantDeliverableItem | null; onClose: () => void; onSuccess: () => void; publicationOnly?: boolean }
export default function SubmissionDialog({ deliverable: d, onClose, onSuccess, publicationOnly = false }: Props) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'FILE' | 'PUBLISHED_URL'>(publicationOnly ? 'PUBLISHED_URL' : 'FILE');
  const [isFinal, setFinal] = useState(true);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File>();
  const [asset, setAsset] = useState<{ id: string; filename: string; size: number; duration?: number }>();
  const [caption, setCaption] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<ParticipantDeliverableItem>();
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
      if (event.key !== 'Tab') return;
      const nodes = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, textarea, a[href]');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [busy, onClose]);
  if (!d) return null;
  const prepare = async () => {
    setBusy(true); setError('');
    try {
      if (method === 'FILE') {
        if (!file) throw new Error('Choose a file to upload.');
        if (!asset) setAsset(await DeliverableService.upload(d.id, file));
      } else {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:') throw new Error('Use an HTTPS social post URL.');
      }
      setStep(2);
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed. Please retry.'); }
    finally { setBusy(false); }
  };
  const submit = async () => {
    setBusy(true); setError('');
    try {
      const result = publicationOnly
        ? await DeliverableService.publishDeliverable(d.id, { publishedUrl: url, expectedVersion: d.version })
        : await DeliverableService.submitDraft(d.id, {
          submissionType: method, isFinal: method === 'PUBLISHED_URL' || isFinal, expectedVersion: d.version,
          confirmed, assetIds: method === 'FILE' && asset ? [asset.id] : undefined,
          publishedUrl: method === 'PUBLISHED_URL' ? url : undefined, caption, notes,
        });
      setReceipt(result); onSuccess();
    } catch (e) { setError(e instanceof Error ? e.message : 'Submission failed. Please retry.'); }
    finally { setBusy(false); }
  };
  return createPortal(<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
    <motion.div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="submission-title" tabIndex={-1} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
      <header className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-purple-300">{receipt ? 'Submission received' : `Step ${step} of 2 · ${step === 1 ? 'Prepare' : 'Review'}`}</p><h2 id="submission-title" className="mt-1 text-xl font-bold text-white">{d.title || d.type}</h2></div><button aria-label="Close submission" disabled={busy} onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"><X className="h-5 w-5" /></button></header>
      {error && (
        <div role="alert" className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200 space-y-2">
          <div className="font-semibold text-rose-100 flex items-center justify-between">
            <span>{error.toLowerCase().includes('already been submitted') ? 'Duplicate Submission' : error.toLowerCase().includes('url') || error.toLowerCase().includes('post') ? 'URL Verification Failed' : 'Submission / Upload Error'}</span>
            <button onClick={() => setError('')} className="text-rose-300 hover:text-white text-xs underline">Dismiss</button>
          </div>
          <p>{error}</p>
          {error.toLowerCase().includes('already been submitted') && (
            <div className="pt-1">
              <button type="button" onClick={onClose} className="rounded-lg bg-rose-600/30 px-3 py-1 font-semibold text-rose-200 hover:bg-rose-600/50">
                View Existing Submission
              </button>
            </div>
          )}
          {(error.toLowerCase().includes('url') || error.toLowerCase().includes('post')) && !error.toLowerCase().includes('already been submitted') && (
            <ul className="list-disc list-inside text-[11px] text-rose-300/90 space-y-0.5 pt-1">
              <li>Check that the URL is a direct HTTPS public post link.</li>
              <li>Ensure the post is not private or restricted.</li>
              <li>Verify that the platform matches the deliverable requirements.</li>
            </ul>
          )}
        </div>
      )}
      {receipt ? <div role="status" className="space-y-4 py-6 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" /><h3 className="text-lg font-bold text-white">{publicationOnly ? 'Published URL received' : 'Submitted for brand review'}</h3><p className="text-sm text-slate-300">Version {receipt.version} · {new Date(receipt.submittedAt || Date.now()).toLocaleString()}</p><p className="break-all text-xs text-slate-500">{receipt.revisions?.[0]?.id || receipt.id}</p><p className="text-sm text-slate-400">{publicationOnly ? 'The brand will manually verify the post and connected account.' : 'We’ll notify you in Messages when the brand responds.'}</p><ActionButton onClick={onClose}>View submission</ActionButton></div> : <div className="space-y-4">
        {step === 1 ? <>
          {!publicationOnly && <div className="grid grid-cols-2 gap-3"><label className="text-sm text-slate-300">Submission stage<select className={`${input} mt-1`} value={isFinal ? 'final' : 'draft'} onChange={e => setFinal(e.target.value === 'final')} disabled={busy || method === 'PUBLISHED_URL'}><option value="draft">Draft for approval</option><option value="final">Final content</option></select></label><label className="text-sm text-slate-300">Method<select className={`${input} mt-1`} value={method} disabled={busy} onChange={e => setMethod(e.target.value as typeof method)}><option value="FILE">Upload file</option>{d.requirements?.requiresPreApproval === false && <option value="PUBLISHED_URL">Published social URL</option>}</select></label></div>}
          <SubmissionMediaInput deliverable={d} method={method} file={file} url={url} busy={busy} onFile={value => { setFile(value); setAsset(undefined); }} onUrl={setUrl} />
          {!publicationOnly && <><label className="block text-sm text-slate-300">Caption / hashtags / mentions<textarea className={`${input} mt-1`} value={caption} maxLength={5000} onChange={e => setCaption(e.target.value)} /></label><label className="block text-sm text-slate-300">Note for the brand<textarea className={`${input} mt-1`} value={notes} maxLength={5000} onChange={e => setNotes(e.target.value)} /></label></>}
          <ActionButton busy={busy} onClick={prepare}>{busy ? 'Uploading securely…' : 'Continue to review'}</ActionButton>
        </> : <>
          <SubmissionMediaInput deliverable={d} method={method} file={file} url={url} busy readOnly onFile={() => {}} onUrl={() => {}} />
          <div className="space-y-2 rounded-xl bg-slate-950/60 p-4 text-sm text-slate-300"><p>{publicationOnly ? 'Publication verification' : isFinal || method === 'PUBLISHED_URL' ? 'Final content' : 'Draft for approval'}</p>{asset && <p>{asset.filename} · {(asset.size / 1024 / 1024).toFixed(1)} MB{asset.duration ? ` · ${Math.round(asset.duration)} seconds` : ''}</p>}{caption && <p className="whitespace-pre-wrap">Caption: {caption}</p>}{notes && <p className="whitespace-pre-wrap">Note: {notes}</p>}</div>
          <label className="flex gap-3 text-sm text-slate-300"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I confirm this content follows the campaign requirements and belongs to my assigned account.</label>
          <div className="flex justify-between gap-3"><button disabled={busy} onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-white">Back to edit</button><ActionButton disabled={!confirmed} busy={busy} onClick={submit}>{publicationOnly ? 'Submit URL for verification' : 'Submit for brand review'}</ActionButton></div>
        </>}
      </div>}
    </motion.div>
  </div>, document.body);
}
