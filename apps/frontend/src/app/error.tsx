'use client';

import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import notFoundAnimation from '../../public/lotifiles/Page Not Found 404.json';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App-level runtime error:', error);
    // Auto-reload to fetch fresh chunk hashes if Webpack chunks are stale or out of sync
    if (
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError') ||
      error?.name === 'ChunkLoadError'
    ) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#07090e] flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-2xl flex items-center justify-center">
        <Lottie
          animationData={notFoundAnimation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
