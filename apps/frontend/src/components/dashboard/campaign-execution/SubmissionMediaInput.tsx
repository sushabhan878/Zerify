'use client';

import { useEffect, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { ParticipantDeliverableItem } from '@/services/deliverable.service';
import { input } from './ExecutionUi';

interface Props {
  deliverable: ParticipantDeliverableItem; method: 'FILE' | 'PUBLISHED_URL';
  file?: File; url: string; busy: boolean; readOnly?: boolean;
  onFile: (file?: File) => void; onUrl: (url: string) => void;
}
export default function SubmissionMediaInput({ deliverable: d, method, file, url, busy, readOnly, onFile, onUrl }: Props) {
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const objectUrl = URL.createObjectURL(file); setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  const types = d.requirements?.allowedMimeTypes || ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'];
  const limit = d.requirements?.maxFileSizeMb || 100;
  const select = (selected?: File) => {
    setError('');
    if (selected && (!types.includes(selected.type) || selected.size > limit * 1024 * 1024 || selected.size === 0)) {
      setError(`Choose a supported, non-empty file smaller than ${limit} MB.`); return;
    }
    onFile(selected);
  };
  if (method === 'PUBLISHED_URL') return <div className="space-y-2"><label className="block text-sm text-slate-300">Published social URL<input className={`${input} mt-1`} type="url" value={url} readOnly={readOnly} disabled={busy && !readOnly} placeholder="https://instagram.com/reel/…" onChange={e => onUrl(e.target.value)} /></label><p className="text-xs text-amber-200">Platform and URL format are checked on submission. Post availability, ownership, hashtags and mentions require manual brand verification.</p></div>;
  return <div className="space-y-3">
    {!readOnly && <label onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy) select(e.dataTransfer.files[0]); }} className="block cursor-pointer rounded-2xl border border-dashed border-purple-400/40 bg-purple-500/5 p-6 text-center transition hover:bg-purple-500/10 focus-within:ring-2 focus-within:ring-purple-400">
      <UploadCloud className="mx-auto mb-2 h-7 w-7 text-purple-300" /><span className="block text-sm font-semibold text-white">Drop your content here or choose a file</span><span className="mt-1 block text-xs text-slate-400">{types.map(t => t.split('/')[1]).join(', ')} · Up to {limit} MB</span>
      <input aria-label="Upload deliverable file" type="file" accept={types.join(',')} disabled={busy} onChange={e => select(e.target.files?.[0])} className="mt-3 max-w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-white" />
    </label>}
    {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
    {file && <p className="break-all text-xs text-slate-300">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
    {preview && (file?.type.startsWith('video/') ? <video controls src={preview} className="max-h-64 w-full rounded-xl bg-slate-950" /> : <img alt="Submission preview" src={preview} className="max-h-64 w-full rounded-xl object-contain" />)}
  </div>;
}
