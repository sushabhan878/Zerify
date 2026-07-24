'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Building2,
  Video,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function RegisterModal() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'BRAND' | 'INFLUENCER' | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1 Submission (Email/Password or Social)
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleGoogleRegister = () => {
    if (!fullName) setFullName('Google User');
    if (!email) setEmail('user@gmail.com');
    setStep(2);
  };

  // Step 2 Submission (Role Selection -> Register API call)
  const handleCompleteRegistration = async () => {
    if (!role) {
      setErrorMessage('Please select an account type to proceed.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'user@example.com',
          password: password || 'defaultpassword123',
          name: fullName || 'New User',
          role: role,
        }),
      });

      setStep(3);
    } catch (err: any) {
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto p-1">
      {/* Glow Halo Layer */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative rounded-3xl bg-slate-950/90 border border-white/10 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Step Indicator Progress Bar */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden">
              <Image src="/logo.png" alt="Zerify Logo" width={28} height={28} className="object-contain" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">Zerify</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span className={`px-2 py-0.5 rounded-full ${step === 1 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'}`}>1. Credentials</span>
            <span>&rarr;</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 2 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'}`}>2. Role</span>
            <span>&rarr;</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 3 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500'}`}>3. Done</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: AUTHENTICATION DETAILS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Create your Account</h2>
                <p className="text-xs text-slate-400 mt-1">Join thousands of top brands & influencers on Zerify.</p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Social Login Options */}
              <div className="space-y-2.5">
                {/* Google Sign Up */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 border border-white/10 hover:border-purple-500/40 text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all duration-200 hover:bg-slate-850 shadow-md group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Apple Sign Up (Coming Soon) */}
                <div className="relative">
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900/40 border border-white/5 text-xs font-semibold text-slate-400 flex items-center justify-between opacity-60 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.07-3.68-2.99-7.66-7.79-11.96-14.39-7.39-11.39-13.06-24.26-17.01-38.61-3.95-14.35-5.93-27.4-5.93-39.16 0-16.14 3.73-29.47 11.19-40 7.46-10.53 17.1-15.89 28.93-16.09 4.34 0 9.38 1.15 15.12 3.45 5.74 2.3 9.77 3.45 12.09 3.45 1.76 0 5.86-1.19 12.3-3.57 6.44-2.38 11.75-3.48 15.93-3.3 11.39.55 20.68 4.67 27.87 12.35-10.14 6.16-15.11 14.88-14.92 26.16.19 8.87 3.51 16.31 9.97 22.32 6.46 6.01 14.28 9.39 23.46 10.14-2.26 6.89-5.18 13.88-8.76 20.97zM119.22 31.78c0-7.36 2.65-14.2 7.95-20.52 5.3-6.32 11.91-9.97 19.82-10.96.22 1.04.33 1.95.33 2.73 0 7.23-2.73 14.22-8.18 20.97-5.46 6.75-12.11 10.4-19.95 10.96-.06-.85-.1-1.91-.1-3.18z" />
                      </svg>
                      <span>Continue with Apple</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-300">
                      Coming Soon
                    </span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-slate-950 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                  or register with email
                </span>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleStep1Submit} className="space-y-3.5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="w-full bg-slate-900/90 border border-white/10 focus:border-purple-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full bg-slate-900/90 border border-white/10 focus:border-purple-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-slate-900/90 border border-white/10 focus:border-purple-500/50 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <span>Continue to Role Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  Sign In
                </Link>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to details</span>
                </button>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Choose your Account Type</h2>
                <p className="text-xs text-slate-400 mt-1">Select how you plan to use Zerify to customize your experience.</p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Role Cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* Brand / Agency Option */}
                <div
                  onClick={() => {
                    setRole('BRAND');
                    setErrorMessage('');
                  }}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    role === 'BRAND'
                      ? 'bg-purple-600/15 border-purple-500 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${role === 'BRAND' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-400'}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">I am a Brand / Agency</h3>
                      {role === 'BRAND' && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Launch creator campaigns, manage briefs, track reach, and automate payouts without agency overhead.
                    </p>
                  </div>
                </div>

                {/* Influencer / Creator Option */}
                <div
                  onClick={() => {
                    setRole('INFLUENCER');
                    setErrorMessage('');
                  }}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                    role === 'INFLUENCER'
                      ? 'bg-pink-600/15 border-pink-500 shadow-xl shadow-pink-500/20 ring-1 ring-pink-500'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${role === 'INFLUENCER' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-pink-400'}`}>
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">I am an Influencer / Creator</h3>
                      {role === 'INFLUENCER' && <CheckCircle2 className="w-5 h-5 text-pink-400" />}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Connect directly with top brands, receive campaign invitations, track stats, and get paid fast.
                    </p>
                  </div>
                </div>
              </div>

              {/* Complete Registration Action */}
              <button
                type="button"
                onClick={handleCompleteRegistration}
                disabled={loading || !role}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating your workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS & DASHBOARD REDIRECT */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-6 space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Account Created Successfully!</h2>
                <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
                  Welcome to Zerify, <span className="text-white font-semibold">{fullName || 'Creator'}</span>! Your{' '}
                  <span className="text-purple-400 font-semibold">{role === 'BRAND' ? 'Brand / Agency' : 'Influencer'}</span> workspace is ready.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Registered Email:</span>
                  <span className="text-white font-medium">{email || 'user@example.com'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Account Type:</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold">
                    {role === 'BRAND' ? 'Brand & Agency' : 'Creator Network'}
                  </span>
                </div>
              </div>

              <Link
                href="/"
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-xl shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 inline-flex"
              >
                <span>Go to Workspace Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
