'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Play, Star, TrendingUp, ShieldCheck, Users, Zap } from 'lucide-react';

export default function Hero() {
  const [role, setRole] = useState<'brand' | 'creator'>('brand');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(2840);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 42,
    hours: 14,
    minutes: 38,
    seconds: 12,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setCount((prev) => prev + 1);
  };

  return (
    <section id="waitlist" className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden">
      {/* Dynamic Background Glow & Grid */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Announcement Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-purple-300 shadow-xl hover:border-purple-500/30 transition-all cursor-pointer">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <span>🔥 The Billo-Evolution for eCommerce Brands & Influencers</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          </div>
        </div>

        {/* Hero Title & Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            High-Converting UGC Videos.{' '}
            <span className="text-gradient-accent block mt-2">
              Powered by AI Creator Matching.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Zerify connects fast-growing eCommerce brands with vetted content creators. Get custom video ads for TikTok, Instagram Reels, & Shorts in under 5 days.
          </p>

          {/* Interactive Role Switcher Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="p-1.5 rounded-full bg-slate-900/90 border border-white/10 backdrop-blur-xl flex items-center gap-2 shadow-2xl">
              <button
                type="button"
                onClick={() => setRole('brand')}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  role === 'brand'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏢 I'm a Brand / Business
              </button>
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  role === 'creator'
                    ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white shadow-lg shadow-pink-500/30 scale-105'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎬 I'm a Creator / Influencer
              </button>
            </div>
          </div>

          {/* Waitlist Signup Form */}
          <div className="mt-8 max-w-xl mx-auto">
            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl text-center animate-fade-in shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">You're on the VIP Waitlist! 🎉</h3>
                <p className="text-sm text-slate-300 mt-1">
                  We'll notify you first when Zerify launches. Get ready for 50% off your first creator campaign.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300">
                  <span>Priority Queue Position #{count}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl focus-within:border-purple-500/50 transition-all">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === 'brand'
                      ? 'Enter your work email for early access...'
                      : 'Enter email to join creator monetization program...'
                  }
                  required
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 outline-none w-full"
                />
                <button
                  type="submit"
                  className={`px-7 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    role === 'brand'
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-purple-500/30'
                      : 'bg-gradient-to-r from-pink-600 via-amber-500 to-pink-600 hover:opacity-90 shadow-pink-500/30'
                  }`}
                >
                  <span>Join Waitlist</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="mt-8 flex items-center justify-center gap-6 text-slate-400 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-[#07090E]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Creator" />
                <img className="w-7 h-7 rounded-full border-2 border-[#07090E]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Creator" />
                <img className="w-7 h-7 rounded-full border-2 border-[#07090E]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Creator" />
                <img className="w-7 h-7 rounded-full border-2 border-[#07090E]" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Creator" />
              </div>
              <span className="font-bold text-white">{count.toLocaleString()}+</span> Brands & Creators on Waitlist
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="hidden sm:flex items-center gap-1.5 text-amber-400 font-semibold">
              <div className="flex text-amber-400">
                {'★'.repeat(5)}
              </div>
              <span className="text-white">4.9/5</span> Rating
            </div>
          </div>
        </div>

        {/* Countdown Timer Bar */}
        <div className="mt-12 max-w-2xl mx-auto p-4 rounded-2xl glass-card text-center flex items-center justify-around">
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Days</span>
          </div>
          <span className="text-slate-600 font-bold text-xl">:</span>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Hours</span>
          </div>
          <span className="text-slate-600 font-bold text-xl">:</span>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Minutes</span>
          </div>
          <span className="text-slate-600 font-bold text-xl">:</span>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">Seconds</span>
          </div>
        </div>

        {/* Billo-Style Interactive Floating Creator Demo Display */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="relative group rounded-3xl overflow-hidden glass-card glass-card-hover p-5 border border-white/10">
            <div className="relative h-64 rounded-2xl overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80"
                alt="Beauty Creator"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-pink-500 text-pink-500" />
                <span>TikTok UGC</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm">Elena Rostova</h4>
                  <p className="text-xs text-pink-400 font-medium">Beauty & Skincare Specialist</p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>3.8x ROAS</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 (124 ads)</span>
              <span className="text-purple-400 font-bold">Matched in 12s</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group rounded-3xl overflow-hidden glass-card glass-card-hover p-5 border border-white/10 md:-translate-y-4">
            <div className="relative h-64 rounded-2xl overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80"
                alt="Tech Creator"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-purple-500 text-purple-500" />
                <span>Reels Unboxing</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm">Marcus Vance</h4>
                  <p className="text-xs text-purple-400 font-medium">Tech & Gadgets Reviewer</p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-extrabold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>1.4M Views</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 5.0 (98 ads)</span>
              <span className="text-pink-400 font-bold">Turnaround 3 Days</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative group rounded-3xl overflow-hidden glass-card glass-card-hover p-5 border border-white/10">
            <div className="relative h-64 rounded-2xl overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80"
                alt="Fitness Creator"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                <span>Shorts Workout</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm">Sophia Martinez</h4>
                  <p className="text-xs text-indigo-400 font-medium">Fitness & Wellness Influencer</p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>4.2x ROAS</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.95 (160 ads)</span>
              <span className="text-purple-400 font-bold">Escrow Protection</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
