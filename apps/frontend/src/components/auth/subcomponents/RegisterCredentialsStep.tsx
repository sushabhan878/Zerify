'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import AuthGoogleButton from './AuthGoogleButton';
import AuthAlert from './AuthAlert';
import { isPublicEmail } from '@/lib/email-validator';
import { useToast } from '@/components/ui/Toast';

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
  emailVerified: boolean;
  setEmailVerified: (val: boolean) => void;
  onVerificationTokenChange?: (token?: string) => void;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onGoogleRegister: () => void;
}

export default function RegisterCredentialsStep({
  role,
  setCompanyName,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  emailVerified,
  setEmailVerified,
  onVerificationTokenChange,
  errorMessage,
  onSubmit,
  onBack: _onBack,
  onGoogleRegister,
}: RegisterCredentialsStepProps) {
  const { toastSuccess, toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const isBrand = role === 'BRAND';
  const hasPublicDomain = isBrand && isPublicEmail(email);

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Send OTP
  const handleSendOtp = async () => {
    if (!fullName.trim()) {
      toastError('Please enter your name.', 'Name Required');
      return;
    }
    if (!email || !email.includes('@')) {
      toastError('Please enter a valid email address.', 'Invalid Email');
      return;
    }
    if (hasPublicDomain) {
      toastError(
        'Brands must register using an official work email (example: manager@zerify.in).',
        'Official Work Email Required',
      );
      return;
    }
    if (!password || password.length < 6) {
      toastError('Password must be at least 6 characters.', 'Password Required');
      return;
    }

    setSendingOtp(true);
    setDevCode(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/auth/send-verification-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(msg || 'Failed to send verification code. Please try again.');
      }

      setOtpSent(true);
      toastSuccess(data.message || `Verification code sent to ${email}!`, 'Code Sent');
      if (process.env.NODE_ENV !== 'production' && data.devCode) {
        setDevCode(data.devCode);
      }
      setResendCountdown(60);
    } catch (err: any) {
      toastError(err.message || 'Error sending code.', 'Sending Failed');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      toastError('Please enter the 6-digit verification code.', 'Code Required');
      return;
    }

    setVerifyingOtp(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otpCode.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(msg || 'Invalid verification code. Please check and try again.');
      }

      setEmailVerified(true);
      setOtpSent(false);
      toastSuccess('Email verified successfully! You can now proceed.', 'Email Verified');
      if (onVerificationTokenChange) {
        onVerificationTokenChange(data.verificationToken);
      }
    } catch (err: any) {
      toastError(err.message || 'Verification failed. Please check the code.', 'Verification Error');
    } finally {
      setVerifyingOtp(false);
    }
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
      <div className="text-center mb-2">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
          Create Your <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">Credentials</span>
        </h2>
      </div>

      {/* Business Email Verified Badge Note Banner (For Brand role only) */}
      {role === 'BRAND' && (
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-3 shadow-inner backdrop-blur-md">
          <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <p className="leading-snug">
            Brands must register using an official <span className="font-bold text-white">work email</span> (example: manager@zerify.in) to receive their verification badge.
          </p>
        </div>
      )}

      <AuthAlert message={errorMessage} />

      <form
        onSubmit={(e) => {
          if (!emailVerified) {
            e.preventDefault();
            if (otpSent) {
              handleVerifyOtp();
            } else {
              handleSendOtp();
            }
          } else {
            onSubmit(e);
          }
        }}
        className="space-y-4"
      >
        {/* 1. Your Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Your Name</label>
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setCompanyName(e.target.value);
              }}
              placeholder="e.g. Jane Doe"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* 2. Email Address */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              {role === 'BRAND' ? 'Official Work Email' : 'Email Address'}
            </label>
            {emailVerified && (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="email"
              required
              disabled={emailVerified}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailVerified) setEmailVerified(false);
                if (otpSent) setOtpSent(false);
              }}
              placeholder={role === 'BRAND' ? 'manager@zerify.in' : 'jane@creator.com'}
              className={`w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-slate-950/70 border text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner disabled:opacity-75 ${
                emailVerified
                  ? 'border-emerald-500/40 focus:border-emerald-500'
                  : 'border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
              }`}
            />
            {emailVerified && (
              <button
                type="button"
                onClick={() => {
                  setEmailVerified(false);
                  setOtpSent(false);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-300 hover:text-purple-200 underline cursor-pointer"
              >
                Change
              </button>
            )}
          </div>
        </div>

        {/* 3. Set Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">Set Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4. OTP Verification Box (Opens just below Password) */}
        <AnimatePresence>
          {otpSent && !emailVerified && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 backdrop-blur-xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    <span>Enter 6-Digit Verification Code</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Sent to your email</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                    }}
                    placeholder="••••••"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950/90 border border-purple-500/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 text-center font-mono text-lg font-black tracking-[0.5em] text-white placeholder-slate-600 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Dev Code Quick Auto-fill Chip */}
                {devCode && (
                  <button
                    type="button"
                    onClick={() => setOtpCode(devCode)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-[11px] font-bold text-purple-300 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>Dev OTP: <span className="font-mono text-white tracking-widest">{devCode}</span> (Click to Paste)</span>
                  </button>
                )}

                {/* Resend Code Button & Countdown */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400">Didn&apos;t receive the code?</span>
                  <button
                    type="button"
                    disabled={resendCountdown > 0 || sendingOtp}
                    onClick={handleSendOtp}
                    className="text-purple-400 hover:text-purple-300 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    {sendingOtp ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span>
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Email Verified Confirmation Badge */}
          {emailVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between shadow-inner"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-semibold">
                  {role === 'BRAND' ? 'Official Work Email Verified' : 'Email Verified Successfully'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400/70 font-mono">Ready to proceed</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. Primary Action Button */}
        {!emailVerified ? (
          !otpSent ? (
            <button
              type="button"
              disabled={sendingOtp}
              onClick={handleSendOtp}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60"
            >
              {sendingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Verify Email</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={verifyingOtp || otpCode.length !== 6}
              onClick={handleVerifyOtp}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Code</span>
                </>
              )}
            </button>
          )
        ) : (
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <span>Continue to Profile Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Social Registration Divider & Button */}
      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative px-3 bg-slate-900/90 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Or Quick Signup
        </span>
      </div>

      <AuthGoogleButton onClick={onGoogleRegister} label="Continue with Google" />
    </motion.div>
  );
}
