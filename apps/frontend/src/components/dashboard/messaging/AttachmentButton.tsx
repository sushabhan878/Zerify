'use client';

import React, { useRef } from 'react';
import { Paperclip } from 'lucide-react';

/** Mirrors the server allowlist so an obvious reject never costs a round trip. */
const ACCEPT = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'video/mp4',
  'video/quicktime',
].join(',');

export default function AttachmentButton({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          // Reset so picking the same file twice still fires a change event.
          e.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-label="Attach a file"
        title="Attach a file (max 25 MB)"
        className="w-10 h-10 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
      >
        <Paperclip className="w-4 h-4" />
      </button>
    </>
  );
}
