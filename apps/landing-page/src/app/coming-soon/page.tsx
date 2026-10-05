'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Video,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { API_URL } from '@/config/env';

export default function ComingSoonPage() {
  const [role, setRole] = useState<'brand' | 'creator'>('brand');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [waitlistSpot, setWaitlistSpot] = useState(2841);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/vip-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          type: role === 'brand' ? 'BRAND' : 'INFLUENCER',
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to join waitlist. Please try again.');
      }

      setSubmitted(true);
      setMessage(data.message || 'You have successfully secured your spot in the VIP Queue!');
      setWaitlistSpot((prev) => prev + 1);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-purple-900/20 via-pink-900/15 to-indigo-900/20 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 max-w-6xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt="Zerify Logo"
              width={40}
              height={40}
              className="object-contain w-full h-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Zerify</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </header>

      {/* Center Content Card */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 w-full py-12">
        <div className="relative p-[1.5px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_70px_rgba(147,51,234,0.25)]">
          {/* Animated Glow Border */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,#c084fc,#f472b6,#818cf8,#38bdf8,#c084fc)] opacity-85 blur-[2px]"
          />

          <div className="relative z-10 rounded-[2.4rem] bg-[#090d16]/95 border border-white/15 p-8 sm:p-12 backdrop-blur-2xl text-center space-y-6">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold tracking-wide">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Private Beta • Invite Only Access</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-[1.2] [font-family:'Playfair_Display',Georgia,serif]">
                We are Launching the{' '}
                <span className="italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">
                  Zerify Platform
                </span>{' '}
                Soon
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                We are currently onboarding selected brands and creator partners in private beta. Direct registration will open publicly very soon.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="flex justify-center pt-2">
              <div className="inline-flex p-1.5 rounded-full bg-slate-900/90 border border-white/10 backdrop-blur-xl items-center gap-2 shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setRole('brand');
                    setSubmitted(false);
                    setErrorMsg('');
                  }}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                    role === 'brand'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Brands &amp; Businesses</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('creator');
                    setSubmitted(false);
                    setErrorMsg('');
                  }}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                    role === 'creator'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Creators &amp; Influencers</span>
                </button>
              </div>
            </div>

            {/* Waitlist Form or Success Message */}
            <div className="w-full pt-2">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl text-left shadow-2xl space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {message || 'You are on the VIP Waitlist!'}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Queue spot #{waitlistSpot}. We will send your private invite code to{' '}
                        <span className="text-white font-semibold">{email}</span> as soon as your batch is activated.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Priority beta status confirmed
                    </span>
                    <Link
                      href="/"
                      className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Explore Features</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <form
                    onSubmit={handleSubmit}
                    className="relative flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-2xl focus-within:border-purple-500/60 transition-all"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === 'brand'
                          ? 'Enter work email to request brand access...'
                          : 'Enter email to join creator network...'
                      }
                      required
                      disabled={loading}
                      className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 outline-none w-full disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 shrink-0 disabled:opacity-75 ${
                        role === 'brand'
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-purple-500/30'
                          : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 shadow-pink-500/30'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Requesting...</span>
                        </>
                      ) : (
                        <>
                          <span>Request Invite</span>
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {errorMsg && (
                    <p className="text-rose-400 text-xs font-semibold px-2 animate-pulse text-left">
                      {errorMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Partner Info Footer */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-pink-400" />
                Over 2,800+ creators and brands in queue
              </span>
              <span>Need priority assistance? team@zerify.in</span>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 max-w-6xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Zerify Inc. All rights reserved.
      </footer>
    </div>
  );
}
