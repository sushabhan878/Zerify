'use client';

import React from 'react';
import LottieLoader from '@/components/ui/LottieLoader';

export default function CompanyLoadingSkeleton() {
  return (
    <div className="py-24 flex items-center justify-center">
      <LottieLoader size={200} message="" />
    </div>
  );
}
