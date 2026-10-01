'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LottieLoader from '@/components/ui/LottieLoader';

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('zerify_token');
      const storedUser = localStorage.getItem('zerify_user');

      if (storedToken && storedUser) {
        router.replace('/dashboard');
        return;
      }
    } catch {
      // Ignore localStorage errors
    }
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white">
      <LottieLoader size={220} message="Loading Zerify Studio..." />
    </div>
  );
}
