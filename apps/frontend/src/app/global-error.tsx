'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#07090e] text-white min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0b0f19] border border-purple-500/20 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Application Error</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error?.message || 'A critical error occurred. Please refresh or try again.'}
            </p>
          </div>

          <button
            onClick={() => reset()}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
