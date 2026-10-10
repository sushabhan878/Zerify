'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LottieLoader from '@/components/ui/LottieLoader';

export default function PaymentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=payments');
  }, [router]);

  return (
    <div className="h-screen w-screen bg-[#07090E] flex flex-col items-center justify-center text-white">
      <LottieLoader size={200} message="Redirecting to Payments..." />
    </div>
  );
}
