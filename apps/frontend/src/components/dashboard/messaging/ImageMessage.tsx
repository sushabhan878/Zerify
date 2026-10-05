'use client';

import React, { useEffect, useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { AttachmentItem, MessagingService } from '@/services/messaging.service';
import { formatFileSize } from './FileMessage';

/**
 * Inline preview for image attachments. The URL is signed and short-lived, so
 * it is resolved when the bubble mounts rather than stored on the message.
 */
export default function ImageMessage({ attachment }: { attachment: AttachmentItem }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (attachment.status !== 'AVAILABLE') return;
    let cancelled = false;

    MessagingService.getDownloadUrl(attachment.id)
      .then((res) => {
        if (!cancelled) setUrl(res.url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [attachment.id, attachment.status]);

  if (failed) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-white/10">
        <ImageOff className="w-4 h-4 text-slate-500" />
        <span className="text-[11px] font-semibold text-slate-400">Preview unavailable</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-950/60 min-h-[120px] flex items-center justify-center">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={attachment.fileName}
            className="max-h-64 w-auto object-contain cursor-zoom-in"
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            onError={() => setFailed(true)}
          />
        ) : (
          <Loader2 className="w-4 h-4 text-purple-300 animate-spin" />
        )}
      </div>
      <span className="block text-[10px] text-slate-400 font-medium truncate">
        {attachment.fileName} · {formatFileSize(attachment.fileSize)}
      </span>
    </div>
  );
}
