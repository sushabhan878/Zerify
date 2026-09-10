'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import AttachmentButton from './AttachmentButton';

export const MAX_MESSAGE_LENGTH = 10000;
/** Show the counter only when the user is genuinely near the ceiling. */
const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 500;

interface Props {
  disabled: boolean;
  uploading: boolean;
  onSend: (content: string) => void;
  onTyping: (typing: boolean) => void;
  onPickFile: (file: File) => void;
}

export default function MessageComposer({
  disabled,
  uploading,
  onSend,
  onTyping,
  onPickFile,
}: Props) {
  const [text, setText] = useState('');
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow with content up to the max-height, then scroll internally.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  useEffect(() => () => {
    if (stopTimer.current) clearTimeout(stopTimer.current);
  }, []);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed.slice(0, MAX_MESSAGE_LENGTH));
    setText('');
    onTyping(false);
  };

  const handleChange = (value: string) => {
    setText(value);
    onTyping(true);

    // Mirror the server's typing TTL so the peer's indicator clears on idle.
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => onTyping(false), 2500);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="p-3 border-t border-white/10 bg-slate-950/50 backdrop-blur-xl shrink-0"
    >
      <div className="flex items-end gap-2">
        <AttachmentButton disabled={disabled || uploading} onPick={onPickFile} />

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            disabled={disabled}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder={disabled ? 'Select a conversation to start typing' : 'Write a message…'}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => onTyping(false)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter inserts a newline.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none overflow-y-auto disabled:opacity-60"
          />
          {text.length > COUNTER_THRESHOLD && (
            <span className="absolute right-3 -top-5 text-[10px] font-bold text-amber-400">
              {MAX_MESSAGE_LENGTH - text.length} left
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-black text-white shadow-lg shadow-purple-950/50 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      <span className="hidden sm:block mt-1.5 px-1 text-[9.5px] font-medium text-slate-600">
        Enter to send · Shift+Enter for a new line · 25 MB max per file
      </span>
    </form>
  );
}
