'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LottieLoader from '@/components/ui/LottieLoader';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import PlatformShowcase from '@/components/landing/PlatformShowcase';
import TestimonialCta from '@/components/landing/TestimonialCta';
import MotionFeatures from '@/components/landing/MotionFeatures';
import HowItWorksSteps from '@/components/landing/HowItWorksSteps';
import ComparisonSection from '@/components/landing/ComparisonSection';
import FaqSection from '@/components/landing/FaqSection';
import Footer from '@/components/landing/Footer';

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
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white">
        <LottieLoader size={220} message="Loading Zerify Studio..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        {/* Top Hero Section with Dot Grid */}
        <Hero />

        {/* Continuous Seamless Content Canvas for Post-Hero Sections */}
        <div className="relative bg-[#07090E] overflow-hidden">
          {/* Subtle Ambient Continuous Background Lighting Mesh */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[80%] bg-gradient-to-b from-purple-900/10 via-pink-900/5 to-indigo-900/10 blur-[180px] pointer-events-none" />

          <PlatformShowcase />
          <TestimonialCta />
          <MotionFeatures />
          <HowItWorksSteps />
          <ComparisonSection />
          <FaqSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
