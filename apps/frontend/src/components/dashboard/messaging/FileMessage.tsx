'use client';

import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { AttachmentItem, MessagingService } from '@/services/messaging.service';

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileMessage({
  attachment,
  own,
}: {
  attachment: AttachmentItem;
  own: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The signed URL is fetched on click and used immediately — it expires in
  // ~5 minutes, so caching it in state would only hand out stale links.
  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await MessagingService.getDownloadUrl(attachment.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setError('Download unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleDownload}
        disabled={loading || attachment.status !== 'AVAILABLE'}
        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-colors disabled:opacity-60 ${
          own
            ? 'bg-slate-950/50 border-white/15 hover:bg-slate-950/70'
            : 'bg-slate-950/60 border-white/10 hover:bg-slate-950/80'
        }`}
      >
        <FileText className="w-4 h-4 text-purple-400 shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block text-[11px] font-bold text-white truncate">
            {attachment.fileName}
          </span>
          <span className="block text-[10px] text-slate-400 font-medium">
            {formatFileSize(attachment.fileSize)}
          </span>
        </span>
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-purple-300 animate-spin shrink-0" />
        ) : (
          <Download className="w-3.5 h-3.5 text-purple-300 shrink-0" />
        )}
      </button>
      {error && <span className="text-[10px] font-semibold text-rose-400">{error}</span>}
    </div>
  );
}
