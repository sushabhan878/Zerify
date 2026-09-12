'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, CheckCheck, Clock, RotateCcw } from 'lucide-react';
import { MessageItem } from '@/services/messaging.service';
import FileMessage from './FileMessage';
import ImageMessage from './ImageMessage';

function DeliveryTick({ state }: { state?: MessageItem['deliveryState'] }) {
  if (state === 'SENDING') return <Clock className="w-3 h-3 text-white/60" />;
  if (state === 'READ') return <CheckCheck className="w-3 h-3 text-sky-300" />;
  if (state === 'FAILED') return <AlertCircle className="w-3 h-3 text-rose-200" />;
  return <Check className="w-3 h-3 text-white/70" />;
}

export default function MessageBubble({
  message,
  own,
  grouped,
  onRetry,
}: {
  message: MessageItem;
  own: boolean;
  grouped: boolean;
  onRetry: (clientMessageId: string) => void;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const attachment = message.attachments?.[0];
  const failed = message.deliveryState === 'FAILED';

  // Only the first bubble in a run gets the tail and the author name.
  const corner = own
    ? grouped
      ? 'rounded-2xl'
      : 'rounded-2xl rounded-tr-md'
    : grouped
      ? 'rounded-2xl'
      : 'rounded-2xl rounded-tl-md';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex flex-col ${own ? 'items-end' : 'items-start'} ${grouped ? 'mt-0.5' : 'mt-2.5'}`}
    >
      {!own && !grouped && message.sender?.name && (
        <span className="text-[11px] font-bold text-purple-300/90 mb-1 ml-1 select-none">
          {message.sender.name}
        </span>
      )}

      <div
        className={`max-w-[85%] sm:max-w-md px-3.5 py-2.5 text-xs space-y-1.5 ${corner} ${
          own
            ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/40'
            : 'bg-slate-900/90 border border-white/10 text-slate-100 shadow-md'
        } ${failed ? 'ring-1 ring-rose-500/60' : ''}`}
      >
        {message.content && (
          <p className="leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
        )}

        {attachment &&
          (message.type === 'IMAGE' ? (
            <ImageMessage attachment={attachment} />
          ) : (
            <FileMessage attachment={attachment} own={own} />
          ))}

        <div
          className={`flex items-center justify-end gap-1.5 text-[9.5px] font-semibold pt-0.5 ${
            own ? 'text-white/70' : 'text-slate-500'
          }`}
        >
          {failed && message.clientMessageId && (
            <button
              onClick={() => onRetry(message.clientMessageId!)}
              className="flex items-center gap-1 font-bold text-rose-200 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          )}
          <span>{time}</span>
          {own && <DeliveryTick state={message.deliveryState} />}
        </div>
      </div>
    </motion.div>
  );
}
