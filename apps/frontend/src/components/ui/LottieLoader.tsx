'use client';

import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../../public/mkhcf9LFNK.json';

interface LottieLoaderProps {
  size?: number;
  message?: string;
  className?: string;
}

export default function LottieLoader({
  size = 180,
  message = 'Loading...',
  className = '',
}: LottieLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {message && (
        <span className="text-xs font-extrabold text-purple-300/80 mt-2 tracking-wider uppercase animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
}
