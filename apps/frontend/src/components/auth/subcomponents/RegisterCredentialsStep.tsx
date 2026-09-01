'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import AuthGoogleButton from './AuthGoogleButton';
import AuthAlert from './AuthAlert';

interface RegisterCredentialsStepProps {
  role: 'BRAND' | 'INFLUENCER';
  companyName: string;
  setCompanyName: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onGoogleRegister: () => void;
}

export default function RegisterCredentialsStep({
  role,
  companyName,
  setCompanyName,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  errorMessage,
  onSubmit,
  onBack,
  onGoogleRegister,
}: RegisterCredentialsStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSendEmailOtp = () => {
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address first.');
      return;
    }
    setEmailError('');
    setVerifyingEmail(true);

    setTimeout(() => {
      setVerifyingEmail(false);
      setOtpSent(true);
    }, 1200);
  };

  const handleConfirmOtp = () => {
    if (otpCode.length < 4) {
      setEmailError('Please enter the verification code sent to your email.');
      return;
    }
    setEmailError('');
    setEmailVerified(true);
    setOtpSent(false);
  };

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Title Centered with Landing Page Typography */}
      <div className="text-center mb-3">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
          Create Your <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">Credentials</span>
        </h2>
      </div>

      {/* Business Email Verified Badge Note Banner (For Brand role only) */}
      {role === 'BRAND' && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-3 shadow-inner">
          <ShieldCheck className="w-4.5 h-4.5 text-purple-400 flex-shrink-0" />
          <p className="leading-snug">
            Use your official <span className="font-bold text-white">business email</span> address to earn your <span className="font-bold text-purple-300">Verified Account Badge</span> upon sign-up.
          </p>
        </div>
      )}

      <AuthAlert message={errorMessage} />

      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* 1st Option: Brand Name or Creator Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {role === 'BRAND' ? 'Brand Name / Agency Name' : 'Creator Name'}
          </label>
          <div className="relative">
            {role === 'BRAND' ? (
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            ) : (
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            )}
            <input
              type="text"
              required
              value={role === 'BRAND' ? companyName : fullName}
              onChange={(e) => {
                if (role === 'BRAND') {
                  setCompanyName(e.target.value);
                } else {
                  setFullName(e.target.value);
                  setCompanyName(e.target.value);
                }
              }}
              placeholder={role === 'BRAND' ? 'Acme Corp / Apex Media' : 'Jane Creator / @mycreatorbrand'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* 2nd Option: Your Name (Representative Name for Brands only) */}
        {role === 'BRAND' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe (Marketing Lead)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* 3rd Option: Email Address + Verify Email Button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            {emailVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            ) : null}
          </div>

          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              disabled={emailVerified}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailVerified(false);
                setOtpSent(false);
              }}
              placeholder={role === 'BRAND' ? 'jane@brand.com' : 'jane@creator.com'}
              className="w-full pl-10 pr-28 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-80"
            />

            {!emailVerified ? (
              <button
                type="button"
                disabled={verifyingEmail || !email}
                onClick={handleSendEmailOtp}
                className="absolute right-1.5 px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-[11px] font-bold text-purple-200 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {verifyingEmail ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-purple-300" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Verify Email</span>
                )}
              </button>
            ) : null}
          </div>

          {/* OTP Code Verification Field */}
          {otpSent && !emailVerified && (
            <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-[11px] text-purple-200 font-medium">
                Enter 6-digit verification code sent to <span className="font-bold text-white">{email}</span>:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono tracking-widest outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleConfirmOtp}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md transition-all"
                >
                  Verify Code
                </button>
              </div>
            </div>
          )}

          {emailError && <p className="text-rose-400 text-[11px] mt-1 font-semibold">{emailError}</p>}
        </div>

        {/* 4th Option: Set Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Set Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
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
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
        >
          <span>Continue to Profile Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative px-3 bg-[#090D16] text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Or Quick Signup
        </span>
      </div>

      <AuthGoogleButton onClick={onGoogleRegister} label="Continue with Google" />
    </motion.div>
  );
}
