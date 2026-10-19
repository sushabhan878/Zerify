'use client';

import React from 'react';
import { Link2, ExternalLink, Globe, CheckCircle2, Cloud, Sparkles } from 'lucide-react';
import { ParticipantDeliverableItem } from '@/services/deliverable.service';
import { input } from './ExecutionUi';

interface Props {
  deliverable: ParticipantDeliverableItem;
  url: string;
  busy: boolean;
  readOnly?: boolean;
  onUrl: (url: string) => void;
}

export default function SubmissionMediaInput({
  deliverable: d,
  url,
  busy,
  readOnly,
  onUrl,
}: Props) {
  const detectPlatform = (link: string) => {
    if (!link) return null;
    const lower = link.toLowerCase();
    if (lower.includes('drive.google.com')) return { name: 'Google Drive', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (lower.includes('dropbox.com')) return { name: 'Dropbox', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    if (lower.includes('frame.io')) return { name: 'Frame.io', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    if (lower.includes('loom.com')) return { name: 'Loom Video', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' };
    if (lower.includes('onedrive') || lower.includes('1drv.ms') || lower.includes('sharepoint')) return { name: 'OneDrive', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
    if (lower.includes('wetransfer.com')) return { name: 'WeTransfer', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
    if (lower.includes('instagram.com')) return { name: 'Instagram', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' };
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { name: 'YouTube', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
    if (lower.includes('tiktok.com')) return { name: 'TikTok', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    if (lower.includes('x.com') || lower.includes('twitter.com')) return { name: 'X / Twitter', color: 'text-slate-300 bg-slate-800 border-white/20' };
    return { name: 'Cloud Storage / Deliverable Link', color: 'text-purple-300 bg-purple-500/10 border-purple-500/30' };
  };

  const detected = detectPlatform(url);
  const isValidHttps = /^https:\/\//i.test(url.trim());

  if (readOnly) {
    return (
      <div className="space-y-2 rounded-2xl bg-slate-950/70 border border-purple-500/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Link2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Deliverable Content Link</span>
          </div>
          {detected && (
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${detected.color}`}>
              {detected.name}
            </span>
          )}
        </div>
        <p className="text-xs font-mono text-purple-200 break-all bg-black/30 p-2.5 rounded-xl border border-white/5">
          {url}
        </p>
        <div className="pt-1 flex justify-end">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-purple-200 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Verify link opens in new tab</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Deliverable Content Link</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Google Drive, Dropbox, Frame.io, Loom, or Public Post
          </span>
        </label>

        <div className="relative">
          <input
            className={`${input} pl-10 pr-28 text-xs sm:text-sm font-medium`}
            type="url"
            value={url}
            disabled={busy}
            placeholder="https://drive.google.com/file/d/... or https://dropbox.com/..."
            onChange={(e) => onUrl(e.target.value)}
          />
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

          {isValidHttps && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title="Test link in new tab"
                className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center gap-1 transition"
              >
                <span>Test</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Supported Platform Badges */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400 pt-0.5">
        <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Cloud className="w-3 h-3 text-purple-400" /> Supported:
        </span>
        {['Google Drive', 'Dropbox', 'Frame.io', 'Loom', 'OneDrive', 'Live Social Post'].map((p) => (
          <span
            key={p}
            className="px-2 py-0.5 rounded-md bg-slate-950/70 border border-white/10 text-slate-300 font-medium"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Detected Provider Feedback Box */}
      {url && (
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white">Deliverable link ready</span>
              {detected && (
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${detected.color}`}>
                  {detected.name}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ensure permission is set to <strong>"Anyone with the link can view"</strong> so the brand can inspect your work without access requests.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
