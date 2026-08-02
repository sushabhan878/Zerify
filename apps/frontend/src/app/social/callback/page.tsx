'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function SocialCallbackContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const count = searchParams.get('count');

  useEffect(() => {
    // Notify the parent opener window if available
    if (window.opener) {
      try {
        window.opener.postMessage(
          {
            type: 'ZERIFY_SOCIAL_CONNECTED',
            status,
            message,
            count,
          },
          '*',
        );
      } catch (err) {
        console.error('Could not postMessage to opener:', err);
      }
    }

    // Automatically close the popup window after 1.8 seconds
    const timer = setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [status, message, count]);

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-xl shadow-2xl space-y-5">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Social Account Connected!</h2>
              <p className="text-xs text-slate-300 mt-1">
                {count ? `${count} account(s) successfully linked.` : 'Your social account has been authenticated.'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Connection Failed</h2>
              <p className="text-xs text-rose-300 mt-1">
                {message ? decodeURIComponent(message) : 'An error occurred during authentication.'}
              </p>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span>Finalizing authentication & closing window...</span>
        </div>
      </div>
    </div>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <SocialCallbackContent />
    </Suspense>
  );
}
