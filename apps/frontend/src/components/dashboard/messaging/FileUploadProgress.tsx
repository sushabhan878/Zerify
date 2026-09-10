'use client';

import React from 'react';
import { X } from 'lucide-react';
import { formatFileSize } from './FileMessage';

export interface UploadState {
  fileName: string;
  fileSize: number;
  progress: number;
  error?: string | null;
}

export default function FileUploadProgress({
  upload,
  onCancel,
}: {
  upload: UploadState;
  onCancel: () => void;
}) {
  return (
    <div className="px-3.5 pt-3 space-y-1.5">
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-white/10">
        <span className="flex-1 min-w-0">
          <span className="block text-[11px] font-bold text-white truncate">
            {upload.fileName}
          </span>
          <span className="block text-[10px] text-slate-400 font-medium">
            {upload.error
              ? upload.error
              : `${formatFileSize(upload.fileSize)} · ${upload.progress}%`}
          </span>
        </span>
        <button
          onClick={onCancel}
          aria-label="Cancel upload"
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-1 rounded-full bg-slate-900 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            upload.error ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}
          style={{ width: `${upload.error ? 100 : upload.progress}%` }}
        />
      </div>
    </div>
  );
}
