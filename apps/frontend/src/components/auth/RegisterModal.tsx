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
  Globe,
  AtSign,
  Phone,
} from 'lucide-react';

export default function RegisterModal() {
  // 4-Step Registration Workflow
  // Step 1: Role / Intent Choice ("I am an Influencer" vs "I am looking for Influencers")
  // Step 2: Auth Credentials (Name, Email, Password, Social Logins)
  // Step 3: Role-Specific Profile Details
  // Step 4: Account Created Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Role
  const [role, setRole] = useState<'BRAND' | 'INFLUENCER'>('INFLUENCER');

  // Auth Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Brand-specific fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');

  // Influencer-specific fields
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [category, setCategory] = useState('Fashion & Beauty');
  const [gender, setGender] = useState('Prefer not to say');
  const [openToAffiliate, setOpenToAffiliate] = useState(false);
  const [openToUgc, setOpenToUgc] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [pricingRange, setPricingRange] = useState('$100 - $500');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1: Confirm Role Choice & Advance to Credentials
  const handleSelectRole = (selectedRole: 'BRAND' | 'INFLUENCER') => {
    setRole(selectedRole);
    setErrorMessage('');
    setStep(2);
  };

  // Step 2: Validate Credentials & Advance to Profile Setup
  const handleStep2Submit = (e: React.FormEvent) => {
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

    // Auto-prefill defaults if blank
    if (!companyName) setCompanyName(fullName ? `${fullName}'s Brand` : '');
    if (!handle) setHandle(`@${fullName.toLowerCase().replace(/\s+/g, '') || 'creator'}`);

    setStep(3);
  };

  const handleGoogleRegister = () => {
    if (!fullName) setFullName('Google User');
    if (!email) setEmail('user@gmail.com');
    if (!companyName) setCompanyName('Google Business');
    if (!handle) setHandle('@googleuser');
    setStep(3);
  };

  // Step 3: Complete Registration via dedicated backend endpoints
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const endpoint = role === 'BRAND' ? `${apiUrl}/auth/brand/register` : `${apiUrl}/auth/influencer/register`;

      const payload =
        role === 'BRAND'
          ? {
              email,
              password,
              name: fullName,
              companyName: companyName || fullName || 'My Brand',
              website: website || undefined,
            }
          : {
              email,
              password,
              name: fullName,
              handle: handle.startsWith('@') ? handle : `@${handle}`,
              platform,
              category,
              gender,
              openToAffiliate,
              openToUgc,
              contactInfo: contactInfo || undefined,
              pricingRange,
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorText = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(errorText || 'Registration failed. Please check your credentials.');
      }

      if (data.accessToken) {
        localStorage.setItem('zerify_token', data.accessToken);
      }

      setStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your credentials.');
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
        {/* Progress Step Header */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden">
              <Image src="/logo.png" alt="Zerify Logo" width={28} height={28} className="object-contain" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">Zerify</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span className={`px-2 py-0.5 rounded-full ${step === 1 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'}`}>1. Role</span>
            <span>&rarr;</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 2 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'}`}>2. Auth</span>
            <span>&rarr;</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 3 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'}`}>3. Profile</span>
            <span>&rarr;</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 4 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500'}`}>4. Done</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: ROLE & INTENT SELECTION (FIRST WINDOW) */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to Zerify</h2>
                <p className="text-xs text-slate-400 mt-1.5">How do you plan to use the platform today?</p>
              </div>

              {/* High Visibility Selection Cards */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {/* Option A: Influencer / Creator */}
                <div
                  onClick={() => handleSelectRole('INFLUENCER')}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 group ${
                    role === 'INFLUENCER'
                      ? 'bg-pink-600/15 border-pink-500 shadow-xl shadow-pink-500/20 ring-1 ring-pink-500'
                      : 'bg-slate-900/60 border-white/10 hover:border-pink-500/40 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="p-3.5 rounded-2xl bg-pink-600/20 text-pink-400 border border-pink-500/30 group-hover:scale-105 transition-transform">
                    <Video className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">I am an Influencer</h3>
                      <ArrowRight className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Connect directly with top brands, receive campaign invitations, track stats, and get paid fast.
                    </p>
                  </div>
                </div>

                {/* Option B: Looking for Influencers (Brand / Agency) */}
                <div
                  onClick={() => handleSelectRole('BRAND')}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 group ${
                    role === 'BRAND'
                      ? 'bg-purple-600/15 border-purple-500 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500'
                      : 'bg-slate-900/60 border-white/10 hover:border-purple-500/40 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="p-3.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">I am looking for Influencers</h3>
                      <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Launch creator campaigns, send briefs, track campaign reach, and automate payouts without agency overhead.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-slate-400">
                Already registered?{' '}
                <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  Sign In to your account
                </Link>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CREDENTIALS & AUTH (SECOND WINDOW) */}
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
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change account type</span>
                </button>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Account Credentials</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${role === 'BRAND' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'}`}>
                    {role === 'BRAND' ? 'Looking for Influencers' : 'Influencer'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Enter your details to register as {role === 'BRAND' ? 'a Brand / Agency' : 'an Influencer'}.</p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Social Login Options */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 border border-white/10 hover:border-purple-500/40 text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all duration-200 shadow-md group"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

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
              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-slate-950 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                  or register with email
                </span>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleStep2Submit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Madison Blake"
                      required
                      className="w-full bg-slate-900/90 border border-white/10 focus:border-purple-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

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

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <span>Next: Profile Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: ROLE-SPECIFIC PROFILE SETUP (THIRD WINDOW) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to auth details</span>
                </button>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {role === 'BRAND' ? 'Brand Details' : 'Creator Profile Details'}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${role === 'BRAND' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'}`}>
                    {role === 'BRAND' ? 'Looking for Influencers' : 'Influencer'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {role === 'BRAND'
                    ? 'Configure your company details for campaign management.'
                    : 'Customize your influencer profile & collaboration preferences.'}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCompleteRegistration} className="space-y-3.5">
                {/* BRAND FORM FIELDS */}
                {role === 'BRAND' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Brand Name *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Studios Inc."
                          required
                          className="w-full bg-slate-900/90 border border-white/10 focus:border-purple-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL (Optional)</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://acmebrand.com"
                          className="w-full bg-slate-900/90 border border-white/10 focus:border-purple-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* INFLUENCER FORM FIELDS */
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Social Handle *</label>
                        <div className="relative">
                          <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            placeholder="@madisonblake"
                            required
                            className="w-full bg-slate-900/90 border border-white/10 focus:border-pink-500/50 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Platform</label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full bg-slate-900/90 border border-white/10 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="TikTok">TikTok</option>
                          <option value="YouTube">YouTube</option>
                          <option value="X (Twitter)">X (Twitter)</option>
                          <option value="Twitch">Twitch</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-slate-900/90 border border-white/10 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
                        >
                          <option value="Fashion & Beauty">Fashion & Beauty</option>
                          <option value="Tech & Gadgets">Tech & Gadgets</option>
                          <option value="Fitness & Health">Fitness & Health</option>
                          <option value="Lifestyle">Lifestyle</option>
                          <option value="Gaming">Gaming</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                          <option value="Travel">Travel</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-slate-900/90 border border-white/10 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
                        >
                          <option value="Prefer not to say">Prefer not to say</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Non-binary">Non-binary</option>
                        </select>
                      </div>
                    </div>

                    {/* Collaboration Options Checkboxes */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                      <span className="block text-[11px] font-bold text-pink-400 uppercase tracking-wider">Collaboration Types</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={openToAffiliate}
                            onChange={(e) => setOpenToAffiliate(e.target.checked)}
                            className="w-4 h-4 rounded accent-pink-600 bg-slate-900 border-white/10 cursor-pointer"
                          />
                          <span>Open for Affiliate</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={openToUgc}
                            onChange={(e) => setOpenToUgc(e.target.checked)}
                            className="w-4 h-4 rounded accent-pink-600 bg-slate-900 border-white/10 cursor-pointer"
                          />
                          <span>UGC Content Creation</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Info (Optional)</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            placeholder="+1 (555) 019-2834"
                            className="w-full bg-slate-900/90 border border-white/10 focus:border-pink-500/50 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Pricing Bracket</label>
                        <select
                          value={pricingRange}
                          onChange={(e) => setPricingRange(e.target.value)}
                          className="w-full bg-slate-900/90 border border-white/10 focus:border-pink-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
                        >
                          <option value="$50 - $200">$50 - $200</option>
                          <option value="$200 - $500">$200 - $500</option>
                          <option value="$500 - $1,500">$500 - $1,500</option>
                          <option value="$1,500 - $5,000">$1,500 - $5,000</option>
                          <option value="$5,000+">$5,000+</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS & CONFIRMATION (FOURTH WINDOW) */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-5 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Account Created!</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  Welcome aboard, <span className="text-white font-bold">{fullName || 'User'}</span>! Your{' '}
                  <span className="text-purple-400 font-bold">{role === 'BRAND' ? 'Brand / Agency' : 'Influencer'}</span> workspace is live.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Registered Email:</span>
                  <span className="text-white font-medium">{email || 'user@example.com'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Account Type:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-[11px]">
                    {role === 'BRAND' ? 'Looking for Influencers' : 'Influencer Network'}
                  </span>
                </div>
                {role === 'BRAND' && companyName && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Company Name:</span>
                    <span className="text-white font-medium">{companyName}</span>
                  </div>
                )}
                {role === 'INFLUENCER' && (
                  <>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Handle:</span>
                      <span className="text-pink-400 font-medium">{handle}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Category:</span>
                      <span className="text-white font-medium">{category}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Capabilities:</span>
                      <div className="flex items-center gap-1.5">
                        {openToAffiliate && <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Affiliate</span>}
                        {openToUgc && <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px]">UGC</span>}
                      </div>
                    </div>
                  </>
                )}
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
