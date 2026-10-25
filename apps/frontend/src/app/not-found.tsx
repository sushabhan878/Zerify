'use client';

import React from 'react';
import Lottie from 'lottie-react';
import notFoundAnimation from '../../public/lotifiles/Page Not Found 404.json';

export default function NotFound() {
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
