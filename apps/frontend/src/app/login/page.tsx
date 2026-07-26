'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';

export default function LoginPage() {
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
        <span className="text-xs text-slate-400 font-semibold tracking-wide">Loading Zerify...</span>
      </div>
    );
  }
  return (
    <main className="relative min-h-screen bg-[#07090E] flex flex-col justify-between overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Motion Background Graphics */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

      {/* Motion Background Glowing Spheres */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.35, 0.15],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/6 left-1/5 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1],
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/6 right-1/5 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[140px] pointer-events-none"
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

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
          <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-purple-300 transition-colors">
            Zerify
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Login View */}
      <section className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full">
          <LoginModal />
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Zerify Inc. All rights reserved. •{' '}
        <Link href="#" className="hover:text-slate-300 transition-colors">
          Privacy Policy
        </Link>{' '}
        •{' '}
        <Link href="#" className="hover:text-slate-300 transition-colors">
          Terms of Service
        </Link>
      </footer>
    </main>
  );
}
