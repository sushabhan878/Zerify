'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LottieLoader from '@/components/ui/LottieLoader';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import FeatureGrid from '@/components/landing/FeatureGrid';
import ComparisonSection from '@/components/landing/ComparisonSection';
import FaqSection from '@/components/landing/FaqSection';
import Footer from '@/components/landing/Footer';
import NotificationToast from '@/components/landing/NotificationToast';

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

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
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-[#07090E] min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white">
        <LottieLoader size={220} message="Loading Zerify Studio..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeatureGrid />
        <ComparisonSection />
        <FaqSection />
      </main>
      <Footer />
      <NotificationToast />
    </div>
  );
}
