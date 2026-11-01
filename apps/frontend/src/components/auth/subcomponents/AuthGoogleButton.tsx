'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGoogleButtonProps {
  onClick: () => void;
  label?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function AuthGoogleButton({
  onClick,
  label = 'Sign in with Google',
  isLoading = false,
  disabled = false,
}: AuthGoogleButtonProps) {
  return (
    <button
      type="button"
      disabled={isLoading || disabled}
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-slate-900 light:bg-white border border-white/10 light:border-slate-200 hover:border-white/20 light:hover:border-slate-300 light:hover:bg-slate-50 text-xs font-semibold text-slate-200 light:text-slate-700 hover:text-white light:hover:text-slate-900 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-purple-400 light:text-purple-600" />
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9c-.4-.9-.6-1.9-.6-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
          />
        </svg>
      )}
      <span>{isLoading ? 'Connecting to Google...' : label}</span>
    </button>
  );
}
