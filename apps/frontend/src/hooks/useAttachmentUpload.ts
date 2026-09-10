'use client';

import { useCallback, useRef, useState } from 'react';
import { MessageItem, MessagingService } from '@/services/messaging.service';
import { UploadState } from '@/components/dashboard/messaging/FileUploadProgress';

export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

/**
 * Direct-to-Cloudinary upload. The file never passes through our API; the
 * backend only signs the request and then confirms the result (PRD §23).
 */
export function useAttachmentUpload(
  conversationId: string | null,
  onMessage: (message: MessageItem) => void,
) {
  const [upload, setUpload] = useState<UploadState | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const cancel = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setUpload(null);
  }, []);

  const start = useCallback(
    async (file: File) => {
      if (!conversationId) return;

      if (file.size > MAX_ATTACHMENT_BYTES) {
        setUpload({
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
          error: 'File exceeds the 25 MB limit',
        });
        return;
      }

      setUpload({ fileName: file.name, fileSize: file.size, progress: 0, error: null });

      try {
        const target = await MessagingService.requestUploadUrl(conversationId, {
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
        });

        const form = new FormData();
        form.append('file', file);
        form.append('api_key', target.upload.apiKey);
        for (const [key, value] of Object.entries(target.upload.params)) {
          form.append(key, String(value));
        }

        const response = await new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;
          xhr.open('POST', target.upload.uploadUrl);

          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const progress = Math.round((event.loaded / event.total) * 100);
            setUpload((prev) => (prev ? { ...prev, progress } : prev));
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                reject(new Error('Upload response could not be read'));
              }
            } else {
              reject(new Error('Upload rejected by storage provider'));
            }
          };
          xhr.onerror = () => reject(new Error('Network error during upload'));
          xhr.onabort = () => reject(new Error('ABORTED'));

          xhr.send(form);
        });

        xhrRef.current = null;

        const result = await MessagingService.completeUpload(
          conversationId,
          target.attachmentId,
          { publicId: response.public_id, bytes: response.bytes ?? file.size },
        );

        onMessage(result.message);
        setUpload(null);
      } catch (error: any) {
        if (error?.message === 'ABORTED') {
          setUpload(null);
          return;
        }
        setUpload((prev) =>
          prev
            ? { ...prev, error: error?.message || 'Upload failed' }
            : { fileName: file.name, fileSize: file.size, progress: 0, error: 'Upload failed' },
        );
      }
    },
    [conversationId, onMessage],
  );

  return { upload, start, cancel };
}
