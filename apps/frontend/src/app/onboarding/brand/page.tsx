'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BrandOnboardingWizard from '@/components/onboarding/BrandOnboardingWizard';
import InteractiveDotGrid from '@/components/landing/InteractiveDotGrid';
import { ArrowLeft } from 'lucide-react';

export default function BrandOnboardingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('zerify_token');
      if (!storedToken) {
        router.replace('/login');
        return;
      }
    } catch {
      // Ignore
    }
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white">
        <p className="text-xs font-semibold text-slate-400">Verifying session...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#07090E] light:bg-[#F1F3F7] flex flex-col justify-between overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Background Interactive Elements */}
      <InteractiveDotGrid />
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none opacity-80 light:opacity-30" />
      <div className="absolute inset-0 dashboard-grid-pattern opacity-40 light:opacity-60 pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Zerify Logo"
              width={40}
              height={40}
              className="object-contain w-full h-full"
            />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white light:text-slate-900 group-hover:text-purple-300 light:group-hover:text-purple-600 transition-colors">
            Zerify
          </span>
        </Link>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 light:bg-white border border-white/10 light:border-slate-200 text-xs font-semibold text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 light:text-purple-600" />
          <span>Skip to Dashboard</span>
        </button>
      </header>

      {/* Wizard Content */}
      <section className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <BrandOnboardingWizard />
      </section>

      {/* Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Zerify Inc. All rights reserved. • Enterprise Brand Portal
      </footer>
    </main>
  );
}
