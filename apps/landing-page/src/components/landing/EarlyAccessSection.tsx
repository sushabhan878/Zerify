'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Building2,
  Video,
  Loader2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { API_URL, APP_ROUTES } from '@/config/env';

export default function EarlyAccessSection() {
  const [role, setRole] = useState<'brand' | 'creator'>('brand');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(2840);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
        throw new Error(data.message || 'Failed to join waitlist. Please try again.');
      }

      setSubmitted(true);
      setMessage(data.message || 'Successfully joined the VIP waitlist!');
      setCount((prev) => prev + 1);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="py-24 relative overflow-hidden bg-[#07090E]">
      <div id="early-access" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Ambient Glowing Background Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-purple-600/20 via-pink-600/15 to-indigo-600/20 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative p-[1.5px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_70px_rgba(147,51,234,0.25)]">
          {/* Animated Conic Gradient Glow Rim */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,#c084fc,#f472b6,#818cf8,#38bdf8,#c084fc)] opacity-85 blur-[2px]"
          />

          {/* Main Card Content */}
          <div className="relative z-10 rounded-[2.4rem] bg-[#090d16]/95 border border-white/15 p-8 sm:p-12 lg:p-16 backdrop-blur-2xl text-center space-y-8">
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Priority VIP Queue • Limited Early Access</span>
            </div>

            {/* Title & Subtitle */}
            <div className="max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.2] [font-family:'Playfair_Display',Georgia,serif]">
                Get Early Access to the{' '}
                <span className="italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">
                  Zerify Platform
                </span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Join our exclusive VIP early access cohort. Brands get priority creator discovery and zero agency commission; creators get early campaign invitations and instant payouts.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="flex justify-center">
              <div className="inline-flex p-1.5 rounded-full bg-slate-900/90 border border-white/10 backdrop-blur-xl items-center gap-2 shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setRole('brand');
                    setSubmitted(false);
                    setErrorMsg('');
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    role === 'brand'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Brands &amp; Businesses</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('creator');
                    setSubmitted(false);
                    setErrorMsg('');
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    role === 'creator'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Creators &amp; Influencers</span>
                </button>
              </div>
            </div>

            {/* Waitlist Form or Success Card */}
            <div className="max-w-lg mx-auto w-full">
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
                      <p className="text-xs text-slate-300">
                        Priority queue spot #{count}. We will notify you at{' '}
                        <span className="text-white font-semibold">{email}</span> as soon as your access is activated.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Priority verified status
                    </span>
                    <a
                      href={APP_ROUTES.register}
                      className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Or create account now</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
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
                          ? 'Enter work email for early platform access...'
                          : 'Enter email to join creator network...'
                      }
                      required
                      disabled={loading}
                      className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 outline-none w-full disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-7 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 shrink-0 disabled:opacity-75 ${
                        role === 'brand'
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-purple-500/30'
                          : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 shadow-pink-500/30'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <span>Join Early Access</span>
                          <ArrowRight className="w-4 h-4" />
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

            {/* Bottom App Direct Access Callout */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-400" />
                Want direct access to Zerify Studio today?
              </span>
              <a
                href={APP_ROUTES.register}
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 hover:text-white transition-colors flex items-center gap-1 group"
              >
                <span>Launch in App (app.zerify.in)</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400 transform group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
